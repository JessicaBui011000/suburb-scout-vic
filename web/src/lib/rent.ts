import fs from "fs";
import path from "path";
import { datasetCache } from "@/lib/cache";
import type { HomeType } from "@/types";
import { RENT_BY_AREA } from "@/data/rent.mock";

export interface VicRentRow {
	area_id: string;
	area_name: string;
	region_code?: string;
	dwelling_type: "unit" | "house";
	bedrooms: string;
	median_weekly_rent: number;
	period_end: string;
}

export type VicRentIndex = {
	byArea: Map<string, VicRentRow[]>;
	byRegion: Map<string, VicRentRow[]>;
	byName: Map<string, VicRentRow[]>; // normalized lower-case area_name
};

const BEDROOM_SCALERS: Record<string, number> = {
	"unit:0": 0.78,
	"unit:1": 0.90,
	"unit:2": 1.00,
	"unit:3": 1.18,
	"house:all": 1.00,
	"house:2": 1.00,
	"house:3": 1.10,
	"house:4+": 1.22,
};

const METHOD_COUNTS: Record<string, number> = { exact: 0, area_fallback: 0, region_fallback: 0, estimated: 0, mock: 0 };

function parseCsv(content: string): VicRentRow[] {
	const lines = content.split(/\r?\n/).filter((l) => l.trim().length);
	const header = lines.shift();
	if (!header) return [];
	const cols = header.split(",");
	const idx = (name: string) => cols.indexOf(name);
	const rows: VicRentRow[] = [];
	for (const line of lines) {
		const parts = line.split(",");
		const row: VicRentRow = {
			area_id: parts[idx("area_id")] ?? "",
			area_name: parts[idx("area_name")] ?? "",
			region_code: parts[idx("region_code")] ?? undefined,
			dwelling_type: (parts[idx("dwelling_type")] as any) ?? "unit",
			bedrooms: parts[idx("bedrooms")] ?? "all",
			median_weekly_rent: Number(parts[idx("median_weekly_rent")] ?? "0"),
			period_end: parts[idx("period_end")] ?? new Date().toISOString().slice(0, 10),
		};
		rows.push(row);
	}
	return rows;
}

function normName(n?: string): string {
	return (n ?? "").trim().toLowerCase();
}

export async function loadVicRentDataset(): Promise<VicRentIndex | null> {
	const cacheKey = "dataset:vic_rent_index";
	const cached = datasetCache.get(cacheKey) as VicRentIndex | null;
	if (cached) return cached;
	try {
		const csvPath = process.env.VIC_RENT_CSV || path.join(process.cwd(), "public", "data", "vic_rent.csv");
		if (!fs.existsSync(csvPath)) return null;
		const content = fs.readFileSync(csvPath, "utf-8");
		const rows = parseCsv(content);
		const byArea = new Map<string, VicRentRow[]>();
		const byRegion = new Map<string, VicRentRow[]>();
		const byName = new Map<string, VicRentRow[]>();
		for (const r of rows) {
			if (r.area_id) {
				if (!byArea.has(r.area_id)) byArea.set(r.area_id, []);
				byArea.get(r.area_id)!.push(r);
			}
			if (r.region_code) {
				if (!byRegion.has(r.region_code)) byRegion.set(r.region_code, []);
				byRegion.get(r.region_code)!.push(r);
			}
			const nn = normName(r.area_name);
			if (nn) {
				if (!byName.has(nn)) byName.set(nn, []);
				byName.get(nn)!.push(r);
			}
		}
		const index: VicRentIndex = { byArea, byRegion, byName };
		datasetCache.set(cacheKey, index);
		return index;
	} catch {
		return null;
	}
}

function mapHomeTypeToQueries(homeType?: HomeType): { dwelling: "unit" | "house"; bedrooms: string }[] {
	if (!homeType) return [ { dwelling: "unit", bedrooms: "all" }, { dwelling: "house", bedrooms: "all" } ];
	switch (homeType) {
		case "studio":
			return [ { dwelling: "unit", bedrooms: "0" }, { dwelling: "unit", bedrooms: "1" }, { dwelling: "unit", bedrooms: "all" } ];
		case "1 bed apartment":
			return [ { dwelling: "unit", bedrooms: "1" }, { dwelling: "unit", bedrooms: "all" } ];
		case "2 bed apartment":
			return [ { dwelling: "unit", bedrooms: "2" }, { dwelling: "unit", bedrooms: "all" } ];
		case "3 bed apartment":
			return [ { dwelling: "unit", bedrooms: "3" }, { dwelling: "unit", bedrooms: "all" } ];
		case "townhouse":
			return [ { dwelling: "house", bedrooms: "2" }, { dwelling: "house", bedrooms: "3" }, { dwelling: "house", bedrooms: "all" } ];
		case "house":
			return [ { dwelling: "house", bedrooms: "all" } ];
	}
}

function findMatch(rows: VicRentRow[] | undefined, queries: { dwelling: "unit" | "house"; bedrooms: string }[]): VicRentRow | null {
	if (!rows) return null;
	for (const q of queries) {
		const exact = rows.find((r) => r.dwelling_type === q.dwelling && r.bedrooms === q.bedrooms);
		if (exact) return exact;
	}
	for (const q of queries) {
		const any = rows.find((r) => r.dwelling_type === q.dwelling && r.bedrooms === "all");
		if (any) return any;
	}
	return null;
}

