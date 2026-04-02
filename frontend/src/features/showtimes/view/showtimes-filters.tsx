import { AnimatePresence, motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { Input } from '../../../components/ui/input'
import { Select } from '../../../components/ui/select'
import { Card, CardContent } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { useShowtimesControllerContext } from '../controller/showtimes-controller-context'

export function ShowtimesFilters() {
    const {
        activeFilterCount,
        loading,
        quickFilter,
        quickFilterOptions,
        searchQuery,
        setSearchQuery,
        cinemaFilter,
        setCinemaFilter,
        branchFilter,
        setBranchFilter,
        uniqueBranches,
        clearAllFilters,
        fetchShowtimes,
        formatLastSynced,
        lastSyncedAt,
        openMobileFilters,
        mobileFiltersOpen,
        setMobileFiltersOpen,
        mobileSearchDraft,
        setMobileSearchDraft,
        mobileCinemaDraft,
        setMobileCinemaDraft,
        mobileBranchDraft,
        setMobileBranchDraft,
        applyMobileFilters,
        setQuickFilterOption,
    } = useShowtimesControllerContext()

    return (
        <>
            <motion.div
                className="mb-4 flex items-center justify-between gap-3 md:hidden"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
            >
                <Button
                    onClick={openMobileFilters}
                    className="border-[0.5px] border-border bg-card text-[13px] font-medium text-foreground hover:bg-secondary disabled:opacity-40"
                >
                    Filters
                    {activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
                </Button>
                <Button
                    onClick={() => fetchShowtimes(true)}
                    disabled={loading}
                    className="border-[0.5px] border-border bg-card text-[13px] font-medium text-foreground hover:bg-secondary disabled:opacity-40"
                >
                    {loading ? 'Syncing...' : 'Sync'}
                </Button>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.05 }}
            >
                <Card className="mb-6 hidden border-[0.5px] border-border bg-card md:block">
                    <CardContent className="pt-6">
                        <div className="mb-4 flex flex-wrap gap-2">
                            {quickFilterOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setQuickFilterOption(option.value)}
                                    className={`rounded-md border px-3 py-2 text-[12px] font-medium transition-colors ${quickFilter === option.value
                                            ? 'border-primary/60 bg-primary/10 text-primary'
                                            : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div className="relative md:col-span-2">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search for a movie..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="border-[0.5px] border-border bg-secondary pl-10 text-[13px] text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary"
                                />
                            </div>

                            <Select
                                value={cinemaFilter}
                                onChange={(e) => setCinemaFilter(e.target.value)}
                                className="border-[0.5px] border-border bg-secondary text-[13px] text-foreground"
                            >
                                <option value="">All Cinemas</option>
                                <option value="Ster-Kinekor">Ster-Kinekor</option>
                                <option value="Nu Metro">Nu Metro</option>
                            </Select>

                            <Select
                                value={branchFilter}
                                onChange={(e) => setBranchFilter(e.target.value)}
                                className="border-[0.5px] border-border bg-secondary text-[13px] text-foreground"
                            >
                                <option value="">All Branches</option>
                                {uniqueBranches.map((branch) => (
                                    <option key={branch} value={branch}>
                                        {branch}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-[12px] text-muted-foreground">Last synced: {formatLastSynced(lastSyncedAt)}</p>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={clearAllFilters}
                                    className="border-[0.5px] border-border bg-secondary px-3 py-2 text-[12px] text-muted-foreground hover:text-foreground"
                                >
                                    Clear filters
                                </button>
                                <button type="button" onClick={() => fetchShowtimes(true)} disabled={loading} className="btn-amber text-[12px]">
                                    {loading ? 'Syncing...' : 'Sync latest data'}
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <AnimatePresence>
                {mobileFiltersOpen && (
                    <>
                        <motion.button
                            type="button"
                            className="fixed inset-0 z-40 bg-black/50 md:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileFiltersOpen(false)}
                            aria-label="Close mobile filters"
                        />
                        <motion.aside
                            className="fixed right-0 top-0 z-50 h-full w-[86%] max-w-sm border-l border-border bg-card p-5 md:hidden"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                        >
                            <div className="mb-5 flex items-center justify-between">
                                <h2 className="text-[16px] font-medium text-foreground">Filters</h2>
                                <button
                                    type="button"
                                    onClick={() => setMobileFiltersOpen(false)}
                                    className="text-[13px] text-muted-foreground hover:text-foreground"
                                >
                                    Close
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Search for a movie..."
                                        value={mobileSearchDraft}
                                        onChange={(e) => setMobileSearchDraft(e.target.value)}
                                        className="border-[0.5px] border-border bg-secondary pl-10 text-[13px] text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary"
                                    />
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {quickFilterOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setQuickFilterOption(option.value)}
                                            className={`rounded-md border px-3 py-2 text-[12px] font-medium transition-colors ${quickFilter === option.value
                                                    ? 'border-primary/60 bg-primary/10 text-primary'
                                                    : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>

                                <Select
                                    value={mobileCinemaDraft}
                                    onChange={(e) => setMobileCinemaDraft(e.target.value)}
                                    className="border-[0.5px] border-border bg-secondary text-[13px] text-foreground"
                                >
                                    <option value="">All Cinemas</option>
                                    <option value="Ster-Kinekor">Ster-Kinekor</option>
                                    <option value="Nu Metro">Nu Metro</option>
                                </Select>

                                <Select
                                    value={mobileBranchDraft}
                                    onChange={(e) => setMobileBranchDraft(e.target.value)}
                                    className="border-[0.5px] border-border bg-secondary text-[13px] text-foreground"
                                >
                                    <option value="">All Branches</option>
                                    {uniqueBranches.map((branch) => (
                                        <option key={branch} value={branch}>
                                            {branch}
                                        </option>
                                    ))}
                                </Select>

                                <div className="grid grid-cols-2 gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={clearAllFilters}
                                        className="rounded-md border border-border bg-secondary px-4 py-2 text-[13px] text-muted-foreground hover:text-foreground"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        type="button"
                                        onClick={applyMobileFilters}
                                        className="btn-amber rounded-md"
                                        style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '6px' }}
                                    >
                                        Apply filters
                                    </button>
                                </div>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
