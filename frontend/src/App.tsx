import { ShowtimesControllerProvider } from './features/showtimes/controller/showtimes-controller-context'
import { ShowtimesDetailsDialog } from './features/showtimes/view/showtimes-details-dialog'
import { ShowtimesFilters } from './features/showtimes/view/showtimes-filters'
import { ShowtimesHeader } from './features/showtimes/view/showtimes-header'
import { ShowtimesStatusAndFeedback, ShowtimesToast } from './features/showtimes/view/showtimes-status-and-feedback'
import './index.css'

function ShowtimesScreen() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="mx-auto w-full max-w-6xl px-4 py-8">
                <ShowtimesHeader />
                <ShowtimesFilters />
                <ShowtimesStatusAndFeedback />
                <ShowtimesDetailsDialog />
                <ShowtimesToast />
            </div>
        </div>
    )
}

export default function App() {
    return (
        <ShowtimesControllerProvider>
            <ShowtimesScreen />
        </ShowtimesControllerProvider>
    )
}
