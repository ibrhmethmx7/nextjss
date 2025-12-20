"use client";

import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { motion, AnimatePresence } from "framer-motion";

export default function SurpriseEffect({ roomId }: { roomId: string }) {
    const lastTriggeredRef = useRef<number>(0);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!roomId) return;

        const surpriseRef = ref(database, `rooms/${roomId}/surprise`);

        const unsubscribe = onValue(surpriseRef, (snapshot) => {
            const data = snapshot.val();

            if (!data) return;

            const timestamp = data.timestamp;
            const msg = data.message;

            // Only trigger if it's a new timestamp and not the initial load (unless it's very recent)
            if (timestamp && timestamp > lastTriggeredRef.current) {
                lastTriggeredRef.current = timestamp;

                // Avoid triggering on initial page load if the surprise is old (> 10 seconds)
                if (Date.now() - timestamp < 10000) {
                    fireFlowerConfetti();
                    if (msg) {
                        setMessage(msg);
                        // Hide message after 8 seconds
                        setTimeout(() => setMessage(null), 8000);
                    }
                }
            }
        });

        return () => unsubscribe();
    }, [roomId]);

    const fireFlowerConfetti = () => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            // Flower colors: Pinks, Reds, Whites, Purples
            const colors = ['#ff0000', '#ff69b4', '#ffc0cb', '#ffffff', '#800080'];

            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                colors: colors,
                shapes: ['circle'],
                scalar: 1.2
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                colors: colors,
                shapes: ['circle'],
                scalar: 1.2
            });
        }, 250);
    };

    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="fixed top-20 left-0 right-0 z-[9999] flex justify-center pointer-events-none"
                >
                    <div className="relative">
                        {/* Decorative Elements */}
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 5 }}
                            className="absolute -top-6 -left-8 text-4xl"
                        >
                            🌸
                        </motion.div>
                        <motion.div
                            animate={{ rotate: [0, -10, 10, 0] }}
                            transition={{ repeat: Infinity, duration: 6 }}
                            className="absolute -bottom-4 -right-8 text-4xl"
                        >
                            🦋
                        </motion.div>
                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                            className="absolute -top-8 right-10 text-3xl"
                        >
                            🐞
                        </motion.div>

                        {/* Message Box */}
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 px-12 py-6 rounded-full shadow-[0_0_50px_rgba(255,105,180,0.5)]">
                            <h2 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-red-300 font-great-vibes tracking-wide drop-shadow-lg text-center">
                                {message}
                            </h2>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
