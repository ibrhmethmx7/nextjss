"use client";

import { useState, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, RotateCw } from "lucide-react";

interface MobileSeekOverlayProps {
    onSeek: (seconds: number) => void;
}

const MobileSeekOverlay = memo(function MobileSeekOverlay({ onSeek }: MobileSeekOverlayProps) {
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
            if (side === "left") {
                onSeek(-10);
                setShowLeft(true);
                setTimeout(() => setShowLeft(false), 400);
            } else {
                onSeek(10);
                setShowRight(true);
                setTimeout(() => setShowRight(false), 400);
            }
            lastTapRef.current = { time: 0, side: null };
        } else {
            lastTapRef.current = { time: now, side };
        }
    };

    return (
        <div className="absolute inset-0 z-20 flex pointer-events-none">
            {/* Left Zone */}
            <div
                className="flex-1 h-full pointer-events-auto"
                onClick={() => handleTap("left")}
            >
                <AnimatePresence>
                    {showLeft && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-8 top-1/2 -translate-y-1/2 bg-black/50 rounded-full p-3 flex flex-col items-center"
                        >
                            <RotateCcw className="w-6 h-6 text-white" />
                            <span className="text-white text-xs font-bold">10s</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Center Zone */}
            <div className="w-1/3 h-full pointer-events-none" />

            {/* Right Zone */}
            <div
                className="flex-1 h-full pointer-events-auto"
                onClick={() => handleTap("right")}
            >
                <AnimatePresence>
                    {showRight && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-8 top-1/2 -translate-y-1/2 bg-black/50 rounded-full p-3 flex flex-col items-center"
                        >
                            <RotateCw className="w-6 h-6 text-white" />
                            <span className="text-white text-xs font-bold">10s</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
});

export default MobileSeekOverlay;

