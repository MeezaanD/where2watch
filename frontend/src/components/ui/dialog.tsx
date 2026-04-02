import * as React from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"

const DialogContext = React.createContext<{
    open: boolean
    setOpen: (open: boolean) => void
}>({
    open: false,
    setOpen: () => undefined
})

function Dialog({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }) {
    return (
        <DialogContext.Provider value={{ open, setOpen: onOpenChange }}>
            {children}
        </DialogContext.Provider>
    )
}

function DialogTrigger({ children }: { children: React.ReactNode }) {
    const { setOpen } = React.useContext(DialogContext)
    return <>{React.isValidElement(children) ? React.cloneElement(children as React.ReactElement, { onClick: () => setOpen(true) }) : children}</>
}

function DialogClose({ children }: { children: React.ReactNode }) {
    const { setOpen } = React.useContext(DialogContext)
    return (
        <button type="button" onClick={() => setOpen(false)} className="inline-flex items-center justify-center">
            {children}
        </button>
    )
}

function DialogContent({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
    const { open, setOpen } = React.useContext(DialogContext)

    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false)
        }

        if (open) {
            window.addEventListener('keydown', handleKeyDown)
        }

        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [open, setOpen])

    return createPortal(
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                    onClick={() => setOpen(false)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className={cn("relative w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl", className)}
                        onClick={(event) => event.stopPropagation()}
                        initial={{ opacity: 0, y: 24, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                    >
                        <button
                            type="button"
                            className="absolute right-4 top-4 rounded-full border border-border bg-secondary p-2 text-foreground transition-colors hover:bg-accent"
                            onClick={() => setOpen(false)}
                            aria-label="Close dialog"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    )
}

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
}

function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h2 className={cn("text-2xl font-semibold leading-none tracking-tight text-foreground", className)} {...props} />
}

function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return <p className={cn("text-sm text-muted-foreground", className)} {...props} />
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("flex flex-col-reverse gap-2 p-6 pt-0 sm:flex-row sm:justify-end", className)} {...props} />
}

export { Dialog, DialogTrigger, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter }
