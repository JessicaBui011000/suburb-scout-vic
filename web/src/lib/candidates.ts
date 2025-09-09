import { haversineKm } from "@/lib/geo";
import type { LatLng } from "@/types";
import { SUBURBS } from "@/data/catalog";

export const USE_ISOCHRONE_PREFILTER = false; // Plan A flag (scaffold only)

export interface Candidate { id: string; name: string; centroid: LatLng; regionCode?: string }

export function getCandidatesPlanB(center: LatLng): Candidate[] {
	const search = (R: number, K: number) =>
		SUBURBS
			.map((a) => ({ a, d: haversineKm(center.lat, center.lng, a.centroid.lat, a.centroid.lng) }))
			.filter(({ d }) => d <= R)
			.sort((x, y) => x.d - y.d)
			.slice(0, K)
			.map(({ a }) => ({ id: a.id, name: a.name, centroid: a.centroid, regionCode: a.regionCode }));

	let list = search(20, 40);
	if (list.length < 20) list = search(25, 80);
	if (list.length < 10) list = search(30, 120);
	return list;
}

// Plan A stub — Mapbox Isochrone prefilter (NOT ACTIVE)
// TODOs:
// - For each selected mode, request isochrones at (commuteMax + 10min)
// - Union polygons; include candidate areas whose centroid/polygon intersects union
// - Geometry simplification to reduce CPU
// - Rate limiting handling and provider-specific caching
export async function getCandidates(center: LatLng): Promise<Candidate[]> {
	if (USE_ISOCHRONE_PREFILTER) {
		// TODO: call Mapbox Isochrone and prefilter
		return getCandidatesPlanB(center);
	}
	return getCandidatesPlanB(center);
}

