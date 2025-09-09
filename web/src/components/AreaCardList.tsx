import type { Area } from "@/types";
import { AreaCard } from "@/components/AreaCard";

export function AreaCardList({ areas, onSelect }: { areas: Area[]; onSelect?: (id: string) => void }) {
	return (
		<div className="grid gap-3 sm:grid-cols-2">
			{areas.map((a) => (
				<AreaCard key={a.id} area={a} onSelect={onSelect} />
			))}
		</div>
	);
}
