"use client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Area } from "@/types";

export function CompareDrawer({ open, onOpenChange, areas }: { open: boolean; onOpenChange: (o: boolean) => void; areas: Area[] }) {
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="right" className="w-full sm:max-w-2xl">
				<SheetHeader>
					<SheetTitle>Compare Areas</SheetTitle>
				</SheetHeader>
				<div className="mt-4 overflow-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Area</TableHead>
								<TableHead>Rent (week)</TableHead>
								<TableHead>Best commute</TableHead>
								<TableHead>Safety percentile</TableHead>
								<TableHead>Lifestyle count</TableHead>
								<TableHead>Fit score</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{areas.map((a) => {
								const best = a.metrics.commuteMin != null ? `${a.metrics.commuteMin} min` : "N/A";
								return (
									<TableRow key={a.id}>
										<TableCell className="font-medium">{a.name}</TableCell>
										<TableCell>{a.metrics.rentWeekly != null ? `$${a.metrics.rentWeekly}` : "N/A"}</TableCell>
										<TableCell>{best}</TableCell>
										<TableCell>{a.metrics.safetyPct != null ? a.metrics.safetyPct : "N/A"}</TableCell>
										<TableCell>{a.metrics.lifestyleCount != null ? a.metrics.lifestyleCount : "N/A"}</TableCell>
										<TableCell>{a.fitScore}</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
					<div className="mt-4 space-y-1 text-xs text-muted-foreground">
						<div>Sources shown per metric on cards. Dataset dates: rent (SQM), safety (CSA), commute (Google), lifestyle (Foursquare).</div>
						<div>Safety is a percentile proxy derived from CSA statistics; it does not guarantee personal safety.</div>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
