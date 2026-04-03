import { chromium } from 'playwright';
import { load } from 'cheerio';
import type { Showtime } from '../types.js';

const STER_HOST = 'https://www.sterkinekor.com';
const ALLOWED_STER_LOCATIONS = [
  { branch: 'V&A Waterfront', location: 'va' },
  { branch: 'Blue Route', location: 'blue-route' }
];
const MAX_STER_MOVIES = 8;

export async function scrapeSterKinekor(): Promise<Showtime[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    const movieUrls = (await fetchSterMovieUrls()).slice(0, MAX_STER_MOVIES);
    const showtimes: Showtime[] = [];

    for (const { branch, location } of ALLOWED_STER_LOCATIONS) {
      for (const movieUrl of movieUrls) {
        try {
          await page.goto(`${movieUrl}?location=${location}`, {
            waitUntil: 'domcontentloaded',
            timeout: 20000
          });

          const title = (await page.locator('h1').first().textContent()) ?? '';
          const movieName = normalizeWhitespace(title);
          if (!movieName) continue;

          await page.waitForTimeout(400);
          const posterUrl = await extractSterPosterUrl(page);
          const cards = await page.locator('.showtime_card').all();
          const formatHints = (await page.locator('.gr-showtimes__bordered-text div').allTextContents())
            .map(normalizeWhitespace)
            .filter(Boolean);
          const defaultFormat = formatHints[0] ?? '2D';

          for (const card of cards) {
            const rawTime = (await card.locator('span').first().textContent()) ?? '';
            const time = parseTime(rawTime);
            if (!time) continue;

            const onclickValue = (await card.getAttribute('onclick')) ?? '';
            const date = parseSterDate(onclickValue);
            if (!date) continue;
            const bookingUrl = parseSterBookingUrl(onclickValue);

            const format = defaultFormat;

            showtimes.push({
              cinema: 'Ster-Kinekor',
              branch,
              movie: movieName,
              date,
              time,
              format,
              price: null,
              thumbnailUrl: posterUrl,
              bookingUrl
            });
          }
        } catch {
          continue;
        }
      }
    }

    await browser.close();

    return showtimes;
  } catch (error) {
    console.error('Ster-Kinekor scraping error:', error);
    await browser.close();
    return [];
  }
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function parseTime(value: string): string | null {
  const normalized = normalizeWhitespace(value);
  const amPmMatch = normalized.match(/\b(1[0-2]|0?[1-9]):([0-5]\d)\s*([AP]M)\b/i);
  if (amPmMatch) {
    let hour = parseInt(amPmMatch[1], 10);
    const minute = amPmMatch[2];
    const period = amPmMatch[3].toUpperCase();

    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    return `${hour.toString().padStart(2, '0')}:${minute}`;
  }

  const direct24 = normalized.match(/\b([01]?\d|2[0-3]):[0-5]\d\b/);
  if (direct24) return direct24[0].padStart(5, '0');

  return null;
}

async function extractSterPosterUrl(page: import('playwright').Page): Promise<string | null> {
  const selectors = [
    'img.br_poster.rounded.w-100',
    'img[alt="movie poster"]',
    '.movie-info-poster img'
  ];

  for (const selector of selectors) {
    const candidate = page.locator(selector).first();
    if (await candidate.count()) {
      const src = await candidate.getAttribute('src');
      if (src) return src;
    }
  }

  return null;
}

function parseSterDate(onclickValue: string): string | null {
  const match = onclickValue.match(/sendGA\('[^']+',\s*'([^']+)'/i);
  if (!match) return null;

  const parsed = new Date(match[1]);
  if (Number.isNaN(parsed.getTime())) return null;

  return formatCapeTownDate(parsed);
}

function parseSterBookingUrl(onclickValue: string): string | null {
  const checkoutMatch = onclickValue.match(/showCategoriesModal\('([^']+)'\)/i);
  if (!checkoutMatch) return null;

  const relativePath = checkoutMatch[1];
  if (!relativePath.startsWith('/')) {
    return `${STER_HOST}/${relativePath}`;
  }

  return `${STER_HOST}${relativePath}`;
}

function formatCapeTownDate(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Johannesburg',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);

  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  if (!year || !month || !day) return '';
  return `${year}-${month}-${day}`;
}

async function fetchSterMovieUrls(): Promise<string[]> {
  const response = await fetchSterBlockHtmlWithRetry();
  const html = await response.text();
  const $ = load(html);
  const urls = new Set<string>();

  $('a[onclick], button[onclick]').each((_, element) => {
    const onclickValue = $(element).attr('onclick') ?? '';
    const match = onclickValue.match(/\/(f|F)\/[^'"\s)]+/);
    if (match) {
      urls.add(`${STER_HOST}${match[0]}`);
    }
  });

  return [...urls];
}

async function fetchSterBlockHtmlWithRetry(): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(`${STER_HOST}/api/GetBlockHtml`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          _blockName: 'ContainerWithLoadMore',
          name: 'ActualMovies',
          cols: 4,
          colsMobile: 2,
          isLoadAll: true,
          step: 3200,
          skip: 0,
          hideMonths: true,
          showButtonUnderPoster: true,
          loadAllSecondTime: true,
          isOpenFromContentSwitcher: true,
          isSmallLastWeekLabel: true,
          hoverEffect: true,
          isHideLoadMore: false,
          loading: false,
          loadedAll: false,
          blockName: 'ActualMovies',
          skipArticles: 0,
          take: 3200
        })
      });

      if (!response.ok) {
        throw new Error(`Ster-Kinekor block request failed: ${response.status}`);
      }

      return response;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Ster-Kinekor block request failed');
}
