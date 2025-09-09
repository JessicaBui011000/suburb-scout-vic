"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/Header";
import { InputForm } from "@/components/InputForm";
import { AreaCardList } from "@/components/AreaCardList";
import { CompareDrawer } from "@/components/CompareDrawer";
import type { Area } from "@/types";
import { Button } from "@/components/ui/button";

const MapView = dynamic(() => import("@/components/MapView").then(m => m.MapView), { ssr: false });

export default function Home() {
	const [company, setCompany] = useState<any | undefined>(undefined);
	const [areas, setAreas] = useState<Area[]>([]);
	const [compareOpen, setCompareOpen] = useState(false);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);

	return (
		<div className="min-h-screen">
			<Header />
			<main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
				<InputForm onResults={(data) => { setCompany(data.company); setAreas(data.areas); }} />
				{areas.length > 0 && (
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold">Suggested Areas</h2>
						<Button variant="outline" onClick={() => setCompareOpen(true)}>Open Compare</Button>
					</div>
				)}
				{areas.length > 0 && (
					<p className="text-xs text-muted-foreground">Safety is a percentile proxy derived from CSA statistics; it does not guarantee personal safety.</p>
				)}
				<MapView company={company} areas={areas} selectedIds={selectedIds} onToggleSelect={(id) => setSelectedIds((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])} />
				<AreaCardList areas={areas} onSelect={(id) => setSelectedIds((prev) => prev.includes(id) ? prev : [...prev, id])} />
			</main>
			<CompareDrawer open={compareOpen} onOpenChange={setCompareOpen} areas={areas.filter((a) => selectedIds.includes(a.id))} />
		</div>
	);
}
