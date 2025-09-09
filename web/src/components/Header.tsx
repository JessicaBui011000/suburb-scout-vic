"use client";
import Link from "next/link";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function Header() {
	return (
		<header className="w-full border-b bg-white sticky top-0 z-10">
			<div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
				<Link href="/" className="font-semibold">APD — Area Picker</Link>
				<Sheet>
					<SheetTrigger asChild>
						<Button variant="outline">Compare</Button>
					</SheetTrigger>
					<SheetContent side="right" className="w-full sm:max-w-xl">
						<SheetHeader>
							<SheetTitle>Compare Areas</SheetTitle>
						</SheetHeader>
						<div className="text-sm text-muted-foreground">Select areas from the list or map to compare here.</div>
					</SheetContent>
				</Sheet>
			</div>
		</header>
	);
}
