import { ExternalLink, Film, Share2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { useShowtimesControllerContext } from '../controller/showtimes-controller-context'

export function ShowtimesDetailsDialog() {
    const { selectedShowtime, closeDetails, isBestOption, getCinemaBadgeColor, formatShowtimeDate, shareShowtime } =
        useShowtimesControllerContext()

    return (
        <Dialog
            open={Boolean(selectedShowtime)}
            onOpenChange={(open) => {
                if (!open) closeDetails()
            }}
        >
            <DialogContent className="max-h-[90vh] overflow-y-auto border-[0.5px] border-border bg-card p-0 sm:max-w-2xl">
                {selectedShowtime && (
                    <>
                        <DialogHeader className="px-6 pt-6">
                            <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60">Movie details</p>
                            <DialogTitle className="text-[18px] font-medium text-foreground">{selectedShowtime.movie}</DialogTitle>
                            <DialogDescription className="text-[13px] text-muted-foreground">
                                Open the direct booking link or review the show details below.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-0 md:grid-cols-[260px_1fr]">
                            <div className="bg-secondary md:order-none">
                                {selectedShowtime.thumbnailUrl ? (
                                    <img
                                        src={selectedShowtime.thumbnailUrl}
                                        alt={`${selectedShowtime.movie} poster`}
                                        className="h-72 w-full bg-secondary p-2 object-contain md:h-full md:min-h-[280px] md:object-cover md:p-0"
                                    />
                                ) : (
                                    <div className="flex h-64 items-center justify-center md:min-h-[280px]">
                                        <Film className="h-10 w-10 text-muted-foreground/20" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-5 px-6 py-6 md:order-none">
                                <div className="flex flex-wrap gap-2">
                                    {isBestOption(selectedShowtime) && (
                                        <span className="w-fit rounded-sm bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-primary">
                                            Best time
                                        </span>
                                    )}
                                    <span
                                        className={`inline-flex items-center rounded px-2 py-1 text-[11px] font-medium ${getCinemaBadgeColor(selectedShowtime.cinema)}`}
                                    >
                                        {selectedShowtime.cinema}
                                    </span>
                                    <span className="rounded border border-border bg-secondary px-2 py-1 text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                                        {selectedShowtime.format}
                                    </span>
                                </div>

                                <div className="divide-y divide-border/60">
                                    <div className="flex items-center justify-between py-2.5 text-[13px]">
                                        <span className="text-muted-foreground">Date</span>
                                        <span>{formatShowtimeDate(selectedShowtime.date)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2.5 text-[13px]">
                                        <span className="text-muted-foreground">Branch</span>
                                        <span>{selectedShowtime.branch}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2.5 text-[13px]">
                                        <span className="text-muted-foreground">Time</span>
                                        <span className="text-[16px] font-medium text-primary">{selectedShowtime.time}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => shareShowtime(selectedShowtime)}
                                        className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-4 py-2 text-[13px] font-medium text-foreground"
                                    >
                                        <Share2 className="h-3.5 w-3.5" />
                                        Share
                                    </button>

                                    {selectedShowtime.bookingUrl && (
                                        <a
                                            href={selectedShowtime.bookingUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="btn-amber inline-flex items-center gap-2 no-underline"
                                            style={{ borderRadius: '6px', padding: '8px 16px', fontSize: '13px' }}
                                        >
                                            Book — opens {selectedShowtime.cinema}
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </a>
                                    )}
                                </div>

                                <p className="text-[12px] leading-relaxed text-muted-foreground/60">
                                    Data is fetched once and filtered locally — changing filters won't trigger another scrape.
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
