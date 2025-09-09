import crypto from "crypto";

function sortKeys(obj: any): any {
	if (Array.isArray(obj)) return obj.map(sortKeys);
	if (obj && typeof obj === "object") {
		return Object.keys(obj)
			.sort()
			.reduce((acc: Record<string, any>, key) => {
				acc[key] = sortKeys(obj[key]);
				return acc;
			}, {} as Record<string, any>);
	}
	return obj;
}

export function stableStringify(value: unknown): string {
	return JSON.stringify(sortKeys(value as any));
}

export function requestHash(value: unknown): string {
	const s = typeof value === "string" ? value : stableStringify(value);
	return crypto.createHash("sha256").update(s).digest("hex").slice(0, 16);
}
