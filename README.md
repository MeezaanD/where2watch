# Where2Watch (Cape Town Cinema Showtimes)

Where2Watch is a full-stack app for comparing Cape Town movie showtimes across Ster-Kinekor and Nu Metro.

It scrapes live data, normalizes it into a shared format, caches results on the backend and browser, and presents it in a mobile-first React UI with quick filters, pagination, shareable links, and a best-pick recommendation.

## Features

- Live scraping for Ster-Kinekor and Nu Metro Cape Town branches.
- Unified showtime model with:
  - `cinema`, `branch`, `movie`, `date`, `time`, `format`, `price`, `thumbnailUrl`, `bookingUrl`
- Backend aggregation service:
  - Runs both scrapers in parallel
  - Deduplicates and sorts results
  - 24-hour in-memory cache
- Frontend UX:
  - Search by movie name
  - Filter by cinema and branch
  - Quick presets: Watch Tonight, After Work, Late Night
  - Best Pick card based on price and time priority
  - Pagination with 15 showtimes per page
  - Shareable result links with query params
  - Clipboard copy feedback
  - Mobile off-canvas filters with explicit Apply
  - Local filtering only after fetch
  - Browser cache (localStorage) for 24 hours
  - Manual sync button to refresh latest data
  - Responsive layout:
    - Mobile cards
    - Desktop table
  - Detail dialog with poster and direct booking link
  - Progress indicator during sync
  - Highlighted shared result on load

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn-style UI primitives
- Framer Motion
- Lucide React

### Backend
- Node.js + Express + TypeScript
- Playwright
- Cheerio

## Ports

- Frontend (Vite dev): `5173`
- Backend API: `3001`

## Installation

1. Install all dependencies:

```bash
npm run install:all
```

2. Install Playwright browser binaries:

```bash
cd backend
npx playwright install
```

## Run Locally

Run both services from project root:

```bash
npm run dev
```

Or run individually:

```bash
npm run dev:backend
npm run dev:frontend
```

## Build

```bash
npm run build
```

## API

### GET `/api/showtimes`

Optional query params:
- `movie`
- `cinema`
- `branch`

Sample response:

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "cinema": "Ster-Kinekor",
      "branch": "V&A Waterfront",
      "movie": "Example Movie",
      "date": "2026-04-01",
      "time": "19:30",
      "format": "2D",
      "price": null,
      "thumbnailUrl": "https://...",
      "bookingUrl": "https://..."
    }
  ]
}
```

## Project Structure

```text
movies/
├── backend/
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/api.ts
│   │   ├── scrapers/
│   │   │   ├── sterkinekor.ts
│   │   │   └── numetro.ts
│   │   ├── services/compare.ts
│   │   └── types.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   ├── types.ts
│   │   ├── components/
│   │   │   ├── mobile-showtimes-view.tsx
│   │   │   └── ui/
│   │   │       └── ...
│   │   └── features/
│   │       └── showtimes/
│   │           ├── controller/
│   │           ├── model/
│   │           └── view/
│   └── package.json
├── QUICKSTART.md
├── STATUS.md
└── brief.md
```

## Notes

- Scraping targets can change when cinema websites update; selectors/parsers may need maintenance.
- Backend cache is in-memory and resets on backend restart.
- Browser cache is local to each user/device.
- Shared links use query params for movie, branch, and time.
- The frontend is currently organized around a controller/model/view split under `frontend/src/features/showtimes`.
