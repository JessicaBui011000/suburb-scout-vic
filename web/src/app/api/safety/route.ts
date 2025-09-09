import { NextResponse } from "next/server";
import { datasetCache } from "@/lib/cache";
import { SAFETY_BY_AREA } from "@/data/safety.mock";

export async function GET() {
	const cacheKey = "dataset:safety";
	let data = datasetCache.get(cacheKey) as any;
	if (!data) {
		data = SAFETY_BY_AREA;
		datasetCache.set(cacheKey, data);
	}
	return NextResponse.json(data, { headers: { "Cache-Control": "public, s-maxage=31536000, immutable" } });
}