function findByFuzzyName(index: VicRentIndex | null, name?: string): VicRentRow[] | undefined {
	if (!index || !name) return undefined;
	const n = normName(name);
	if (!n) return undefined;
	const direct = index.byName.get(n);
	if (direct && direct.length) return direct;
	// substring includes in either direction
	const candidates: VicRentRow[] = [];
	for (const [key, rows] of index.byName.entries()) {
		if (key.includes(n) || n.includes(key)) candidates.push(...rows);
	}
	return candidates.length ? candidates : undefined;
}

function estimateFromAll(base: VicRentRow, targetBedrooms: string): number | null {
	const key = `${base.dwelling_type}:${targetBedrooms}`;
	const scaler = BEDROOM_SCALERS[key];
	if (!scaler) return null;
	return Math.round(base.median_weekly_rent * scaler);
}

function labelPeriod(row?: VicRentRow): string {
	if (!row?.period_end) return new Date().toISOString().slice(0, 10);
	return row.period_end;
}

export async function getRentForArea(areaId: string, regionCode: string | undefined, homeType?: HomeType, areaName?: string): Promise<{ rentWeekly: number | null; date: string; method: string; name: string }> {
	const index = await loadVicRentDataset();
	const queries = mapHomeTypeToQueries(homeType);

	// 1) exact by area id
	let row = findMatch(index?.byArea.get(areaId), queries);
	if (row) { METHOD_COUNTS.exact++; return { rentWeekly: row.median_weekly_rent, date: labelPeriod(row), method: "exact", name: "DFFH Rental Report 2025-Q1" }; }

	// 1b) exact by area name (fuzzy)
	if (areaName) {
		const rowsByName = findByFuzzyName(index!, areaName);
		row = findMatch(rowsByName, queries);
		if (row) { METHOD_COUNTS.exact++; return { rentWeekly: row.median_weekly_rent, date: labelPeriod(row), method: "exact", name: "DFFH Rental Report 2025-Q1" }; }
	}

	// 2) area_fallback (all) by id or name
	row = findMatch(index?.byArea.get(areaId), [{ dwelling: queries[0].dwelling, bedrooms: "all" }]);
	if (row) { METHOD_COUNTS.area_fallback++; return { rentWeekly: row.median_weekly_rent, date: labelPeriod(row), method: "area_fallback", name: "DFFH Rental Report 2025-Q1" }; }
	if (areaName) {
		const rowsByName = findByFuzzyName(index!, areaName);
		row = findMatch(rowsByName, [{ dwelling: queries[0].dwelling, bedrooms: "all" }]);
		if (row) { METHOD_COUNTS.area_fallback++; return { rentWeekly: row.median_weekly_rent, date: labelPeriod(row), method: "area_fallback", name: "DFFH Rental Report 2025-Q1" }; }
	}

	// 3) region_fallback
	if (regionCode) {
		row = findMatch(index?.byRegion.get(regionCode), queries);
		if (row) { METHOD_COUNTS.region_fallback++; return { rentWeekly: row.median_weekly_rent, date: labelPeriod(row), method: "region_fallback", name: "DFFH Rental Report 2025-Q1" }; }
		row = findMatch(index?.byRegion.get(regionCode), [{ dwelling: queries[0].dwelling, bedrooms: "all" }]);
		if (row) { METHOD_COUNTS.region_fallback++; return { rentWeekly: row.median_weekly_rent, date: labelPeriod(row), method: "region_fallback", name: "DFFH Rental Report 2025-Q1" }; }
	}

	// 4) estimated from dwelling all (area by id or name)
	if (index) {
		const areaRows = index.byArea.get(areaId) ?? (areaName ? findByFuzzyName(index, areaName) : undefined);
		const anyUnitAll = areaRows?.find((r) => r.dwelling_type === "unit" && r.bedrooms === "all");
		const anyHouseAll = areaRows?.find((r) => r.dwelling_type === "house" && r.bedrooms === "all");
		const base = anyUnitAll || anyHouseAll;
		if (base) {
			const targetBedrooms = queries[0].bedrooms;
			const est = estimateFromAll(base, targetBedrooms);
			if (est != null) { METHOD_COUNTS.estimated++; return { rentWeekly: est, date: labelPeriod(base), method: "estimated", name: "DFFH Rental Report 2025-Q1" }; }
		}
	}

	// 5) mock
	const mock = RENT_BY_AREA[areaId];
	if (mock) { METHOD_COUNTS.mock++; return { rentWeekly: mock.rentWeekly, date: mock.date, method: "mock", name: "VIC Median Rent (mock)" }; }
	METHOD_COUNTS.mock++;
	return { rentWeekly: null, date: new Date().toISOString().slice(0, 10), method: "mock", name: "VIC Median Rent (mock)" };
}

if (process.env.NODE_ENV !== "production") {
	process.on("beforeExit", () => {
		console.log("[vic-rent loader] method counts:", METHOD_COUNTS);
	});
}
