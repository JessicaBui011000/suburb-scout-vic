import { providerCache, sixHours } from "@/lib/cache";
import { haversineKm, approxDrivingMinutes } from "@/lib/geo";
import { TransportMode } from "@/types";

function toGoogleMode(mode: TransportMode): "driving" | "transit" | "walking" {
	if (mode === "driving") return "driving";
	if (mode === "public transport") return "transit";
	return "walking";
}

export async function getTravelMinutes(
	origin: { lat: number; lng: number },
	destination: { lat: number; lng: number },
	mode: TransportMode
): Promise<number | null> {
	const key = process.env.GOOGLE_MAPS_API_KEY;
	const cacheKey = `gdist:${mode}:${origin.lat},${origin.lng}->${destination.lat},${destination.lng}`;
	const cached = providerCache.distance.get(cacheKey) as number | undefined;
	if (cached !== undefined) return cached;

	if (!key) {
		const km = haversineKm(origin.lat, origin.lng, destination.lat, destination.lng);
		let minutes: number;
		if (mode === "driving") minutes = approxDrivingMinutes(km);
		else if (mode === "walking") minutes = Math.round((km / 4.5) * 60);
		else minutes = Math.round((km / 18) * 60); // public transport heuristic ~18 km/h average including transfers
		providerCache.distance.set(cacheKey, minutes, sixHours);
		return minutes;
	}

	const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
	url.searchParams.set("origins", `${origin.lat},${origin.lng}`);
	url.searchParams.set("destinations", `${destination.lat},${destination.lng}`);
	url.searchParams.set("mode", toGoogleMode(mode));
	url.searchParams.set("departure_time", "now");
	url.searchParams.set("key", key);

	const res = await fetch(url.toString());
	if (!res.ok) return null;
	const data = await res.json();
	const element = data.rows?.[0]?.elements?.[0];
	if (!element || element.status !== "OK") return null;
	const seconds = element.duration_in_traffic?.value ?? element.duration?.value;
	if (typeof seconds !== "number") return null;
	const minutes = Math.round(seconds / 60);
	providerCache.distance.set(cacheKey, minutes, sixHours);
	return minutes;
}
