import { providerCache, day } from "@/lib/cache";

export async function getLifestyleCount(
	lat: number,
	lng: number,
	categories: string[]
): Promise<{ count: number; date: string } | null> {
	const key = process.env.FOURSQUARE_API_KEY;
	const cacheKey = `fsq:${lat},${lng}:${categories.sort().join(',')}`;
	const cached = providerCache.lifestyle.get(cacheKey) as any;
	if (cached) return cached;

	if (!key) {
		const mockCount = Math.max(5, Math.round(50 - Math.abs(lat % 1) * 50));
		const mock = { count: mockCount, date: new Date().toISOString().slice(0, 10) };
		providerCache.lifestyle.set(cacheKey, mock, day);
		return mock;
	}

	const url = new URL("https://api.foursquare.com/v3/places/search");
	url.searchParams.set("ll", `${lat},${lng}`);
	url.searchParams.set("categories", categories.join(","));
	url.searchParams.set("radius", "1000");
	url.searchParams.set("limit", "50");

	const res = await fetch(url.toString(), {
		headers: { Authorization: key },
	});
	if (!res.ok) return null;
	const data = await res.json();
	const count = (data.results?.length as number) ?? 0;
	const result = { count, date: new Date().toISOString().slice(0, 10) };
	providerCache.lifestyle.set(cacheKey, result, day);
	return result;
}
