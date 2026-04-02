import type { Showtime } from '../../../types'
import type { QuickFilter } from '../../../lib/showtime-utils'

export const API_URL = import.meta.env.DEV
    ? 'http://localhost:3001'
    : (import.meta.env.VITE_API_URL || 'http://localhost:3001')
export const BROWSER_CACHE_KEY = 'cinema-compare-showtimes'
export const BROWSER_CACHE_DURATION_MS = 24 * 60 * 60 * 1000
export const SHOWTIMES_PER_PAGE = 15

export type BrowserCache = {
    timestamp: number
    data: Showtime[]
}

export type SharedQuery = {
    movie: string
    branch: string
    time: string
}

export const QUICK_FILTER_OPTIONS: Array<{ value: QuickFilter; label: string }> = [
    { value: 'watch-tonight', label: 'Watch Tonight' },
    { value: 'after-work', label: 'After Work' },
    { value: 'late-night', label: 'Late Night' },
]

export function readBrowserCache(): BrowserCache | null {
    try {
        const raw = window.localStorage.getItem(BROWSER_CACHE_KEY)
        if (!raw) return null

        const parsed = JSON.parse(raw) as BrowserCache
        if (!parsed || !Array.isArray(parsed.data) || typeof parsed.timestamp !== 'number') {
            return null
        }

        return parsed
    } catch {
        return null
    }
}

export function writeBrowserCache(cache: BrowserCache): void {
    try {
        window.localStorage.setItem(BROWSER_CACHE_KEY, JSON.stringify(cache))
    } catch {
        // Ignore browser storage failures and continue using in-memory state.
    }
}

export function buildShowtimeKey(showtime: Showtime): string {
    return [showtime.movie, showtime.cinema, showtime.branch, showtime.date, showtime.time, showtime.format].join('::')
}

export function parseSharedQuery(search: string): SharedQuery | null {
    const params = new URLSearchParams(search)

    const movie = params.get('movie')
    const branch = params.get('branch')
    const time = params.get('time')

    if (!movie || !branch || !time) {
        return null
    }

    return {
        movie,
        branch,
        time,
    }
}

export function buildShareUrl(showtime: Showtime): string {
    const url = new URL(window.location.href)
    url.searchParams.set('movie', showtime.movie)
    url.searchParams.set('branch', showtime.branch)
    url.searchParams.set('time', showtime.time)

    return `${url.origin}${url.pathname}?${url.searchParams.toString()}`
}

export async function copyToClipboard(value: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(value)
        return true
    } catch {
        const textArea = document.createElement('textarea')
        textArea.value = value
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        const copied = document.execCommand('copy')
        document.body.removeChild(textArea)
        return copied
    }
}

export function getVisiblePages(currentPage: number, totalPages: number): number[] {
    const radius = 2
    const start = Math.max(1, currentPage - radius)
    const end = Math.min(totalPages, currentPage + radius)

    const pages: number[] = []
    for (let page = start; page <= end; page += 1) {
        pages.push(page)
    }

    return pages
}
