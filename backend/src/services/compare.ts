import { scrapeSterKinekor } from '../scrapers/sterkinekor.js';
import { scrapeNuMetro } from '../scrapers/numetro.js';
import type { Showtime } from '../types.js';

interface CacheEntry {
  data: Showtime[];
  timestamp: number;
}

const cache: { [key: string]: CacheEntry } = {};
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function getShowtimes(filters?: {
  movie?: string;
  cinema?: string;
  branch?: string;
}): Promise<Showtime[]> {
  const cacheKey = 'all-showtimes';
  const cachedEntry = cache[cacheKey];

  // Check cache
  if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_DURATION) {
    console.log('Using cached data');
    return filterShowtimes(cachedEntry.data, filters);
  }

  console.log('Fetching fresh data from scrapers...');

  // Run both scrapers in parallel with timeout protection
  const timeout = (promise: Promise<Showtime[]>, timeoutMs: number) =>
    Promise.race([
      promise,
      new Promise<Showtime[]>((_, reject) =>
        setTimeout(() => reject(new Error(`Scraper timeout after ${timeoutMs}ms`)), timeoutMs)
      )
    ]);

  const [sterKinekorResults, nuMetroResults] = await Promise.allSettled([
    timeout(scrapeSterKinekor(), 90000),
    timeout(scrapeNuMetro(), 90000)
  ]);

  const allShowtimes: Showtime[] = [];

  if (sterKinekorResults.status === 'fulfilled') {
    allShowtimes.push(...sterKinekorResults.value);
  } else {
    console.error('Ster-Kinekor scraper failed:', sterKinekorResults.reason);
  }

  if (nuMetroResults.status === 'fulfilled') {
    allShowtimes.push(...nuMetroResults.value);
  } else {
    console.error('Nu Metro scraper failed:', nuMetroResults.reason);
  }

  // Deduplicate and sort
  const dedupedShowtimes = deduplicateShowtimes(allShowtimes);
  const sortedShowtimes = sortShowtimes(dedupedShowtimes);

  if (sortedShowtimes.length > 0) {
    cache[cacheKey] = {
      data: sortedShowtimes,
      timestamp: Date.now()
    };
  } else if (cachedEntry) {
    console.log('Scrapers returned no data; serving previous cached data');
    return filterShowtimes(cachedEntry.data, filters);
  }

  return filterShowtimes(sortedShowtimes, filters);
}

function deduplicateShowtimes(showtimes: Showtime[]): Showtime[] {
  const seen = new Set<string>();
  const result: Showtime[] = [];

  for (const showtime of showtimes) {
    const key = `${showtime.cinema}-${showtime.branch}-${showtime.movie}-${showtime.date}-${showtime.time}-${showtime.format}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(showtime);
    }
  }

  return result;
}

function sortShowtimes(showtimes: Showtime[]): Showtime[] {
  return showtimes.sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }

    // Sort by movie name first
    if (a.movie !== b.movie) {
      return a.movie.localeCompare(b.movie);
    }

    // Then by time
    if (a.time !== b.time) {
      return a.time.localeCompare(b.time);
    }

    // Then by price (nulls last)
    if (a.price !== null && b.price !== null) {
      return a.price - b.price;
    }
    if (a.price !== null) return -1;
    if (b.price !== null) return 1;

    return 0;
  });
}

function filterShowtimes(showtimes: Showtime[], filters?: {
  movie?: string;
  cinema?: string;
  branch?: string;
}): Showtime[] {
  if (!filters) return showtimes;

  let filtered = showtimes;

  if (filters.movie) {
    const movieLower = filters.movie.toLowerCase();
    filtered = filtered.filter(s => s.movie.toLowerCase().includes(movieLower));
  }

  if (filters.cinema) {
    filtered = filtered.filter(s => s.cinema === filters.cinema);
  }

  if (filters.branch) {
    filtered = filtered.filter(s => s.branch === filters.branch);
  }

  return filtered;
}
