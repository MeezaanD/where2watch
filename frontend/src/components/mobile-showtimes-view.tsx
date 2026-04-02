import { ExternalLink, Film, Share2 } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import type { Showtime } from '../types'

type MobileShowtimesViewProps = {
    showtimes: Showtime[]
    isBestOption: (showtime: Showtime) => boolean
    formatShowtimeDate: (date: string) => string
    onSelectShowtime: (showtime: Showtime) => void
    onShareShowtime: (showtime: Showtime) => void
    highlightedShowtimeKey: string | null
}

const buildShowtimeKey = (showtime: Showtime) => {
    return [showtime.movie, showtime.cinema, showtime.branch, showtime.date, showtime.time, showtime.format].join('::')
}

export function MobileShowtimesView({
    showtimes,
    isBestOption,
    formatShowtimeDate,
    onSelectShowtime,
    onShareShowtime,
    highlightedShowtimeKey,
}: MobileShowtimesViewProps) {
    const getCinemaPillClass = (cinema: string) => {
        if (cinema === 'Ster-Kinekor') {
            return 'bg-[#2a6ebb] text-white border-[#2a6ebb]'
        }

        return 'bg-[#c84b31] text-white border-[#c84b31]'
    }

    return (
        <div className="grid grid-cols-1 gap-4 md:hidden">
            {showtimes.map((showtime, idx) => (
                <Card
                    key={`${buildShowtimeKey(showtime)}-${idx}`}
                    data-showtime-key={buildShowtimeKey(showtime)}
                    className={`${isBestOption(showtime) ? 'border-[0.5px] border-primary/40 bg-card' : 'border-[0.5px] border-border bg-card'} ${highlightedShowtimeKey === buildShowtimeKey(showtime) ? 'ring-1 ring-primary/60' : ''
                        } overflow-hidden`}
                >
                    <CardContent className="p-0">
                        <button type="button" onClick={() => onSelectShowtime(showtime)} className="w-full text-left">
                            <div className="grid grid-cols-[56px_1fr] gap-3 p-4">
                                {showtime.thumbnailUrl ? (
                                    <img
                                        src={showtime.thumbnailUrl}
                                        alt={`${showtime.movie} poster`}
                                        className="h-20 w-14 rounded-md object-cover"
                                    />
                                ) : (
                                    <div className="flex h-20 w-14 items-center justify-center rounded-md bg-secondary">
                                        <Film className="h-5 w-5 text-muted-foreground/25" />
                                    </div>
                                )}

                                <div className="min-w-0 space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="line-clamp-2 text-[15px] font-medium text-foreground">{showtime.movie}</h3>
                                        {isBestOption(showtime) && (
                                            <span className="shrink-0 rounded-sm bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-primary">
                                                Best
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <span
                                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${getCinemaPillClass(showtime.cinema)}`}
                                        >
                                            {showtime.cinema}
                                        </span>
                                        <span className="rounded border border-border bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                                            {showtime.format}
                                        </span>
                                    </div>

                                    <p className="text-[12px] text-muted-foreground/60">{formatShowtimeDate(showtime.date)}</p>
                                    <p className="text-[12px] text-muted-foreground">{showtime.branch}</p>
                                    <p className="text-[17px] font-medium text-foreground">{showtime.time}</p>
                                </div>
                            </div>
                        </button>

                        <div className="border-t border-border/60 px-4 py-3">
                            <div className="flex items-center justify-between gap-3">
                                <button
                                    type="button"
                                    onClick={() => onShareShowtime(showtime)}
                                    className="inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground"
                                >
                                    <Share2 className="h-3.5 w-3.5" />
                                    Share
                                </button>

                                {showtime.bookingUrl ? (
                                    <a
                                        href={showtime.bookingUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={(event) => event.stopPropagation()}
                                        className="inline-flex items-center gap-2 text-[12px] font-medium text-primary hover:underline"
                                    >
                                        Book — opens {showtime.cinema}
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                ) : (
                                    <span className="text-[12px] text-muted-foreground/40">No booking link</span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
