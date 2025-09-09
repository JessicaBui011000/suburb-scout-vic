export interface CatalogArea {
	id: string;
	name: string;
	centroid: { lat: number; lng: number };
	regionCode?: string; // SA2/LGA placeholder
}

export const SUBURBS: CatalogArea[] = [
	{ id: "melbourne_cbd", name: "Melbourne CBD", centroid: { lat: -37.8136, lng: 144.9631 }, regionCode: "206041122" },
	{ id: "docklands", name: "Docklands", centroid: { lat: -37.8141, lng: 144.9425 }, regionCode: "206041123" },
	{ id: "southbank", name: "Southbank", centroid: { lat: -37.8240, lng: 144.9650 }, regionCode: "206041124" },
	{ id: "carlton", name: "Carlton", centroid: { lat: -37.8000, lng: 144.9667 }, regionCode: "206041107" },
	{ id: "fitzroy", name: "Fitzroy", centroid: { lat: -37.7984, lng: 144.9781 }, regionCode: "206011008" },
	{ id: "brunswick", name: "Brunswick", centroid: { lat: -37.7650, lng: 144.9612 }, regionCode: "206011003" },
	{ id: "richmond", name: "Richmond", centroid: { lat: -37.8182, lng: 145.0067 }, regionCode: "206021110" },
	{ id: "prahran", name: "Prahran", centroid: { lat: -37.8520, lng: 144.9922 }, regionCode: "206021125" },
	{ id: "south_yarra", name: "South Yarra", centroid: { lat: -37.8386, lng: 144.9926 }, regionCode: "206021126" },
	{ id: "st_kilda", name: "St Kilda", centroid: { lat: -37.8676, lng: 144.9809 }, regionCode: "206041130" },
	{ id: "footscray", name: "Footscray", centroid: { lat: -37.8009, lng: 144.8996 }, regionCode: "206031107" },
	{ id: "sunshine", name: "Sunshine", centroid: { lat: -37.7790, lng: 144.8320 }, regionCode: "206031115" },
	{ id: "werribee", name: "Werribee", centroid: { lat: -37.9056, lng: 144.6576 }, regionCode: "206031139" },
	{ id: "glen_waverley", name: "Glen Waverley", centroid: { lat: -37.8771, lng: 145.1640 }, regionCode: "206061128" },
	{ id: "box_hill", name: "Box Hill", centroid: { lat: -37.8183, lng: 145.1250 }, regionCode: "206061112" },
	{ id: "doncaster", name: "Doncaster", centroid: { lat: -37.7881, lng: 145.1231 }, regionCode: "206061116" },
	{ id: "clayton", name: "Clayton", centroid: { lat: -37.9249, lng: 145.1190 }, regionCode: "206061109" },
	{ id: "dandenong", name: "Dandenong", centroid: { lat: -37.9884, lng: 145.2140 }, regionCode: "206071112" },
	{ id: "frankston", name: "Frankston", centroid: { lat: -38.1446, lng: 145.1229 }, regionCode: "206071115" },
	{ id: "essendon", name: "Essendon", centroid: { lat: -37.7477, lng: 144.9191 }, regionCode: "206011009" },
];

