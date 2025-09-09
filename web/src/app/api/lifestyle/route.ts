import { NextRequest, NextResponse } from "next/server";
import { getLifestyleCount } from "@/lib/providers/foursquare";
import { CANDIDATE_AREAS } from "@/data/areas";

export async function POST(req: NextRequest) {
	try {
		const { areaIds, categories } = await req.json();
		const ids: string[] = Array.isArray(areaIds) ? areaIds : [];
		const cats: string[] = Array.isArray(categories) ? categories : [];
		const areaMap = new Map(CANDIDATE_AREAS.map((a) => [a.id, a] as const));
		const result: Record<string, { count: number; date: string } | null> = {};
		await Promise.all(
			ids.map(async (id) => {
				const area = areaMap.get(id);
				if (!area) {
					result[id] = null;
					return;
				}
				const resp = await getLifestyleCount(area.centroid.lat, area.centroid.lng, cats);
				result[id] = resp;
			})
		);
		return NextResponse.json(result, { headers: { "Cache-Control": "public, s-maxage=86400" } });
	} catch (err) {
		return NextResponse.json({}, { status: 200 });
	}
}
