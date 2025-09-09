import { Area, UserRequest } from "@/types";

export interface TopsisItem {
	id: string;
	values: {
		rentWeekly?: number | null;
		commuteMin?: number | null;
		safetyPct?: number | null;
		lifestyleCount?: number | null;
	};
}

function minMaxNormalize(values: (number | null | undefined)[], invert = false): (number | null)[] {
	const nums = values.filter((v): v is number => typeof v === "number");
	if (nums.length === 0) return values.map(() => null);
	const min = Math.min(...nums);
	const max = Math.max(...nums);
	return values.map((v) => {
		if (v == null) return null;
		if (max === min) return 0.5; // avoid div by zero; neutral
		const norm = (v - min) / (max - min);
		return invert ? 1 - norm : norm;
	});
}

export function rankAreasWithTopsis(items: TopsisItem[], req: UserRequest): { scoreById: Record<string, number> } {
	const weightsRaw = req.weights;
	const weightSum = weightsRaw.rent + weightsRaw.commute + weightsRaw.safety + weightsRaw.lifestyle;
	const W = {
		rent: weightsRaw.rent / weightSum,
		commute: weightsRaw.commute / weightSum,
		safety: weightsRaw.safety / weightSum,
		lifestyle: weightsRaw.lifestyle / weightSum,
	};

	const rentNorm = minMaxNormalize(items.map((i) => i.values.rentWeekly), true);
	const commuteNorm = minMaxNormalize(items.map((i) => i.values.commuteMin), true);
	const safetyNorm = minMaxNormalize(items.map((i) => i.values.safetyPct), false);
	const lifestyleNorm = minMaxNormalize(items.map((i) => i.values.lifestyleCount), false);

	const vectors = items.map((i, idx) => {
		const vals: (number | null)[] = [rentNorm[idx], commuteNorm[idx], safetyNorm[idx], lifestyleNorm[idx]];
		const present = vals.map((v) => v != null);
		let w = [W.rent, W.commute, W.safety, W.lifestyle];
		const sumPresent = w.reduce((acc, wi, j) => acc + (present[j] ? wi : 0), 0);
		if (sumPresent === 0) w = [0.25, 0.25, 0.25, 0.25];
		else w = w.map((wi, j) => (present[j] ? wi / sumPresent : 0));
		const weighted = vals.map((v, j) => (v == null ? 0 : v * w[j]));
		return { id: i.id, vec: weighted };
	});

	const idealBest = [0, 1, 2, 3].map((j) => Math.max(...vectors.map((v) => v.vec[j])));
	const idealWorst = [0, 1, 2, 3].map((j) => Math.min(...vectors.map((v) => v.vec[j])));

	const scores = vectors.map(({ id, vec }) => {
		const dPlus = Math.sqrt(vec.reduce((acc, v, j) => acc + (v - idealBest[j]) ** 2, 0));
		const dMinus = Math.sqrt(vec.reduce((acc, v, j) => acc + (v - idealWorst[j]) ** 2, 0));
		const closeness = dPlus + dMinus === 0 ? 0 : dMinus / (dPlus + dMinus);
		return { id, score: closeness };
	});

	const scoreById: Record<string, number> = {};
	scores.forEach((s) => (scoreById[s.id] = s.score));
	return { scoreById };
}
