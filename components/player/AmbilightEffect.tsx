"use client";

import { motion } from "framer-motion";

interface AmbilightEffectProps {
    thumbnailUrl: string;
}

export default function AmbilightEffect({ thumbnailUrl }: AmbilightEffectProps) {
    if (!thumbnailUrl) return null;

    return (
        <div className="absolute -inset-10 md:-inset-20 -z-10 pointer-events-none">
            <motion.div
                key={thumbnailUrl}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0 w-full h-full"
            >
                {/* Primary Glow Layer */}
                <div
                    className="absolute inset-0 w-full h-full bg-cover bg-center blur-[100px] scale-150 opacity-80"
                    style={{ backgroundImage: `url(${thumbnailUrl})` }}
                />

                {/* Secondary Layer for Depth */}
                <div
                    className="absolute inset-0 w-full h-full bg-cover bg-center blur-[60px] scale-110 opacity-40 mix-blend-overlay"
                    style={{ backgroundImage: `url(${thumbnailUrl})` }}
                />

                {/* Dark Overlay to keep focus on video */}
                <div className="absolute inset-0 bg-black/40" />
            </motion.div>
        </div>
    );
}
