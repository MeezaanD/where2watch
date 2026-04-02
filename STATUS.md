# Status Board

Last updated: 2026-04-02

This file is intentionally written as an open collaboration board. The app is functional, but there is still room to improve the UX, data reliability, and contributor workflow.

## Shipped

- Live scraping for Ster-Kinekor and Nu Metro.
- Backend aggregation with deduplication, sorting, and 24-hour in-memory cache.
- Mobile-first frontend with search and cinema/branch filters.
- Quick filters:
  - Watch Tonight
  - After Work
  - Late Night
- Best Pick recommendation card.
- Shareable showtime links with clipboard copy feedback.
- Pagination at 15 showtimes per page.
- Responsive mobile cards, desktop table, and detail dialog.
- Browser cache for 24 hours with manual sync.
- Frontend controller/model/view split under `frontend/src/features/showtimes`.

## In Progress

- Improving the visual consistency of pills, cards, and result highlighting.
- Refining shared-link matching and auto-scroll behavior.
- Keeping the controller layer lean as more view components are extracted.

## Planned Ideas

1. Add first/last pagination controls and compact ellipsis behavior.
2. Add an "only best options" toggle.
3. Add scraper health/status indicators in the UI.
4. Add tests for shared-link parsing and best-pick ranking.
5. Add CI checks for frontend build and backend build.
6. Add runtime monitoring for scrape duration and failure rates.
7. Add better error states when one cinema source is temporarily unavailable.

## Open Collaboration Topics

- Best way to expose dates beyond “today” without cluttering the UI.
- Whether the Best Pick card should stay global or become filter-aware only.
- Whether to support copy-as-text plus copy-as-link for sharing.
- Whether to keep the current dark theme or add a light theme later.

## Constraints

- Scrapers depend on external cinema markup/API behavior.
- No persistent database; cache is in-memory.
- Price may be `null` when source pages do not expose reliable pricing.

## Runtime Defaults

- Frontend dev server: `5173`
- Backend API server: `3001`
