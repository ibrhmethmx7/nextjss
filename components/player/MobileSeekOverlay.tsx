"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, RotateCw } from "lucide-react";

interface MobileSeekOverlayProps {
    onSeek: (seconds: number) => void;
}

export default function MobileSeekOverlay({ onSeek }: MobileSeekOverlayProps) {
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(false);
    const lastTapRef = useRef<{ time: number; side: "left" | "right" | null }>({ time: 0, side: null });

    const handleTap = (side: "left" | "right") => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;

        if (
            lastTapRef.current.side === side &&
            now - lastTapRef.current.time < DOUBLE_TAP_DELAY
        ) {
            // Double tap detected
            if (side === "left") {
                onSeek(-10);
                setShowLeft(true);
                setTimeout(() => setShowLeft(false), 600);
            } else {
                onSeek(10);
                setShowRight(true);
                setTimeout(() => setShowRight(false), 600);
            }
            lastTapRef.current = { time: 0, side: null }; // Reset
        } else {
            // First tap
            lastTapRef.current = { time: now, side };
        }
    };

    return (
        <div className="absolute inset-0 z-20 flex pointer-events-none">
            {/* Left Zone (Rewind) */}
            <div
                className="flex-1 h-full pointer-events-auto"
                onClick={() => handleTap("left")}
            >
                <AnimatePresence>
                    {showLeft && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="absolute left-10 top-1/2 -translate-y-1/2 bg-black/60 rounded-full p-4 flex flex-col items-center justify-center backdrop-blur-sm"
                        >
                            <RotateCcw className="w-8 h-8 text-white mb-1" />
                            <span className="text-white text-xs font-bold">10s</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Center Zone (Safe Area for Play/Pause) */}
            <div className="w-1/3 h-full pointer-events-none" />

            {/* Right Zone (Forward) */}
            <div
                className="flex-1 h-full pointer-events-auto"
                onClick={() => handleTap("right")}
            >
                <AnimatePresence>
                    {showRight && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="absolute right-10 top-1/2 -translate-y-1/2 bg-black/60 rounded-full p-4 flex flex-col items-center justify-center backdrop-blur-sm"
                        >
                            <RotateCw className="w-8 h-8 text-white mb-1" />
                            <span className="text-white text-xs font-bold">10s</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
