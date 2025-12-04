"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Puzzle, Type, X, Cookie, Play } from "lucide-react";
import Link from "next/link";

const games = [
    {
        id: "quiz",
        title: "Aşk Testi",
        description: "Beni ne kadar iyi tanıyorsun? Soruları cevapla!",
        icon: Brain,
        href: "/games/quiz",
        color: "text-pink-500",
    },
    {
        id: "puzzle",
        title: "Puzzle",
        description: "Fotoğrafımızı tamamla ve sürprizi gör.",
        icon: Puzzle,
        href: "/games/puzzle",
        color: "text-purple-500",
    },
    {
        id: "wordle",
        title: "Aşk Wordle",
        description: "Günün aşk kelimesini tahmin et.",
        icon: Type,
        href: "/games/wordle",
        color: "text-green-500",
    },
    {
        id: "tictactoe",
        title: "Aşk XOX",
        description: "Kalplerle XOX oyna.",
        icon: X,
        href: "/games/tictactoe",
        color: "text-cyan-500",
    },
    {
        id: "fortune",
        title: "Şans Kurabiyesi",
        description: "Bugünkü aşk mesajını al.",
        icon: Cookie,
        href: "/games/fortune",
        color: "text-yellow-500",
    },
];

export default function GamesPage() {
    return (
        <div className="space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-romantic text-primary drop-shadow-lg">Oyun Alanı</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Eğlenelim ve aşkımızı tazeleyelim...
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((game, index) => (
                    <motion.div
                        key={game.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                    >
                        <Card className="bg-black/40 backdrop-blur-md border-white/10 hover:border-primary/50 transition-all group h-full flex flex-col">
                            <CardHeader>
                                <div className={`w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-white/10 transition-colors ${game.color}`}>
                                    <game.icon size={24} />
                                </div>
                                <CardTitle className="text-xl text-white">{game.title}</CardTitle>
                                <CardDescription className="text-gray-400">{game.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="mt-auto">
                                <Link href={game.href}>
                                    <Button className="w-full gap-2 group-hover:bg-primary group-hover:text-white transition-colors">
                                        <Play size={16} /> Oyna
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
