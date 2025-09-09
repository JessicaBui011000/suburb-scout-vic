import { NextResponse } from "next/server";
import { datasetCache } from "@/lib/cache";
import { RENT_BY_AREA } from "@/data/rent.mock";
import { loadVicRentDataset } from "@/lib/rent";

export async function GET() {
	const cacheKey = "dataset:rent_index_or_mock";
	let data = datasetCache.get(cacheKey) as any;
	if (!data) {
		const index = await loadVicRentDataset();
		if (index) data = { type: "vic_index", count: index.byArea.size };
		else data = { type: "mock", map: RENT_BY_AREA };
		datasetCache.set(cacheKey, data);
	}
	return NextResponse.json(data, { headers: { "Cache-Control": "public, s-maxage=31536000, immutable" } });
}
