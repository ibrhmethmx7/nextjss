"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Cookie } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

const FORTUNES = [
    "Bugün seni harika bir sürpriz bekliyor!",
    "Aşk hayatın yıldızlar kadar parlak.",
    "Gülüşünle dünyayı aydınlatıyorsun.",
    "Seni seven biri seni düşünüyor.",
    "Bugün kalbinin sesini dinle.",
    "Mutluluk çok yakında kapını çalacak.",
    "Seninle her şey daha güzel.",
    "Gözlerindeki ışık hiç sönmesin.",
    "Bugün kendine bir güzellik yap.",
    "Aşk her zaman kazanır."
];

export default function FortuneGame() {
    const [fortune, setFortune] = useState<string | null>(null);
    const [isCracking, setIsCracking] = useState(false);

    const crackCookie = () => {
        if (fortune) {
            setFortune(null);
            return;
        }

        setIsCracking(true);
        setTimeout(() => {
            const randomFortune = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
            setFortune(randomFortune);
            setIsCracking(false);
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.7 },
                colors: ['#ffd700', '#ffa500']
            });
        }, 1000);
    };

    return (
        <div className="max-w-md mx-auto space-y-12 text-center">
            <div className="flex items-center justify-between">
                <Link href="/games">
                    <Button variant="ghost" className="text-white hover:text-primary">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Geri
                    </Button>
                </Link>
                <h1 className="text-3xl font-romantic text-primary">Şans Kurabiyesi</h1>
                <div className="w-10" />
            </div>

            <div className="relative h-64 flex items-center justify-center">
                <AnimatePresence mode="wait">
                    {!fortune ? (
                        <motion.button
                            key="cookie"
                            onClick={crackCookie}
                            disabled={isCracking}
                            className="relative group"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            animate={isCracking ? {
                                rotate: [0, -10, 10, -10, 10, 0],
                                transition: { duration: 0.5 }
                            } : {}}
                        >
                            <Cookie className="w-48 h-48 text-yellow-600 fill-current drop-shadow-2xl" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                    Kırmak için tıkla
                                </span>
                            </div>
                        </motion.button>
                    ) : (
                        <motion.div
                            key="message"
                            initial={{ opacity: 0, scale: 0.5, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="bg-white text-black p-8 rounded-lg shadow-2xl max-w-xs relative"
                        >
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white rotate-45" />
                            <p className="text-xl font-serif italic text-center leading-relaxed">
                                "{fortune}"
                            </p>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setFortune(null)}
                                className="mt-4 text-gray-500 hover:text-black w-full"
                            >
                                Yeni Kurabiye Al
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <p className="text-muted-foreground">
                Her gün bir tane açmayı unutma! 🥠
            </p>
        </div>
    );
}
