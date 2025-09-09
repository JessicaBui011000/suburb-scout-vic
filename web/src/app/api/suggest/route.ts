import { NextRequest, NextResponse } from "next/server";
import { mapboxGeocode } from "@/lib/providers/mapbox";
import { getCandidates } from "@/lib/candidates";
import { getTravelMinutes } from "@/lib/providers/googleDistance";
import { rankAreasWithTopsis } from "@/lib/topsis";
import { requestHash } from "@/lib/hash";
import { TTLCache, sixHours } from "@/lib/cache";
import { Area, SuggestResponse, UserRequest } from "@/types";
import { SAFETY_BY_AREA } from "@/data/safety.mock";
import { getRentForArea } from "@/lib/rent";

const requestCache = new TTLCache<string, SuggestResponse>(sixHours);

function bestCommute(commuteByMode: Area["metrics"]["commuteByMode"] | undefined): { mode: string; minutes: number } | null {
	if (!commuteByMode) return null;
	let best: { mode: string; minutes: number } | null = null;
	for (const [mode, min] of Object.entries(commuteByMode)) {
		if (typeof min !== "number") continue;
		if (!best || min < best.minutes) best = { mode, minutes: min };
	}
	return best;
}

function clamp01(x: number) { return Math.max(0, Math.min(1, x)); }

function computeBudgetPenalty(budget: number | undefined, rent: number | null): { penalty: number; overPct?: number } {
	if (!budget || rent == null) return { penalty: 0 };
	const overshoot = Math.max(0, rent - budget);
	const undershoot = Math.max(0, budget - rent);
	const denom = Math.max(budget, 1);
	const overshoot_ratio = overshoot / denom;
	const undershoot_ratio = undershoot / denom;
	const penalty = clamp01(2.5 * overshoot_ratio + 0.5 * undershoot_ratio);
	const overPct = overshoot > 0 ? Math.round(100 * overshoot_ratio) : undefined;
	return { penalty, overPct };
}

