import { providerCache, day } from "@/lib/cache";

const MAPBOX_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places";

export interface MapboxFeature {
	place_name: string;
	center: [number, number];
	relevance?: number;
}

async function nominatimSearch(query: string, limit = 5): Promise<{ label: string; lat: number; lng: number }[]> {
	const url = new URL("https://nominatim.openstreetmap.org/search");
	url.searchParams.set("q", query);
	url.searchParams.set("format", "jsonv2");
	url.searchParams.set("limit", String(limit));
	const res = await fetch(url.toString(), { headers: { "User-Agent": "APD-Demo/1.0" } });
	if (!res.ok) return [];
	const data = await res.json();
	return (Array.isArray(data) ? data : []).map((d: any) => ({ label: d.display_name as string, lat: parseFloat(d.lat), lng: parseFloat(d.lon) }));
}

export async function mapboxAutocomplete(query: string): Promise<{ label: string; placeId: string }[]> {
	const token = process.env.MAPBOX_TOKEN;
	const cacheKey = `mb_auto:${query}`;
	const cached = providerCache.autocomplete.get(cacheKey) as any;
	if (cached) return cached;

	if (!token) {
		const nomi = await nominatimSearch(query, 5);
		const mapped = nomi.map((n, idx) => ({ label: n.label, placeId: `osm-${idx}` }));
		providerCache.autocomplete.set(cacheKey, mapped, day);
		return mapped;
	}

	const url = `${MAPBOX_URL}/${encodeURIComponent(query)}.json?access_token=${token}&autocomplete=true&limit=5`;
	const res = await fetch(url);
	if (!res.ok) {
		return [];
	}
	const data = await res.json();
	const suggestions = (data.features as MapboxFeature[]).map((f, i) => ({
		label: f.place_name,
		placeId: String(i),
	}));
	providerCache.autocomplete.set(cacheKey, suggestions, day);
	return suggestions;
}

export async function mapboxGeocode(query: string): Promise<{ lat: number; lng: number; normalizedAddress: string; confidence: number } | null> {
	const token = process.env.MAPBOX_TOKEN;
	const cacheKey = `mb_geo:${query}`;
	const cached = providerCache.geocode.get(cacheKey) as any;
	if (cached) return cached;

	if (!token) {
		const nomi = await nominatimSearch(query, 1);
		const first = nomi[0];
		if (!first) return null;
		const mock = {
			lat: first.lat,
			lng: first.lng,
			normalizedAddress: first.label,
			confidence: 0.7,
		};
		providerCache.geocode.set(cacheKey, mock, day);
		return mock;
	}
	const url = `${MAPBOX_URL}/${encodeURIComponent(query)}.json?access_token=${token}&limit=1`;
	const res = await fetch(url);
	if (!res.ok) return null;
	const data = await res.json();
	const feature = (data.features as MapboxFeature[])[0];
	if (!feature) return null;
	const result = {
		lat: feature.center[1],
		lng: feature.center[0],
		normalizedAddress: feature.place_name,
		confidence: feature.relevance ?? 0.7,
	};
	providerCache.geocode.set(cacheKey, result, day);
	return result;
}
