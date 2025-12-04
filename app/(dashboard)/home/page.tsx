"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { quotes, relationshipDate } from "@/lib/data";

export default function HomePage() {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [quote, setQuote] = useState("");
    const [displayedQuote, setDisplayedQuote] = useState("");

    useEffect(() => {
        // Set random quote
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        setQuote(randomQuote);

        // Typing effect
        let i = 0;
        const typingInterval = setInterval(() => {
            if (i < randomQuote.length) {
                setDisplayedQuote(randomQuote.substring(0, i + 1));
                i++;
            } else {
                clearInterval(typingInterval);
            }
        }, 50);

        // Countdown timer
        const timer = setInterval(() => {
            const now = new Date();
            const nextYear = new Date(now.getFullYear() + 1, 0, 1);

            setTimeLeft({
                days: differenceInDays(nextYear, now),
                hours: differenceInHours(nextYear, now) % 24,
                minutes: differenceInMinutes(nextYear, now) % 60,
                seconds: differenceInSeconds(nextYear, now) % 60,
            });
        }, 1000);

        return () => {
            clearInterval(timer);
            clearInterval(typingInterval);
        };
    }, []);

    const daysTogether = differenceInDays(new Date(), relationshipDate);

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-12 text-center">
            {/* Welcome Section */}
            <div className="space-y-6">
                <motion.h1
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="text-6xl md:text-9xl font-romantic text-primary drop-shadow-lg"
                >
                    Hoşgeldin Sevgilim
                </motion.h1>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="h-8"
                >
                    <p className="text-2xl md:text-3xl text-muted-foreground italic font-light">
                        "{displayedQuote}"
                        <span className="animate-pulse">|</span>
                    </p>
                </motion.div>
            </div>

            {/* Stats & Countdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                {/* Relationship Counter */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    whileHover={{ scale: 1.05 }}
                    className="relative group"
                >
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-2xl group-hover:bg-primary/40 transition-colors duration-500" />
                    <Card className="relative bg-black/40 backdrop-blur-md border-white/10 h-full overflow-hidden">
                        <CardContent className="flex flex-col items-center justify-center h-48 p-6">
                            <Heart className="w-12 h-12 text-primary fill-current animate-pulse mb-4 drop-shadow-[0_0_10px_rgba(255,0,127,0.8)]" />
                            <span className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500 tracking-tighter drop-shadow-sm">
                                {daysTogether}
                            </span>
                            <p className="text-xl text-primary/80 mt-2 font-medium">Gün Dolusu Aşk</p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* New Year Countdown */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7, type: "spring" }}
                    whileHover={{ scale: 1.05 }}
                    className="relative group"
                >
                    <div className="absolute inset-0 bg-secondary/20 blur-xl rounded-2xl group-hover:bg-secondary/40 transition-colors duration-500" />
                    <Card className="relative bg-black/40 backdrop-blur-md border-white/10 h-full overflow-hidden">
                        <CardContent className="flex flex-col items-center justify-center h-48 p-6">
                            <div className="flex items-center gap-2 mb-6 text-secondary">
                                <Calendar className="w-6 h-6 drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                                <span className="text-lg font-medium">Yeni Yıla Kalan</span>
                            </div>
                            <div className="grid grid-cols-4 gap-4 text-center w-full text-white">
                                {[
                                    { val: timeLeft.days, label: "Gün" },
                                    { val: timeLeft.hours, label: "Saat" },
                                    { val: timeLeft.minutes, label: "Dk" },
                                    { val: timeLeft.seconds, label: "Sn" },
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col items-center">
                                        <div className="text-3xl md:text-4xl font-bold tabular-nums text-secondary drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]">
                                            {item.val}
                                        </div>
                                        <div className="text-xs opacity-70 uppercase tracking-wider mt-1 text-secondary/80">{item.label}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
