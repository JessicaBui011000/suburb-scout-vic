export type TransportMode = "driving" | "public transport" | "walking";

export type HomeType =
	| "1 bed apartment"
	| "2 bed apartment"
	| "3 bed apartment"
	| "studio"
	| "townhouse"
	| "house";

export type MustHave = "Cafe" | "Gym" | "Grocery" | "Park";

export interface UserRequest {
	address: string;
	commuteMax: number; // minutes; UI snaps in 10s
	transportModes: TransportMode[]; // 1–3
	budget?: number; // AUD/week; UI snaps in 25s
	homeType?: HomeType;
	mustHaves?: MustHave[];
	weights: { rent: number; commute: number; safety: number; lifestyle: number };
}

export interface LatLng {
	lat: number;
	lng: number;
}

export interface SourceMeta {
	name: string;
	date: string; // ISO date string
	method?: string;
}

export interface AreaMetrics {
	rentWeekly: number | null; // AUD/wk
	safetyPct: number | null; // 0–100; higher = safer
	lifestyleCount: number | null;
	commuteMin: number | null; // best/min across selected modes
	commuteByMode?: { driving?: number | null; publicTransport?: number | null; walking?: number | null };
	sources: {
		rent: SourceMeta;
		safety: SourceMeta;
		lifestyle: SourceMeta;
		commute: SourceMeta;
	};
}

export interface Area {
	id: string;
	name: string;
	centroid: LatLng;
	metrics: AreaMetrics;
	score: number; // 0–1 internal TOPSIS
	fitScore: number; // 0–100 rounded
	fitSummary: string; // deterministic one-sentence reason
}

export interface CompanyGeocodeResult extends LatLng {
	normalizedAddress: string;
	confidence: number; // 0..1
	warning?: "low_confidence";
}

export interface SuggestResponse {
	company: CompanyGeocodeResult;
	areas: Area[]; // 3–5
	warnings?: string[]; // e.g., "low_confidence_geocode", "commute_unavailable"
	debug?: { totalCandidates: number; filteredByCommute?: number; returned?: number; firstFiveCandidates?: string[] };
	meta?: { disclaimer?: { safety: string } };
}

export interface AutocompleteSuggestion {
	label: string;
	placeId: string;
	lat?: number;
	lng?: number;
	normalizedAddress?: string;
	confidence?: number;
}

export interface AutocompleteResponse {
	suggestions: AutocompleteSuggestion[];
}
