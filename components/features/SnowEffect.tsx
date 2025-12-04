"use client";

import { useEffect, useState } from "react";

export function SnowEffect() {
    const [snowflakes, setSnowflakes] = useState<number[]>([]);

    useEffect(() => {
        // Create 50 snowflakes
        setSnowflakes(Array.from({ length: 50 }, (_, i) => i));
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            {snowflakes.map((i) => (
                <div
                    key={i}
                    className="absolute top-[-10px] bg-white rounded-full opacity-80 animate-snow"
                    style={{
                        left: `${Math.random() * 100}%`,
                        width: `${Math.random() * 5 + 2}px`,
                        height: `${Math.random() * 5 + 2}px`,
                        animationDuration: `${Math.random() * 5 + 5}s`,
                        animationDelay: `${Math.random() * 5}s`,
                    }}
                />
            ))}
        </div>
    );
}
