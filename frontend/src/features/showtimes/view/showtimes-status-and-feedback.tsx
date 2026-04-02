import { AnimatePresence, motion } from 'framer-motion'
import { Film, Loader2 } from 'lucide-react'
import { Card, CardContent } from '../../../components/ui/card'
import { Progress } from '../../../components/ui/progress'
import { useShowtimesControllerContext } from '../controller/showtimes-controller-context'
import { ShowtimesResults } from './showtimes-results'

export function ShowtimesStatusAndFeedback() {
    const { loading, loadingProgress, error, filteredShowtimes } = useShowtimesControllerContext()

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
            >
                <Card className="mb-6 overflow-hidden border-[0.5px] border-border bg-card">
                    <CardContent className="space-y-2 py-3 pt-3">
                        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.1em] text-muted-foreground/60">
                            <span>{loading ? 'Finding sessions...' : 'Ready'}</span>
                            <span>{loadingProgress}%</span>
                        </div>
                        <Progress
                            value={loadingProgress}
                            className={`h-[2px] bg-secondary ${loading ? '[&>div]:bg-primary' : '[&>div]:bg-muted-foreground/20'}`}
                        />
                    </CardContent>
                </Card>
            </motion.div>

            {loading && (
                <motion.div className="flex items-center justify-center py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="ml-2 text-[13px] text-muted-foreground">Finding sessions...</span>
                </motion.div>
            )}

            {error && (
                <div
                    className="mb-4 border-l-[3px] border-primary bg-card px-4 py-3 text-[13px] text-muted-foreground"
                    style={{ borderRadius: '0 8px 8px 0' }}
                >
                    {error} — try syncing again shortly
                </div>
            )}

            {!loading && !error && filteredShowtimes.length === 0 && (
                <Card className="border-[0.5px] border-border bg-card">
                    <CardContent className="flex flex-col items-center py-14 text-center">
                        <Film className="mb-3 h-7 w-7 text-muted-foreground/30" />
                        <p className="text-[14px] text-muted-foreground">No sessions match</p>
                        <p className="mt-1 text-[12px] text-muted-foreground/60">Try a different movie or cinema</p>
                    </CardContent>
                </Card>
            )}

            {!loading && !error && filteredShowtimes.length > 0 && <ShowtimesResults />}
        </>
    )
}

export function ShowtimesToast() {
    const { toastMessage } = useShowtimesControllerContext()

    return (
        <AnimatePresence>
            {toastMessage && (
                <motion.div
                    className="fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-md border border-border bg-card px-4 py-2 text-[12px] text-foreground shadow-lg"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                >
                    {toastMessage}
                </motion.div>
            )}
        </AnimatePresence>
    )
}
