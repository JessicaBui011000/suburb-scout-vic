"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef } from "react";
import type { Area } from "@/types";

const icon = new L.Icon({
	iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
	shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
	iconSize: [25, 41],
	iconAnchor: [12, 41],
});

export function MapView({ company, areas, onSelect, selectedIds, onToggleSelect }: { company?: { lat: number; lng: number; normalizedAddress?: string }; areas: Area[]; onSelect?: (id: string) => void; selectedIds?: string[]; onToggleSelect?: (id: string) => void }) {
	const mapRef = useRef<L.Map | null>(null);
	const center = useMemo(() => ({ lat: company?.lat ?? -37.8136, lng: company?.lng ?? 144.9631 }), [company]);

	useEffect(() => {
		if (!mapRef.current) return;
		const map = mapRef.current;
		const bounds = L.latLngBounds([]);
		if (company) bounds.extend([company.lat, company.lng]);
		areas.forEach((a) => bounds.extend([a.centroid.lat, a.centroid.lng]));
		if (bounds.isValid()) map.fitBounds(bounds.pad(0.2));
	}, [company, areas]);

	return (
		<MapContainer center={[center.lat, center.lng]} zoom={12} style={{ height: 420, width: "100%" }} whenCreated={(m) => (mapRef.current = m)}>
			<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
			{company && (
				<Marker position={[company.lat, company.lng]} icon={icon}>
					<Popup>Company{company.normalizedAddress ? `: ${company.normalizedAddress}` : ""}</Popup>
				</Marker>
			)}
			{areas.map((a) => (
				<Marker key={a.id} position={[a.centroid.lat, a.centroid.lng]} icon={icon} eventHandlers={{ click: () => onSelect?.(a.id) }}>
					<Popup>
						<div className="space-y-2">
							<div className="font-medium">{a.name}</div>
							<div className="text-sm">Fit: {a.fitScore}</div>
							{a.metrics.commuteMin != null && <div className="text-sm">Best commute: {a.metrics.commuteMin} min</div>}
							{a.metrics.rentWeekly != null && <div className="text-sm">Rent: ${a.metrics.rentWeekly}/wk</div>}
							{a.metrics.safetyPct != null && <div className="text-sm">Safety: {a.metrics.safetyPct} pct</div>}
							<button className="text-xs underline" onClick={() => onToggleSelect?.(a.id)}>
								{selectedIds?.includes(a.id) ? "Remove from Compare" : "Select for Compare"}
							</button>
						</div>
					</Popup>
				</Marker>
			))}
		</MapContainer>
	);
}
