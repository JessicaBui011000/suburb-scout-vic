"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import type { TransportMode, HomeType, MustHave, UserRequest, Area, AutocompleteSuggestion } from "@/types";

const TRANSPORT_OPTIONS: TransportMode[] = ["driving", "public transport", "walking"];
const HOME_TYPES: HomeType[] = ["1 bed apartment", "2 bed apartment", "3 bed apartment", "studio", "townhouse", "house"];
const MUSTS: MustHave[] = ["Cafe", "Gym", "Grocery", "Park"];

export function InputForm({ onResults }: { onResults: (data: { company: any; areas: Area[]; warnings?: string[]; debug?: any }) => void }) {
	const [address, setAddress] = useState("");
	const [budget, setBudget] = useState<number | undefined>(undefined);
	const [commuteMax, setCommuteMax] = useState(30);
	const [transport, setTransport] = useState<TransportMode[]>(["driving"]);
	const [homeType, setHomeType] = useState<HomeType | undefined>(undefined);
	const [musts, setMusts] = useState<MustHave[]>([]);
	const [weights, setWeights] = useState({ rent: 0.25, commute: 0.25, safety: 0.25, lifestyle: 0.25 });
	const [loading, setLoading] = useState(false);

	const [query, setQuery] = useState("");
	const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
	const [showSug, setShowSug] = useState(false);

	useEffect(() => {
		const id = setTimeout(async () => {
			if (!query.trim()) {
				setSuggestions([]);
				return;
			}
			try {
				const res = await fetch("/api/autocomplete", { method: "POST", body: JSON.stringify({ query }) });
				const data = await res.json();
				setSuggestions(data.suggestions ?? []);
			} catch {}
		}, 250);
		return () => clearTimeout(id);
	}, [query]);

	function normalizeWeights(w: typeof weights) {
		const total = w.rent + w.commute + w.safety + w.lifestyle;
		return { rent: w.rent / total, commute: w.commute / total, safety: w.safety / total, lifestyle: w.lifestyle / total };
	}

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		const body: UserRequest = {
			address,
			commuteMax,
			transportModes: transport,
			budget,
			homeType,
			mustHaves: musts,
			weights: normalizeWeights(weights),
		};
		const res = await fetch("/api/suggest", { method: "POST", body: JSON.stringify(body) });
		const data = await res.json();
		setLoading(false);
		onResults(data);
	}

	return (
		<form onSubmit={onSubmit} className="space-y-4 relative">
			<div className="grid gap-3 sm:grid-cols-2">
				<div className="relative">
					<Label>Company Address</Label>
					<Input placeholder="e.g., 525 Collins St, Melbourne" value={address} onChange={(e) => { setAddress(e.target.value); setQuery(e.target.value); setShowSug(true); }} onFocus={() => setShowSug(true)} />
					{showSug && suggestions.length > 0 && (
						<div className="absolute z-20 mt-1 w-full rounded-md border bg-white shadow">
							{suggestions.map((s) => (
								<button type="button" key={s.placeId} className="w-full text-left px-3 py-2 hover:bg-muted" onClick={() => { setAddress(s.label); setQuery(""); setSuggestions([]); setShowSug(false); }}>
									{s.label}
								</button>
							))}
						</div>
					)}
				</div>
				<div>
					<Label>Budget (AUD/week)</Label>
					<Input type="number" inputMode="numeric" placeholder="e.g., 600" value={budget ?? ""} onBlur={() => budget && setBudget(Math.round(budget / 25) * 25)} onChange={(e) => setBudget(e.target.value ? Number(e.target.value) : undefined)} />
					<div className="text-xs text-muted-foreground">increments of 25</div>
				</div>
				<div>
					<Label>Max Commute (min)</Label>
					<Input type="number" inputMode="numeric" value={commuteMax} onBlur={() => setCommuteMax(Math.round(commuteMax / 10) * 10)} onChange={(e) => setCommuteMax(Number(e.target.value))} />
					<div className="text-xs text-muted-foreground">increments of 10 min</div>
				</div>
				<div>
					<Label>Transport Modes</Label>
					<div className="flex gap-3 mt-2">
						{TRANSPORT_OPTIONS.map((m) => (
							<label key={m} className="flex items-center gap-2 text-sm">
								<Checkbox checked={transport.includes(m)} onCheckedChange={(v) => {
									const on = Boolean(v);
									setTransport((prev) => on ? Array.from(new Set([...prev, m])).slice(0,3) : prev.filter((x) => x !== m));
								}} />
								<span>{m}</span>
							</label>
						))}
					</div>
				</div>
				<div>
					<Label>Home Type</Label>
					<Select onValueChange={(v) => setHomeType(v as HomeType)}>
						<SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
						<SelectContent>
							{HOME_TYPES.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
						</SelectContent>
					</Select>
				</div>
				<div>
					<Label>Must-haves</Label>
					<div className="flex flex-wrap gap-3 mt-2">
						{MUSTS.map((m) => (
							<label key={m} className="flex items-center gap-2 text-sm">
								<Checkbox checked={musts.includes(m)} onCheckedChange={(v) => {
									const on = Boolean(v);
									setMusts((prev) => on ? Array.from(new Set([...prev, m])) : prev.filter((x) => x !== m));
								}} />
								<span>{m}</span>
							</label>
						))}
					</div>
				</div>
			</div>

			<div className="space-y-3">
				<Label>Weights (sum to 1.0)</Label>
				<div className="grid sm:grid-cols-2 gap-4">
					<div>
						<div className="flex justify-between text-sm"><span>Rent</span><span>{Math.round(weights.rent * 100)}%</span></div>
						<Slider value={[Math.round(weights.rent * 100)]} onValueChange={([v]) => setWeights((w) => ({ ...w, rent: v/100 }))} />
					</div>
					<div>
						<div className="flex justify-between text-sm"><span>Commute</span><span>{Math.round(weights.commute * 100)}%</span></div>
						<Slider value={[Math.round(weights.commute * 100)]} onValueChange={([v]) => setWeights((w) => ({ ...w, commute: v/100 }))} />
					</div>
					<div>
						<div className="flex justify-between text-sm"><span>Safety</span><span>{Math.round(weights.safety * 100)}%</span></div>
						<Slider value={[Math.round(weights.safety * 100)]} onValueChange={([v]) => setWeights((w) => ({ ...w, safety: v/100 }))} />
					</div>
					<div>
						<div className="flex justify-between text-sm"><span>Lifestyle</span><span>{Math.round(weights.lifestyle * 100)}%</span></div>
						<Slider value={[Math.round(weights.lifestyle * 100)]} onValueChange={([v]) => setWeights((w) => ({ ...w, lifestyle: v/100 }))} />
					</div>
				</div>
			</div>

			<Button type="submit" disabled={loading} className="w-full sm:w-auto">{loading ? "Suggesting…" : "Suggest Areas"}</Button>
		</form>
	);
}
