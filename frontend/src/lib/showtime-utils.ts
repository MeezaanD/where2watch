import type { Showtime } from '../types'

export type QuickFilter = 'none' | 'watch-tonight' | 'after-work' | 'late-night'

const POPULAR_BRANCH_PRIORITY: Record<string, number> = {
    'V&A Waterfront': 0,
    'Canal Walk': 1,
}

const MINUTES_IN_DAY = 24 * 60

export function getBestShowtime(showtimes: Showtime[], now = new Date()): Showtime | null {
    if (showtimes.length === 0) {
        return null
    }

    const nowTime = now.getTime()
    const todayKey = toDateKey(now)

    return [...showtimes].sort((left, right) => {
        const leftPriceRank = left.price ?? Number.POSITIVE_INFINITY
        const rightPriceRank = right.price ?? Number.POSITIVE_INFINITY
        if (leftPriceRank !== rightPriceRank) {
            return leftPriceRank - rightPriceRank
        }

        const leftDateTime = parseShowtimeDateTime(left.date, left.time)
        const rightDateTime = parseShowtimeDateTime(right.date, right.time)

        const leftTimeRank = getTimePriority(leftDateTime, nowTime, todayKey)
        const rightTimeRank = getTimePriority(rightDateTime, nowTime, todayKey)

        if (leftTimeRank.group !== rightTimeRank.group) {
            return leftTimeRank.group - rightTimeRank.group
        }

        if (leftTimeRank.timestamp !== rightTimeRank.timestamp) {
            return leftTimeRank.timestamp - rightTimeRank.timestamp
        }

        const leftBranchRank = POPULAR_BRANCH_PRIORITY[left.branch] ?? Number.POSITIVE_INFINITY
        const rightBranchRank = POPULAR_BRANCH_PRIORITY[right.branch] ?? Number.POSITIVE_INFINITY

        if (leftBranchRank !== rightBranchRank) {
            return leftBranchRank - rightBranchRank
        }

        return `${left.movie}-${left.cinema}-${left.branch}-${left.time}`.localeCompare(
            `${right.movie}-${right.cinema}-${right.branch}-${right.time}`,
        )
    })[0]
}

export function matchesQuickFilter(showtime: Showtime, quickFilter: QuickFilter, now = new Date()): boolean {
    if (quickFilter === 'none') {
        return true
    }

    const minutes = parseTimeToMinutes(showtime.time)
    if (minutes === null) {
        return false
    }

    if (quickFilter === 'after-work') {
        return minutes >= 18 * 60
    }

    if (quickFilter === 'late-night') {
        return minutes >= 21 * 60
    }

    const todayKey = toDateKey(now)
    const showtimeKey = normalizeDateKey(showtime.date)

    if (showtimeKey !== todayKey) {
        return false
    }

    const nowMinutes = now.getHours() * 60 + now.getMinutes()
    return minutes >= nowMinutes
}

export function parseShowtimeDateTime(date: string, time: string): Date | null {
    const normalizedDate = normalizeDateKey(date)
    if (!normalizedDate) {
        return null
    }

    const [hours, minutes] = time.split(':').map((value) => Number.parseInt(value, 10))
    if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
        return null
    }

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return null
    }

    const parsed = new Date(`${normalizedDate}T${time}:00`)
    return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function parseTimeToMinutes(time: string): number | null {
    const [hours, minutes] = time.split(':').map((value) => Number.parseInt(value, 10))
    if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
        return null
    }

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return null
    }

    return hours * 60 + minutes
}

function getTimePriority(dateTime: Date | null, nowTime: number, todayKey: string): { group: number; timestamp: number } {
    if (!dateTime) {
        return { group: 4, timestamp: Number.POSITIVE_INFINITY }
    }

    const timestamp = dateTime.getTime()
    const showtimeKey = toDateKey(dateTime)

    if (timestamp >= nowTime && showtimeKey === todayKey) {
        return { group: 0, timestamp }
    }

    if (timestamp >= nowTime) {
        return { group: 1, timestamp }
    }

    return { group: 2, timestamp: timestamp + MINUTES_IN_DAY }
}

function toDateKey(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function normalizeDateKey(date: string): string | null {
    const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (!match) {
        return null
    }

    return `${match[1]}-${match[2]}-${match[3]}`
}
