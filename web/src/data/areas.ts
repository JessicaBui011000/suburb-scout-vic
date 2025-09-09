import { LatLng } from "@/types";

export interface CandidateArea {
	id: string;
	name: string;
	centroid: LatLng;
}

// Sample Melbourne areas; replace with GeoJSON-backed catalog later
export const CANDIDATE_AREAS: CandidateArea[] = [
	{ id: "fitzroy", name: "Fitzroy", centroid: { lat: -37.7984, lng: 144.9781 } },
	{ id: "carlton", name: "Carlton", centroid: { lat: -37.8000, lng: 144.9667 } },
	{ id: "richmond", name: "Richmond", centroid: { lat: -37.8182, lng: 145.0067 } },
	{ id: "st_kilda", name: "St Kilda", centroid: { lat: -37.8676, lng: 144.9809 } },
	{ id: "brunswick", name: "Brunswick", centroid: { lat: -37.7650, lng: 144.9612 } },
	{ id: "south_yarra", name: "South Yarra", centroid: { lat: -37.8386, lng: 144.9926 } },
	{ id: "docklands", name: "Docklands", centroid: { lat: -37.8141, lng: 144.9425 } },
];
