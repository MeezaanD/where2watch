import { useEffect, useMemo, useState } from 'react'
import type { Showtime } from '../../../types'
import { getBestShowtime, matchesQuickFilter, type QuickFilter } from '../../../lib/showtime-utils'
import {
    API_URL,
    BROWSER_CACHE_DURATION_MS,
    QUICK_FILTER_OPTIONS,
    SHOWTIMES_PER_PAGE,
    type SharedQuery,
    buildShareUrl,
    buildShowtimeKey,
    copyToClipboard,
    getVisiblePages,
    parseSharedQuery,
    readBrowserCache,
    writeBrowserCache,
} from '../model/showtimes-model'

export type ShowtimesController = ReturnType<typeof useShowtimesController>

export function useShowtimesController() {
    const [showtimes, setShowtimes] = useState<Showtime[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingProgress, setLoadingProgress] = useState(0)
    const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [cinemaFilter, setCinemaFilter] = useState('')
    const [branchFilter, setBranchFilter] = useState('')
    const [quickFilter, setQuickFilter] = useState<QuickFilter>('none')
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null)
    const [sharedQuery, setSharedQuery] = useState<SharedQuery | null>(null)
    const [hasAppliedSharedTarget, setHasAppliedSharedTarget] = useState(false)
    const [highlightedShowtimeKey, setHighlightedShowtimeKey] = useState<string | null>(null)
    const [toastMessage, setToastMessage] = useState<string | null>(null)
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
    const [mobileSearchDraft, setMobileSearchDraft] = useState('')
    const [mobileCinemaDraft, setMobileCinemaDraft] = useState('')
    const [mobileBranchDraft, setMobileBranchDraft] = useState('')

    useEffect(() => {
        document.title = 'Where2Watch — Cape Town Showtimes'

        const shared = parseSharedQuery(window.location.search)
        if (shared) {
            setSearchQuery(shared.movie)
            setBranchFilter(shared.branch)
            setSharedQuery(shared)
        }

        const cached = readBrowserCache()

        if (cached && Date.now() - cached.timestamp < BROWSER_CACHE_DURATION_MS) {
            setShowtimes(cached.data)
            setLastSyncedAt(cached.timestamp)
            setLoadingProgress(100)
            return
        }

        void fetchShowtimes(true)
    }, [])

    useEffect(() => {
        if (!toastMessage) {
            return
        }

        const timer = window.setTimeout(() => {
            setToastMessage(null)
        }, 2000)

        return () => window.clearTimeout(timer)
    }, [toastMessage])

    const fetchShowtimes = async (forceRefresh = false) => {
        setLoading(true)
        setLoadingProgress(8)
        setError(null)

        const progressTimer = window.setInterval(() => {
            setLoadingProgress((current) => (current >= 92 ? current : current + 8))
        }, 180)

        try {
            if (!forceRefresh) {
                const cached = readBrowserCache()
                if (cached && Date.now() - cached.timestamp < BROWSER_CACHE_DURATION_MS) {
                    setShowtimes(cached.data)
                    setLastSyncedAt(cached.timestamp)
                    setLoadingProgress(100)
                    return
                }
            }

            const response = await fetch(`${API_URL}/api/showtimes`)
            const data = await response.json()

            if (data.success) {
                setShowtimes(data.data)
                const syncedAt = Date.now()
                setLastSyncedAt(syncedAt)
                writeBrowserCache({ timestamp: syncedAt, data: data.data })
                setLoadingProgress(100)
            } else {
                setError('Failed to fetch showtimes')
            }
        } catch {
            setError('Failed to connect to server')
        } finally {
            window.clearInterval(progressTimer)
            setLoadingProgress((current) => (current < 100 ? 100 : current))
            setLoading(false)
        }
    }

    const filteredShowtimes = useMemo(() => {
        return showtimes.filter((showtime) => {
            const matchesMovie = !searchQuery || showtime.movie.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesCinema = !cinemaFilter || showtime.cinema === cinemaFilter
            const matchesBranch = !branchFilter || showtime.branch === branchFilter
            const matchesPreset = matchesQuickFilter(showtime, quickFilter)

            return matchesMovie && matchesCinema && matchesBranch && matchesPreset
        })
    }, [showtimes, searchQuery, cinemaFilter, branchFilter, quickFilter])

    const bestPickShowtime = useMemo(() => {
        return getBestShowtime(filteredShowtimes)
    }, [filteredShowtimes])

    const totalPages = Math.max(1, Math.ceil(filteredShowtimes.length / SHOWTIMES_PER_PAGE))

    const paginatedShowtimes = useMemo(() => {
        const start = (currentPage - 1) * SHOWTIMES_PER_PAGE
        return filteredShowtimes.slice(start, start + SHOWTIMES_PER_PAGE)
    }, [filteredShowtimes, currentPage])

    const visiblePages = useMemo(() => {
        return getVisiblePages(currentPage, totalPages)
    }, [currentPage, totalPages])

    const uniqueBranches = useMemo(() => Array.from(new Set(showtimes.map((s) => s.branch))), [showtimes])
    const activeFilterCount = [searchQuery, cinemaFilter, branchFilter, quickFilter !== 'none'].filter(Boolean).length

    const getEarliestTime = (movie: string, date: string) => {
        const times = filteredShowtimes
            .filter((s) => s.movie === movie && s.date === date)
            .map((s) => s.time)
            .sort()
        return times.length > 0 ? times[0] : null
    }

    const isBestOption = (showtime: Showtime) => {
        const earliest = getEarliestTime(showtime.movie, showtime.date)
        return showtime.time === earliest
    }

    const formatShowtimeDate = (date: string) => {
        const parsed = new Date(`${date}T00:00:00`)
        if (Number.isNaN(parsed.getTime())) {
            return date
        }

        return parsed.toLocaleDateString('en-ZA', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
    }

    const getCinemaBadgeColor = (cinema: string) => {
        return cinema === 'Ster-Kinekor' ? 'badge-sk' : 'badge-nm'
    }

    const openDetails = (showtime: Showtime) => {
        setSelectedShowtime(showtime)
    }

    const closeDetails = () => {
        setSelectedShowtime(null)
    }

    const shareShowtime = async (showtime: Showtime) => {
        const shareUrl = buildShareUrl(showtime)
        const copied = await copyToClipboard(shareUrl)

        setToastMessage(copied ? 'Link copied' : 'Could not copy link')
    }

    const formatLastSynced = (timestamp: number | null) => {
        if (!timestamp) return 'Not synced yet'
        return new Date(timestamp).toLocaleString('en-ZA', { hour12: false })
    }

    const setQuickFilterOption = (nextFilter: QuickFilter) => {
        setQuickFilter((current) => (current === nextFilter ? 'none' : nextFilter))
    }

    const showtimeMatchesSharedQuery = (showtime: Showtime, query: SharedQuery) => {
        return (
            showtime.movie.toLowerCase() === query.movie.toLowerCase() &&
            showtime.branch.toLowerCase() === query.branch.toLowerCase() &&
            showtime.time === query.time
        )
    }

    useEffect(() => {
        if (!sharedQuery || hasAppliedSharedTarget || showtimes.length === 0) {
            return
        }

        const matchedIndex = filteredShowtimes.findIndex((showtime) => showtimeMatchesSharedQuery(showtime, sharedQuery))
        if (matchedIndex === -1) {
            setHasAppliedSharedTarget(true)
            return
        }

        const matchedShowtime = filteredShowtimes[matchedIndex]
        const pageToOpen = Math.floor(matchedIndex / SHOWTIMES_PER_PAGE) + 1
        setCurrentPage(pageToOpen)

        if (!matchedShowtime) {
            setHasAppliedSharedTarget(true)
            return
        }

        const key = buildShowtimeKey(matchedShowtime)
        setHighlightedShowtimeKey(key)
        setHasAppliedSharedTarget(true)
    }, [sharedQuery, hasAppliedSharedTarget, showtimes.length, filteredShowtimes])

    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, cinemaFilter, branchFilter, quickFilter])

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages)
        }
    }, [currentPage, totalPages])

    useEffect(() => {
        if (!highlightedShowtimeKey) {
            return
        }

        const candidates = Array.from(document.querySelectorAll<HTMLElement>('[data-showtime-key]'))
        const element = candidates.find(
            (candidate) => candidate.dataset.showtimeKey === highlightedShowtimeKey && candidate.offsetParent !== null,
        )

        element?.scrollIntoView({ behavior: 'smooth', block: 'center' })

        const timer = window.setTimeout(() => {
            setHighlightedShowtimeKey(null)
        }, 4500)

        return () => window.clearTimeout(timer)
    }, [highlightedShowtimeKey])

    const openMobileFilters = () => {
        setMobileSearchDraft(searchQuery)
        setMobileCinemaDraft(cinemaFilter)
        setMobileBranchDraft(branchFilter)
        setMobileFiltersOpen(true)
    }

    const applyMobileFilters = () => {
        setSearchQuery(mobileSearchDraft)
        setCinemaFilter(mobileCinemaDraft)
        setBranchFilter(mobileBranchDraft)
        setMobileFiltersOpen(false)
    }

    const clearAllFilters = () => {
        setSearchQuery('')
        setCinemaFilter('')
        setBranchFilter('')
        setQuickFilter('none')
        setMobileSearchDraft('')
        setMobileCinemaDraft('')
        setMobileBranchDraft('')
    }

    return {
        loading,
        loadingProgress,
        lastSyncedAt,
        error,
        searchQuery,
        cinemaFilter,
        branchFilter,
        quickFilter,
        currentPage,
        selectedShowtime,
        highlightedShowtimeKey,
        toastMessage,
        mobileFiltersOpen,
        mobileSearchDraft,
        mobileCinemaDraft,
        mobileBranchDraft,
        filteredShowtimes,
        paginatedShowtimes,
        bestPickShowtime,
        totalPages,
        visiblePages,
        uniqueBranches,
        activeFilterCount,
        fetchShowtimes,
        setSearchQuery,
        setCinemaFilter,
        setBranchFilter,
        setCurrentPage,
        openDetails,
        closeDetails,
        shareShowtime,
        formatLastSynced,
        setQuickFilterOption,
        isBestOption,
        formatShowtimeDate,
        getCinemaBadgeColor,
        openMobileFilters,
        applyMobileFilters,
        clearAllFilters,
        setMobileFiltersOpen,
        setMobileSearchDraft,
        setMobileCinemaDraft,
        setMobileBranchDraft,
        quickFilterOptions: QUICK_FILTER_OPTIONS,
        showtimesPerPage: SHOWTIMES_PER_PAGE,
    }
}
