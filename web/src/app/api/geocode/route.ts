import { NextRequest, NextResponse } from "next/server";
import { mapboxGeocode } from "@/lib/providers/mapbox";

export async function POST(req: NextRequest) {
	try {
		const { query } = await req.json();
		if (!query || typeof query !== "string") {
			return NextResponse.json({ error: "invalid_query" }, { status: 400 });
		}
		const geo = await mapboxGeocode(query);
		if (!geo) return NextResponse.json({ error: "geocode_failed" }, { status: 502 });
		const warning = geo.confidence < 0.5 ? "low_confidence" : undefined;
		return NextResponse.json({ ...geo, warning }, { headers: { "Cache-Control": "public, s-maxage=86400" } });
	} catch (err) {
		return NextResponse.json({ error: "geocode_failed" }, { status: 502 });
	}
}
