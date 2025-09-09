# suburb-scout-vic

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/) [![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Components-000)](https://ui.shadcn.com/) [![Leaflet](https://img.shields.io/badge/Leaflet-Maps-199900)](https://leafletjs.com/) [![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Suggests 3–5 best-fit suburbs near a company address based on budget, commute type, safety proxy, and lifestyle density. Ranking uses TOPSIS with budget → commute priority. Demo scope: Victoria (Australia) rents.

## Features
- Geocoding (Mapbox/OSM fallback) and address autocomplete
- Commute times via Google Distance Matrix (fallback heuristics)
- Real VIC rent dataset loader with deterministic fallbacks and source stamping
- Safety proxy percentiles and lifestyle density counts
- Ranking: Budget first → Commute second → (tie-break) Safety & Lifestyle (TOPSIS)
- Map with pins, cards, and compare drawer (Next.js + Leaflet + shadcn/ui)

## Run locally
```bash
npm install
cd web && npm install
npm run dev
# http://localhost:3000
```

Env keys (optional for full fidelity):
```
MAPBOX_TOKEN=
GOOGLE_MAPS_API_KEY=
FOURSQUARE_API_KEY=
```
