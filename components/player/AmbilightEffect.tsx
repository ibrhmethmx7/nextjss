"use client";

import { memo } from "react";

interface AmbilightEffectProps {
    thumbnailUrl: string;
}

// Memoize to prevent unnecessary re-renders
const AmbilightEffect = memo(function AmbilightEffect({ thumbnailUrl }: AmbilightEffectProps) {
    if (!thumbnailUrl) return null;

    return (
        <div className="absolute -inset-6 md:-inset-12 -z-10 pointer-events-none hidden md:block">
            {/* GPU-accelerated container */}
            <div
                className="absolute inset-0 w-full h-full"
                style={{
                    willChange: 'opacity',
                    transform: 'translateZ(0)'
                }}
            >
                {/* Single optimized glow layer - reduced blur for better performance */}
                <div
                    className="absolute inset-0 w-full h-full bg-cover bg-center blur-[40px] scale-125 opacity-50"
                    style={{
                        backgroundImage: `url(${thumbnailUrl})`,
                        willChange: 'transform',
                        transform: 'translateZ(0)'
                    }}
                />

                {/* Dark Overlay to keep focus on video */}
                <div className="absolute inset-0 bg-black/50" />
            </div>
        </div>
    );
});

export default AmbilightEffect;
