# Acceptance Criteria — Relocating Worker → Best-Fit Areas

Refer to `docs/PRD.md` Functional and Non-Functional requirements. This checklist must pass:

- Geocoding returns lat/lng + normalized address; low-confidence flag works; failures recover.
- Commute (driving required; transit/walk optional) filters by commuteMax; best mode shown.
- Rent/Safety/Lifestyle populate values or N/A; sources + dates visible on cards & compare.
- Ranking is deterministic; sliders change order; top 3–5 returned with fitScore & fitSummary.
- Map pins + AreaCards show required attributes; Compare lists selected areas with all columns.
- Performance: warm P95 < 3s.
- Safety disclaimer displayed near safety percentile.
