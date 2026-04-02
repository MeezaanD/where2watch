import { createContext, useContext, type ReactNode } from 'react'
import { useShowtimesController, type ShowtimesController } from './use-showtimes-controller'

const ShowtimesControllerContext = createContext<ShowtimesController | null>(null)

type ShowtimesControllerProviderProps = {
    children: ReactNode
}

export function ShowtimesControllerProvider({ children }: ShowtimesControllerProviderProps) {
    const controller = useShowtimesController()

    return <ShowtimesControllerContext.Provider value={controller}>{children}</ShowtimesControllerContext.Provider>
}

export function useShowtimesControllerContext() {
    const controller = useContext(ShowtimesControllerContext)

    if (!controller) {
        throw new Error('useShowtimesControllerContext must be used inside ShowtimesControllerProvider')
    }

    return controller
}
