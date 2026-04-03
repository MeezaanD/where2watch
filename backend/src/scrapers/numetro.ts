import { chromium, type Page } from 'playwright';
import type { Showtime } from '../types.js';

const ALLOWED_NUMETRO_BRANCHES = ['Canal Walk', 'Cavendish Square'];
const MAX_NUMETRO_MOVIES = 8;

export async function scrapeNuMetro(): Promise<Showtime[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('https://numetro.co.za/now-showing/', {
      waitUntil: 'domcontentloaded',
      timeout: 25000
    });

    await page.waitForTimeout(1200);

    await page.waitForSelector('a[href*="/movie/"]', { timeout: 8000 });

    const showtimes: Showtime[] = [];

    const movieAnchors = await page.locator('a[href*="/movie/"]').evaluateAll((anchors) =>
      anchors.map((anchor) => {
        const link = anchor as HTMLAnchorElement;
        const title = link.querySelector('.movie_content h4')?.textContent?.trim() ?? '';
        const detailsText = link.querySelector('.movie_content .movie-details')?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
        const thumbnail = link.querySelector('.movie_thumbnail') as HTMLElement | null;

        return {
          href: link.href,
          title,
          detailsText,
          posterUrl: thumbnail?.getAttribute('data-poster') ?? null
        };
      })
    );

    for (const movieAnchor of movieAnchors.slice(0, MAX_NUMETRO_MOVIES)) {
      try {
        await page.goto(movieAnchor.href, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForTimeout(900);

        for (const branchName of ALLOWED_NUMETRO_BRANCHES) {
          const selectedCinema = await selectNuMetroCinema(page, branchName);
          if (!selectedCinema) continue;

          await page.waitForTimeout(500);

          const bodyText = await page.locator('body').innerText();
          const times = extractAllTimes(bodyText);
          const dates = extractNuMetroDates(bodyText);
          if (times.length === 0 || dates.length === 0) continue;

          for (const date of dates) {
            for (const time of times) {
              showtimes.push({
                cinema: 'Nu Metro',
                branch: selectedCinema,
                movie: normalizeWhitespace(movieAnchor.title),
                date,
                time,
                format: extractFormat(movieAnchor.detailsText),
                price: null,
                thumbnailUrl: movieAnchor.posterUrl,
                bookingUrl: getNuMetroBookingUrl(selectedCinema, movieAnchor.href)
              });
            }
          }
        }
      } catch {
        continue;
      }
    }

    await browser.close();
    return showtimes;
  } catch (error) {
    console.error('Nu Metro scraping error:', error);
    await browser.close();
    return [];
  }
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

async function selectNuMetroCinema(page: Page, preferredCinema: string): Promise<string | null> {
  return page.evaluate((target) => {
    const rows = [...document.querySelectorAll('#CinemaTable tbody tr')];
    const row = rows.find((element) => {
      const name = (element.getAttribute('data-cinemaname') || element.textContent || '').replace(/\s+/g, ' ').trim();
      return name.toLowerCase().includes(target.toLowerCase());
    }) || null;

    if (!row) return null;

    const cinemaName = (row.getAttribute('data-cinemaname') || row.textContent || '').replace(/\s+/g, ' ').trim();
    row.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    return cinemaName;
  }, preferredCinema);
}

function extractTime(value: string): string | null {
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
  if (direct24) {
    return direct24[0].padStart(5, '0');
  }

  return null;
}

function extractAllTimes(value: string): string[] {
  const normalized = normalizeWhitespace(value);
  const matches = normalized.match(/\b(1[0-2]|0?[1-9]):([0-5]\d)\s*([AP]M)\b|\b([01]?\d|2[0-3]):[0-5]\d\b/gi) ?? [];
  const result = new Set<string>();

  for (const match of matches) {
    const parsed = extractTime(match);
    if (parsed) {
      result.add(parsed);
    }
  }

  return [...result].sort();
}

function extractNuMetroDate(value: string): string | null {
  const normalized = normalizeWhitespace(value);
  const weekdayMonthDay = normalized.match(/\b(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+(\d{1,2})\s+([A-Z][a-z]{2})\b/);
  if (!weekdayMonthDay) {
    return null;
  }

  const day = weekdayMonthDay[1].padStart(2, '0');
  const monthToken = weekdayMonthDay[2].toLowerCase();
  const monthMap: Record<string, string> = {
    jan: '01',
    feb: '02',
    mar: '03',
    apr: '04',
    may: '05',
    jun: '06',
    jul: '07',
    aug: '08',
    sep: '09',
    oct: '10',
    nov: '11',
    dec: '12'
  };

  const month = monthMap[monthToken];
  if (!month) return null;

  const year = getCapeTownYear();
  return `${year}-${month}-${day}`;
}

function extractNuMetroDates(value: string): string[] {
  const normalized = normalizeWhitespace(value);
  const matches = normalized.match(/\b(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+\d{1,2}\s+[A-Z][a-z]{2}\b/g) ?? [];
  const result = new Set<string>();

  for (const match of matches) {
    const parsed = extractNuMetroDate(match);
    if (parsed) {
      result.add(parsed);
    }
  }

  if (result.size === 0) {
    const fallback = extractNuMetroDate(normalized);
    if (fallback) {
      result.add(fallback);
    }
  }

  return [...result].sort();
}

function getCapeTownYear(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Johannesburg',
    year: 'numeric'
  }).format(new Date());
}

function getNuMetroBookingUrl(branchName: string, movieUrl: string): string {
  const branchSlug = branchName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

  if (!branchSlug) return movieUrl;
  return `https://numetro.co.za/now-showing/#${branchSlug}`;
}

function extractFormat(detailsText: string): string {
  const normalized = normalizeWhitespace(detailsText).toLowerCase();

  if (normalized.includes('vip')) return 'VIP';
  if (normalized.includes('xtreme')) return 'Xtreme';
  if (normalized.includes('3d')) return '3D';
  return '2D';
}
