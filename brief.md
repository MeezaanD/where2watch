# Where2Watch MVP Brief

## Product

Where2Watch is a Cape Town movie showtimes comparison app that aggregates Ster-Kinekor and Nu Metro sessions into a single searchable, filterable interface.

## Target Users

- Students and young professionals in Cape Town.
- Moviegoers comparing venue/time convenience quickly.

## MVP Goal

Help users answer: "Where and when can I watch this movie today with the least friction?"

## MVP Scope

### In Scope

- Aggregate showtimes from Ster-Kinekor and Nu Metro.
- Display normalized fields:
  - cinema, branch, movie, date, time, format
  - thumbnail URL and booking URL when available
- Compare showtimes in one UI with:
  - search by movie
  - cinema/branch filters
  - quick preset filters
  - best-pick recommendation
  - pagination for larger result sets
  - mobile and desktop responsive layouts
- Provide quick action to open direct booking links.
- Shareable links for a specific result.
- Optimize for performance using:
  - backend cache (24h)
  - browser cache (24h)
  - local filtering after fetch

### Out of Scope (MVP)

- User accounts/authentication
- Payments/ticketing inside the app
- Historical analytics dashboards
- Long-term persistence database
- Full pricing intelligence (sources may not always provide reliable prices)

## UX Principles

- Mobile-first and fast to scan.
- Clear comparison focus over editorial content.
- Minimal steps from search to booking link.
- High contrast dark theme for readability.
- Recommend the best option without hiding other results.

## Success Criteria

1. User can load showtimes and find a specific movie in under 10 seconds.
2. User can filter by cinema/branch without triggering repeated scrapes.
3. User can open a direct booking link from list or details panel.
4. User can share a result and reopen the same match from a link.
5. User can scan results comfortably on mobile and desktop.
6. App remains usable when one scraper fails (partial results still return).

## Technical MVP Architecture

- Frontend: React + TypeScript + Vite + Tailwind/shadcn-style UI
- Backend: Express + TypeScript
- Data collection: Playwright + Cheerio scrapers
- API: `/api/showtimes` with optional query filters

## Risks

- Cinema website structure changes may break selectors.
- Scrape latency can vary by site conditions.
- In-memory cache resets on backend restarts.

## Post-MVP Ideas

- Date-range and schedule planning view
- Notification/watchlist alerts
- Optional persistent cache storage
- Better pricing coverage and reliability metadata
- Smarter route sharing and link previews
- User-selectable sorting and best-pick rules
