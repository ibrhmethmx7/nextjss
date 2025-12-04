"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

const TARGET_WORDS = ["SEVGI", "ASKIM", "HAYAT", "MELEK", "KALP", "MUTLU", "HUZUR", "CANIM", "GUZEL", "BIRIC"];

export default function WordleGame() {
    const [targetWord, setTargetWord] = useState("");
    const [guesses, setGuesses] = useState<string[]>([]);
    const [currentGuess, setCurrentGuess] = useState("");
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);

    useEffect(() => {
        startNewGame();
    }, []);

    const startNewGame = () => {
        const randomWord = TARGET_WORDS[Math.floor(Math.random() * TARGET_WORDS.length)];
        setTargetWord(randomWord);
        setGuesses([]);
        setCurrentGuess("");
        setGameOver(false);
        setWon(false);
    };

    const handleGuess = (e: React.FormEvent) => {
        e.preventDefault();
        if (gameOver || currentGuess.length !== 5) return;

        const upperGuess = currentGuess.toUpperCase();
        const newGuesses = [...guesses, upperGuess];
        setGuesses(newGuesses);
        setCurrentGuess("");

        if (upperGuess === targetWord) {
            setWon(true);
            setGameOver(true);
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#ff0000', '#ff69b4', '#ffd700']
            });
        } else if (newGuesses.length >= 6) {
            setGameOver(true);
        }
    };

    const getLetterColor = (letter: string, index: number, guess: string) => {
        if (letter === targetWord[index]) return "bg-green-500 border-green-500";
        if (targetWord.includes(letter)) return "bg-yellow-500 border-yellow-500";
        return "bg-gray-700 border-gray-700";
    };

    return (
        <div className="max-w-md mx-auto space-y-8 text-center">
            <div className="flex items-center justify-between">
                <Link href="/games">
                    <Button variant="ghost" className="text-white hover:text-primary">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Geri
                    </Button>
                </Link>
                <h1 className="text-3xl font-romantic text-primary">Aşk Wordle</h1>
                <Button variant="ghost" size="icon" onClick={startNewGame} className="text-white hover:text-primary">
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid gap-2 mb-8">
                {Array.from({ length: 6 }).map((_, i) => {
                    const guess = guesses[i];
                    return (
                        <div key={i} className="grid grid-cols-5 gap-2">
                            {Array.from({ length: 5 }).map((_, j) => {
                                const letter = guess ? guess[j] : (i === guesses.length ? currentGuess[j] : "");
                                const isCompleted = !!guess;
                                const colorClass = isCompleted ? getLetterColor(letter, j, guess) : "bg-white/5 border-white/20";

                                return (
                                    <motion.div
                                        key={j}
                                        initial={false}
                                        animate={isCompleted ? { rotateX: 360 } : {}}
                                        className={cn(
                                            "aspect-square flex items-center justify-center text-2xl font-bold border-2 rounded-md text-white transition-colors duration-500",
                                            colorClass
                                        )}
                                    >
                                        {letter}
                                    </motion.div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            {!gameOver ? (
                <form onSubmit={handleGuess} className="flex gap-2">
                    <Input
                        value={currentGuess}
                        onChange={(e) => {
                            const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 5);
                            setCurrentGuess(val);
                        }}
                        placeholder="5 harfli kelime..."
                        className="text-center uppercase tracking-widest text-lg bg-white/10 border-white/20 text-white"
                        autoFocus
                    />
                    <Button type="submit" disabled={currentGuess.length !== 5}>
                        Tahmin Et
                    </Button>
                </form>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-black/40 backdrop-blur-md p-6 rounded-xl border border-white/10"
                >
                    <h2 className="text-2xl font-bold mb-2 text-white">
                        {won ? "Tebrikler Sevgilim! 🎉" : "Üzülme Aşkım 🥺"}
                    </h2>
                    <p className="text-muted-foreground mb-4">
                        Doğru kelime: <span className="text-primary font-bold">{targetWord}</span>
                    </p>
                    <Button onClick={startNewGame} className="w-full">
                        Tekrar Oyna
                    </Button>
                </motion.div>
            )}
        </div>
    );
}
