# Quickstart

Where2Watch is the current app name in the UI and documentation.

## 1. Install

From project root:

```bash
npm run install:all
```

Install Playwright browsers once:

```bash
cd backend
npx playwright install
cd ..
```

## 2. Start Development

From project root:

```bash
npm run dev
```

This runs:
- Backend: http://localhost:3001
- Frontend: http://localhost:5173

## 3. Use the App

Open frontend:
- http://localhost:5173

Main workflow:
1. Search movie titles in the search box.
2. Filter by cinema/branch.
3. Use quick filters for Watch Tonight, After Work, or Late Night.
4. On mobile, open Filters drawer and tap Apply Filters.
5. Tap Sync Latest Data to force refresh scraped data.
6. Tap a row/card to open the details dialog.
7. Use the Best Pick card if you want the app’s lowest-cost/earliest recommendation.
8. Use Share on a result to copy a link that restores the same movie, branch, and time.
9. The list is paginated at 15 showtimes per page.

## 4. API Smoke Test

```bash
curl http://localhost:3001/api/showtimes
```

Optional filters:

```bash
curl "http://localhost:3001/api/showtimes?movie=dune"
curl "http://localhost:3001/api/showtimes?cinema=Ster-Kinekor"
curl "http://localhost:3001/api/showtimes?branch=Blue%20Route"
```

## 5. Build

From project root:

```bash
npm run build
```

## 6. Stop

Press `Ctrl+C` in the terminal running `npm run dev`.

## 7. Notes

- Filter changes do not trigger fresh scraping; they run against the already-fetched dataset.
- Shared links can be pasted back into the browser to restore the matching showtime and highlight it.
