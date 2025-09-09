import { NextRequest, NextResponse } from "next/server";
import { mapboxAutocomplete } from "@/lib/providers/mapbox";
import { AutocompleteResponse } from "@/types";

export async function POST(req: NextRequest) {
	try {
		const { query } = await req.json();
		if (!query || typeof query !== "string") {
			return NextResponse.json({ suggestions: [] } as AutocompleteResponse);
		}
		const suggestions = await mapboxAutocomplete(query);
		const payload: AutocompleteResponse = { suggestions };
		return NextResponse.json(payload, { headers: { "Cache-Control": "public, s-maxage=86400" } });
	} catch (err) {
		return NextResponse.json({ suggestions: [] } as AutocompleteResponse, { status: 200 });
	}
}
