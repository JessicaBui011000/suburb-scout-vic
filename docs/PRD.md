## Relocating Worker → Best-Fit Areas — PRD

Location: `docs/PRD.md`

### Overview
A web demo that suggests 3–5 ranked neighborhoods for a relocating worker based on budget, commute, housing preferences, safety proxy, and lifestyle density.

### Goals & Non-Goals
- **Goals**
  - Suggest 3–5 best-fit areas near a company location.
  - Let users set budget, commute time, home type, and must-haves.
  - Provide transparent metrics (rent, commute, safety proxy, lifestyle density) with sources and dates.
  - Enable quick comparison via a table-style Compare drawer.
  - Keep interactions fast (<3s P95) with caching.
- **Non-Goals**
  - Live real-estate listings or price negotiation advice.
  - Crime prediction or guarantees of safety; only show a proxy percentile.
  - Multi-user accounts, authentication, or saved searches (in this demo).
  - City-wide policy recommendations or urban planning outputs.

### User Stories
- As a user, I paste a company address.
- As a user, I set budget, commute time base on selected traffics, home type, and must-haves.
- As a user, I click “Suggest Areas” and see 3–5 ranked neighborhoods.
- As a user, I open a Compare drawer to view a table across suggested areas.

### Functional Requirements
- **Geocoding (Mapbox or Pelias)**
  - [ ] Resolve a pasted company address to latitude/longitude using Mapbox Geocoding or Pelias.
  - **Acceptance Criteria**
    - [ ] Free-text input returns coordinates and a normalized display address.
    - [ ] Ambiguous inputs handled with best match; show a subtle warning if confidence < threshold.
    - [ ] Geocoding failures show an inline error and allow retry.

- **Commute times (Mapbox Isochrone + Google Distance Matrix)**
  - [ ] Generate an isochrone around the company and compute travel time from candidate areas to the company using Google Distance Matrix.
  - **Acceptance Criteria**
    - [ ] Supports at least driving (traffic-aware if available). Stretch: transit/walk/bike if feasible.
    - [ ] Commute time displayed in minutes per area; respects user max commute filter.
    - [ ] Degrades gracefully if one provider is unavailable (uses the other or cached results).

- **Rent dataset (SQM CSV snapshot)**
  - [ ] Load a CSV snapshot of rents (price per SQM or median rent) and join to candidate areas.
  - **Acceptance Criteria**
    - [ ] Rent value present for each suggested area with currency/unit indicated.
    - [ ] CSV snapshot version and “last updated” date shown in UI.
    - [ ] Missing data handled with fallback or an explicit “N/A” badge.

- **Safety proxy (CSA Victoria dataset)**
  - [ ] Ingest the CSA Victoria dataset and compute a percentile-based proxy per area.
  - **Acceptance Criteria**
    - [ ] UI displays percentile (e.g., 70th percentile = safer than 70% of areas), with source and date.
    - [ ] Includes an ethical disclaimer that this is a proxy, not a guarantee.

- **Lifestyle proxy (Foursquare Places density)**
  - [ ] Compute density/count of selected place categories (e.g., cafes, gyms, groceries) per area from Foursquare Places.
  - **Acceptance Criteria**
    - [ ] Display total count and optionally a short category breakdown in the card.
    - [ ] Show data source and last updated date.

- **Ranking engine: TOPSIS (user-controlled weights)**
  - [ ] Implement TOPSIS over attributes (rent, commute time, safety percentile, lifestyle density) with user-adjustable weights.
  - **Acceptance Criteria**
    - [ ] Sliders or inputs allow users to adjust importance per attribute (weights sum normalized).
    - [ ] Output ranks areas 1..N; top 3–5 shown with scores.
    - [ ] Deterministic with same inputs; ties handled consistently.

- **Map: Leaflet/Mapbox**
  - [ ] Render a map with a pin for the company address and pins/polygons for suggested areas.
  - **Acceptance Criteria**
    - [ ] Pins are labeled and clickable; selection syncs with cards list.
    - [ ] Map bounds auto-fit to show company + suggested areas.

- **Cards**
  - [ ] Each suggested area is shown as a card with: rent, commute time, safety percentile, lifestyle count, and a short “why this area” blurb.
  - **Acceptance Criteria**
    - [ ] Shows at least 4 attributes per area.
    - [ ] “Why this area” references the top contributing attributes.

- **Compare drawer**
  - [ ] A slide-over drawer shows a table to compare suggested areas across all attributes.
  - **Acceptance Criteria**
    - [ ] Columns: Area, Rent, Commute, Safety percentile, Lifestyle count, Score.
    - [ ] Opens from card or header; dismissible on mobile and desktop.

### Non-Functional Requirements
- **Performance**
  - [ ] P95 response time for “Suggest Areas” < 3 seconds with caching.
  - [ ] Add server-side caching keyed by normalized address + parameters; TTL configurable.
- **Transparency**
  - [ ] All metrics show data source and “last updated” date in UI.
- **Responsiveness**
  - [ ] Mobile-responsive layout using Tailwind breakpoints (sm, md, lg, xl).
- **Ethics**
  - [ ] Explicit note: safety = proxy percentile, not a guarantee of personal safety.

### Success Metrics
- [ ] User sees top 3–5 areas per query.
- [ ] At least 4 attributes displayed per area.
- [ ] All metrics display their source and last updated date.

### Future Extensions
- Personalization: learn user weights over time (implicit/explicit feedback).
- Live listings: integrate Domain/REA API for real-time inventory and prices.
- Auth & saved searches: sign-in to save, rename, and revisit searches.

### Data & Integrations (for reference)
- Geocoding: Mapbox Geocoding API or Pelias (open-source).
- Isochrone: Mapbox Isochrone API. Distances: Google Distance Matrix API.
- Rent: SQM CSV snapshot (curated, versioned in repo).
- Safety proxy: CSA Victoria dataset (processed to percentiles).
- Lifestyle: Foursquare Places (selected categories aggregated per area).

### Acceptance Test Checklist (End-to-End)
- [ ] Paste an address, obtain coordinates, and show a company pin.
- [ ] Set budget, commute time, home type, must-haves; submit.
- [ ] Return 3–5 ranked areas with cards showing at least 4 attributes.
- [ ] Map shows pins/polygons for areas; clicking syncs selection with cards.
- [ ] Compare drawer opens and renders a table with all attributes and scores.
- [ ] Each metric displays source and last updated date.
- [ ] Median response time < 1.5s, P95 < 3s for typical metro queries (with warm cache).
- [ ] Safety disclaimer visible where safety percentile is shown.
