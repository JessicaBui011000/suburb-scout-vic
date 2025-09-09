/*
In-memory TTL cache utilities for server runtime.
- process-lifetime caches for datasets
- request/provider caches with TTLs
*/

export interface CacheEntry<T> {
	value: T;
	expiresAt: number; // epoch ms
}

export class TTLCache<K, V> {
	private store = new Map<K, CacheEntry<V>>();

	constructor(private defaultTtlMs: number) {}

	get(key: K): V | undefined {
		const entry = this.store.get(key);
		if (!entry) return undefined;
		if (Date.now() > entry.expiresAt) {
			this.store.delete(key);
			return undefined;
		}
		return entry.value;
	}

	set(key: K, value: V, ttlMs?: number): void {
		const expiresAt = Date.now() + (ttlMs ?? this.defaultTtlMs);
		this.store.set(key, { value, expiresAt });
	}

	has(key: K): boolean {
		return this.get(key) !== undefined;
	}

	clear(): void {
		this.store.clear();
	}
}

export const day = 24 * 60 * 60 * 1000;
export const sixHours = 6 * 60 * 60 * 1000;

// Global singleton caches (process-lifetime)
export const datasetCache = new TTLCache<string, unknown>(365 * day);
export const providerCache = {
	autocomplete: new TTLCache<string, unknown>(day),
	geocode: new TTLCache<string, unknown>(day),
	distance: new TTLCache<string, unknown>(sixHours),
	lifestyle: new TTLCache<string, unknown>(day),
};

export function getEnvMissingKeys(): string[] {
	const missing: string[] = [];
	if (!process.env.MAPBOX_TOKEN) missing.push("MAPBOX_TOKEN");
	if (!process.env.GOOGLE_MAPS_API_KEY) missing.push("GOOGLE_MAPS_API_KEY");
	if (!process.env.FOURSQUARE_API_KEY) missing.push("FOURSQUARE_API_KEY");
	return missing;
}
