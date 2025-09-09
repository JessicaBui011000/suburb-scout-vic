import type { Area } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AreaCard({ area, onSelect }: { area: Area; onSelect?: (id: string) => void }) {
	const modes = area.metrics.commuteByMode ?? {};
	return (
		<Card className="hover:shadow-sm transition" onClick={() => onSelect?.(area.id)}>
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle className="text-base">{area.name}</CardTitle>
				<Badge variant="secondary">Fit {area.fitScore}</Badge>
			</CardHeader>
			<CardContent className="space-y-2 text-sm">
				<div className="grid grid-cols-2 gap-2">
					<div>
						<div className="text-muted-foreground">Rent</div>
						<div>{area.metrics.rentWeekly != null ? `$${area.metrics.rentWeekly}/wk` : "N/A"}</div>
						<div className="text-xs text-muted-foreground">{area.metrics.sources.rent.name} · {area.metrics.sources.rent.date}</div>
					</div>
					<div>
						<div className="text-muted-foreground">Safety</div>
						<div>{area.metrics.safetyPct != null ? `${area.metrics.safetyPct}` : "N/A"}</div>
						<div className="text-xs text-muted-foreground">{area.metrics.sources.safety.name} · {area.metrics.sources.safety.date}</div>
					</div>
					<div>
						<div className="text-muted-foreground">Lifestyle</div>
						<div>{area.metrics.lifestyleCount != null ? area.metrics.lifestyleCount : "N/A"}</div>
						<div className="text-xs text-muted-foreground">{area.metrics.sources.lifestyle.name} · {area.metrics.sources.lifestyle.date}</div>
					</div>
					<div>
						<div className="text-muted-foreground">Best commute</div>
						<div>{area.metrics.commuteMin != null ? `${area.metrics.commuteMin} min` : "N/A"}</div>
						<div className="text-xs text-muted-foreground">{area.metrics.sources.commute.name} · {area.metrics.sources.commute.date}</div>
					</div>
				</div>
				{Object.keys(modes).length > 0 && (
					<div className="flex flex-wrap gap-2 text-xs">
						{"driving" in modes && <Badge variant="outline">🚗 {modes.driving}m</Badge>}
						{"transit" in modes && <Badge variant="outline">🚆 {modes.transit}m</Badge>}
						{"walking" in modes && <Badge variant="outline">🚶 {modes.walking}m</Badge>}
					</div>
				)}
				<div className="text-xs text-muted-foreground">{area.fitSummary}</div>
			</CardContent>
		</Card>
	);
}
