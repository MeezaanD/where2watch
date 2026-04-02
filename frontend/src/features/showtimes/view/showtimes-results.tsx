import { ExternalLink, Film, Share2, Star } from 'lucide-react'
import { MobileShowtimesView } from '../../../components/mobile-showtimes-view'
import { Card, CardContent } from '../../../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table'
import { buildShowtimeKey } from '../model/showtimes-model'
import { useShowtimesControllerContext } from '../controller/showtimes-controller-context'

export function ShowtimesResults() {
    const {
        currentPage,
        showtimesPerPage,
        filteredShowtimes,
        paginatedShowtimes,
        bestPickShowtime,
        highlightedShowtimeKey,
        isBestOption,
        formatShowtimeDate,
        openDetails,
        shareShowtime,
        totalPages,
        visiblePages,
        setCurrentPage,
    } = useShowtimesControllerContext()

    const getCinemaPillClass = (cinema: string) => {
        if (cinema === 'Ster-Kinekor') {
            return 'bg-[#2a6ebb] text-white border-[#2a6ebb]'
        }

        return 'bg-[#c84b31] text-white border-[#c84b31]'
    }

    return (
        <>
            {bestPickShowtime && (
                <Card className="mb-4 overflow-hidden border-[0.5px] border-primary/30 bg-card">
                    <CardContent className="space-y-3 p-4">
                        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-primary">
                            <Star className="h-3.5 w-3.5" />
                            Best Pick
                        </div>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="space-y-1">
                                <p className="text-[16px] font-medium text-foreground">{bestPickShowtime.movie}</p>
                                <p className="text-[13px] text-muted-foreground">
                                    {bestPickShowtime.cinema} • {bestPickShowtime.branch}
                                </p>
                                <p className="text-[13px] text-muted-foreground">
                                    {formatShowtimeDate(bestPickShowtime.date)} at {bestPickShowtime.time}
                                </p>
                                <p className="text-[13px] font-medium text-primary">
                                    {bestPickShowtime.price !== null ? `R ${bestPickShowtime.price.toFixed(2)}` : 'Price unavailable'}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => shareShowtime(bestPickShowtime)}
                                    className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-3 py-2 text-[12px] font-medium text-foreground"
                                >
                                    <Share2 className="h-3.5 w-3.5" />
                                    Share
                                </button>
                                {bestPickShowtime.bookingUrl && (
                                    <a
                                        href={bestPickShowtime.bookingUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="btn-amber inline-flex items-center gap-2 text-[12px] no-underline"
                                        style={{ borderRadius: '6px', padding: '8px 14px' }}
                                    >
                                        Book Now
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <MobileShowtimesView
                showtimes={paginatedShowtimes}
                isBestOption={isBestOption}
                formatShowtimeDate={formatShowtimeDate}
                onSelectShowtime={openDetails}
                onShareShowtime={shareShowtime}
                highlightedShowtimeKey={highlightedShowtimeKey}
            />

            <Card className="hidden border-[0.5px] border-border bg-card md:block">
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60">Poster</TableHead>
                                <TableHead className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60">Movie</TableHead>
                                <TableHead className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60">Date</TableHead>
                                <TableHead className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60">Cinema</TableHead>
                                <TableHead className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60">Branch</TableHead>
                                <TableHead className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60">Time</TableHead>
                                <TableHead className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60">Format</TableHead>
                                <TableHead className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedShowtimes.map((showtime, idx) => (
                                <TableRow
                                    key={`${buildShowtimeKey(showtime)}-${idx}`}
                                    data-showtime-key={buildShowtimeKey(showtime)}
                                    className={`${isBestOption(showtime) ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-secondary/60'} ${highlightedShowtimeKey === buildShowtimeKey(showtime) ? 'ring-1 ring-primary/60' : ''
                                        } border-b border-border/60 cursor-pointer transition-colors`}
                                    onClick={() => openDetails(showtime)}
                                >
                                    <TableCell>
                                        {showtime.thumbnailUrl ? (
                                            <img
                                                src={showtime.thumbnailUrl}
                                                alt={`${showtime.movie} poster`}
                                                className="h-16 w-12 rounded-md object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-16 w-12 items-center justify-center rounded-md bg-secondary">
                                                <Film className="h-4 w-4 text-muted-foreground/30" />
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[14px] font-medium text-foreground">{showtime.movie}</span>
                                            {isBestOption(showtime) && (
                                                <span className="w-fit rounded-sm bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-primary">
                                                    Best time
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-[13px] text-muted-foreground">{formatShowtimeDate(showtime.date)}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${getCinemaPillClass(showtime.cinema)}`}
                                        >
                                            {showtime.cinema}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-[13px] text-muted-foreground">{showtime.branch}</TableCell>
                                    <TableCell className="text-[14px] font-medium text-foreground">{showtime.time}</TableCell>
                                    <TableCell>
                                        <span className="rounded border border-border bg-secondary px-2 py-1 text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                                            {showtime.format}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={(event) => {
                                                    event.stopPropagation()
                                                    void shareShowtime(showtime)
                                                }}
                                                className="inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-foreground"
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
                                                    className="inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:underline"
                                                >
                                                    Book →
                                                </a>
                                            ) : (
                                                <span className="text-[12px] text-muted-foreground/40">—</span>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {totalPages > 1 && (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[12px] text-muted-foreground">
                        Showing {(currentPage - 1) * showtimesPerPage + 1}-
                        {Math.min(currentPage * showtimesPerPage, filteredShowtimes.length)} of {filteredShowtimes.length}
                    </p>

                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                            disabled={currentPage === 1}
                            className="rounded-md border border-border bg-secondary px-3 py-2 text-[12px] text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Previous
                        </button>

                        {visiblePages.map((page) => (
                            <button
                                key={page}
                                type="button"
                                onClick={() => setCurrentPage(page)}
                                className={`min-w-8 rounded-md border px-3 py-2 text-[12px] ${currentPage === page
                                    ? 'border-primary/60 bg-primary/10 text-primary'
                                    : 'border-border bg-secondary text-foreground'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            type="button"
                            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                            disabled={currentPage === totalPages}
                            className="rounded-md border border-border bg-secondary px-3 py-2 text-[12px] text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