export async function POST(req: NextRequest) {
	try {
		const body = (await req.json()) as UserRequest;
		const cacheKey = requestHash({
			address: body.address,
			commuteMax: body.commuteMax,
			transportModes: body.transportModes,
			budget: body.budget,
			homeType: body.homeType,
			mustHaves: body.mustHaves,
			weights: body.weights,
		});
		const cached = requestCache.get(cacheKey);
		if (cached) return NextResponse.json(cached);

		const company = await mapboxGeocode(body.address);
		if (!company) return NextResponse.json({ error: "geocode_failed" }, { status: 502 });
		const warnings: string[] = [];
		if (company.confidence < 0.5) warnings.push("low_confidence_geocode");

		let candidates = await getCandidates({ lat: company.lat, lng: company.lng });
		const totalCandidates = candidates.length;

		const areas: Area[] = [];
		let filteredByCommute = 0;

		await Promise.all(
			candidates.map(async (cand) => {
				const commuteByMode: Area["metrics"]["commuteByMode"] = {};
				for (const m of body.transportModes) {
					const minutes = await getTravelMinutes(cand.centroid, company, m);
					if (m === "driving") commuteByMode.driving = minutes;
					if (m === "public transport") commuteByMode.publicTransport = minutes;
					if (m === "walking") commuteByMode.walking = minutes;
				}
				const vals = Object.values(commuteByMode).filter((v): v is number => typeof v === "number");
				const commuteMin = vals.length ? Math.min(...vals) : null;
				if (commuteMin == null || commuteMin > body.commuteMax) {
					filteredByCommute++;
					return;
				}

				const rent = await getRentForArea(cand.id, cand.regionCode, body.homeType, cand.name);
				const safety = SAFETY_BY_AREA[cand.id];
				if (rent.method === "region_fallback") warnings.push("rent_region_fallback");
				if (rent.method === "estimated") warnings.push("rent_estimated");

				areas.push({
					id: cand.id,
					name: cand.name,
					centroid: cand.centroid,
					metrics: {
						rentWeekly: rent.rentWeekly,
						safetyPct: safety?.safetyPct ?? null,
						lifestyleCount: null,
						commuteMin,
						commuteByMode,
						sources: {
							rent: { name: rent.name, date: rent.date, method: rent.method },
							safety: { name: "CSA Victoria (mock)", date: safety?.date ?? "2024-05-15" },
							lifestyle: { name: "Foursquare (mock)", date: new Date().toISOString() },
							commute: { name: "Google Distance Matrix", date: new Date().toISOString() },
						},
					},
					score: 0,
					fitScore: 0,
					fitSummary: "",
				});
			})
		);

		if (areas.length === 0 && body.transportModes.length > 1) {
			const reduced = body.transportModes.filter((m) => m !== "public transport");
			if (reduced.length) {
				await Promise.all(
					candidates.map(async (cand) => {
						const commuteByMode: Area["metrics"]["commuteByMode"] = {};
						for (const m of reduced) {
							const minutes = await getTravelMinutes(cand.centroid, company, m);
							if (m === "driving") commuteByMode.driving = minutes;
							if (m === "walking") commuteByMode.walking = minutes;
						}
						const vals = Object.values(commuteByMode).filter((v): v is number => typeof v === "number");
						const commuteMin = vals.length ? Math.min(...vals) : null;
						if (commuteMin == null || commuteMin > body.commuteMax) return;
						const rent = await getRentForArea(cand.id, cand.regionCode, body.homeType, cand.name);
						const safety = SAFETY_BY_AREA[cand.id];
						areas.push({
							id: cand.id,
							name: cand.name,
							centroid: cand.centroid,
							metrics: {
								rentWeekly: rent.rentWeekly,
								safetyPct: safety?.safetyPct ?? null,
								lifestyleCount: null,
								commuteMin,
								commuteByMode,
								sources: {
									rent: { name: rent.name, date: rent.date, method: rent.method },
									safety: { name: "CSA Victoria (mock)", date: safety?.date ?? "2024-05-15" },
									lifestyle: { name: "Foursquare (mock)", date: new Date().toISOString() },
									commute: { name: "Google Distance Matrix", date: new Date().toISOString() },
								},
							},
							score: 0,
							fitScore: 0,
							fitSummary: "",
						});
					})
				);
			}
		}

		const tertiaryWeights = { rent: 0.40, commute: 0.30, safety: 0.18, lifestyle: 0.12 };
		const items = areas.map((a) => ({
			id: a.id,
			values: {
				rentWeekly: a.metrics.rentWeekly,
				commuteMin: a.metrics.commuteMin,
				safetyPct: a.metrics.safetyPct,
				lifestyleCount: a.metrics.lifestyleCount,
			},
		}));
		const { scoreById } = rankAreasWithTopsis(items, { ...body, weights: tertiaryWeights });

		areas.forEach((a) => {
			a.score = scoreById[a.id] ?? 0;
			a.fitScore = Math.round((a.score || 0) * 100);
			const { penalty, overPct } = computeBudgetPenalty(body.budget, a.metrics.rentWeekly);
			const best = bestCommute(a.metrics.commuteByMode);
			const summaryParts: string[] = [];
			if (overPct != null) summaryParts.push(`Over budget by ${overPct}%`);
			if (best) summaryParts.push(`Fast ${best.mode} commute (${best.minutes} min)`);
			if (summaryParts.length === 0) summaryParts.push("Balanced trade-offs");
			a.fitSummary = summaryParts.join(" + ");
			(a as any)._budgetPenalty = penalty;
			(a as any)._commutePenalty = a.metrics.commuteMin != null ? a.metrics.commuteMin / Math.max(body.commuteMax, 1) : 1;
		});

		areas.sort((a, b) => {
			const bpA = (a as any)._budgetPenalty as number;
			const bpB = (b as any)._budgetPenalty as number;
			if (bpA !== bpB) return bpA - bpB;
			const cpA = (a as any)._commutePenalty as number;
			const cpB = (b as any)._commutePenalty as number;
			if (cpA !== cpB) return cpA - cpB;
			return b.fitScore - a.fitScore;
		});

		const top = areas.slice(0, 5);
		const response: SuggestResponse = {
			company: { ...company, warning: company.confidence < 0.5 ? "low_confidence" : undefined },
			areas: top,
			warnings: warnings.length ? Array.from(new Set(warnings)) : undefined,
			debug: { totalCandidates, filteredByCommute, returned: top.length, firstFiveCandidates: candidates.slice(0, 5).map((c) => c.name) },
			meta: { disclaimer: { safety: "Safety is a percentile proxy derived from CSA statistics; it does not guarantee personal safety." } },
		};
		requestCache.set(cacheKey, response);
		return NextResponse.json(response);
	} catch (err) {
		return NextResponse.json({ error: "suggest_failed" }, { status: 500 });
	}
}
