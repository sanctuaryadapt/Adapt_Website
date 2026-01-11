'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function Intro({ onComplete }: { onComplete: () => void }) {
    const [currentIndex, setCurrentIndex] = useState(-1)
    const [isExiting, setIsExiting] = useState(false)

    const lines = [
        "Hello.",
        "I'm tBot.",
        "It sure is great to get out of that bag."
    ]

    useEffect(() => {
        const sequence = async () => {
            // Line 1: "Hello."
            setTimeout(() => setCurrentIndex(0), 500)

            // Line 2: "I'm tBot." (Hello moves up)
            setTimeout(() => setCurrentIndex(1), 3000)

            // Line 3: "It sure is..." (Others move up)
            setTimeout(() => setCurrentIndex(2), 5500)

            // Fade out everything
            setTimeout(() => setIsExiting(true), 8000)

            // Complete
            setTimeout(() => {
                onComplete()
            }, 9000)
        }
        sequence()
    }, [onComplete])

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-white text-black overflow-hidden"
            animate={{ opacity: isExiting ? 0 : 1 }}
            transition={{ duration: 1 }}
        >
            <div className="relative flex flex-col items-center justify-center w-full h-full">
                <AnimatePresence>
                    {lines.map((line, index) => {
                        // Only render if it has appeared
                        if (index > currentIndex) return null

                        // Calculate position relative to the current active line
                        const offset = currentIndex - index

                        return (
                            <motion.h1
                                key={index}
                                layout // helps with smooth movement
                                initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                                animate={{
                                    opacity: offset === 0 ? 1 : 0.3, // Current is bright, old are dimmed
                                    y: -offset * 60, // Move up 60px per step
                                    filter: 'blur(0px)',
                                }}
                                exit={{ opacity: 0, y: -100 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 50,
                                    damping: 20,
                                    mass: 1,
                                }}
                                className="absolute text-center text-2xl font-bold md:text-3xl whitespace-nowrap"
                                style={{
                                    zIndex: 10 - offset // Ensure new text is 'on top' visually if overlapping, though y handles it
                                }}
                            >
                                {line}
                            </motion.h1>
                        )
                    })}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}
