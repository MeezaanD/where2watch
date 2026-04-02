import { motion } from 'framer-motion'

export function ShowtimesHeader() {
    return (
        <motion.header
            className="mb-10 text-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
        >
            <h1 className="text-[28px] font-medium leading-none tracking-[-0.02em] text-foreground">
                Where<span className="text-primary">2</span>Watch
            </h1>
            <p className="mt-2.5 text-[14px] text-muted-foreground">
                Cape Town showtimes <br/>- Side by Side
            </p>
        </motion.header>
    )
}