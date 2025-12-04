"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RefreshCcw, Trophy } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

// Simple 3x3 sliding puzzle
const GRID_SIZE = 3;
const TILE_COUNT = GRID_SIZE * GRID_SIZE;

export default function PuzzlePage() {
    const [tiles, setTiles] = useState<number[]>([]);
    const [isSolved, setIsSolved] = useState(false);

    useEffect(() => {
        shuffleTiles();
    }, []);

    const shuffleTiles = () => {
        // Create solved state [0, 1, 2, ..., 8] where 8 is empty
        let newTiles = Array.from({ length: TILE_COUNT }, (_, i) => i);

        // Shuffle (simple random swap for now, ensuring solvability is complex so we'll just do random valid moves)
        // Better approach: Start solved and make N random valid moves
        let emptyIdx = TILE_COUNT - 1;
        let previousIdx = -1;

        for (let i = 0; i < 100; i++) {
            const moves = getValidMoves(emptyIdx);
            // Filter out undoing the last move to ensure mixing
            const validMoves = moves.filter(m => m !== previousIdx);
            const move = validMoves[Math.floor(Math.random() * validMoves.length)];

            [newTiles[emptyIdx], newTiles[move]] = [newTiles[move], newTiles[emptyIdx]];
            previousIdx = emptyIdx;
            emptyIdx = move;
        }

        setTiles(newTiles);
        setIsSolved(false);
    };

    const getValidMoves = (emptyIdx: number) => {
        const moves = [];
        const row = Math.floor(emptyIdx / GRID_SIZE);
        const col = emptyIdx % GRID_SIZE;

        if (row > 0) moves.push(emptyIdx - GRID_SIZE); // Up
        if (row < GRID_SIZE - 1) moves.push(emptyIdx + GRID_SIZE); // Down
        if (col > 0) moves.push(emptyIdx - 1); // Left
        if (col < GRID_SIZE - 1) moves.push(emptyIdx + 1); // Right

        return moves;
    };

    const handleTileClick = (index: number) => {
        if (isSolved) return;

        const emptyIdx = tiles.indexOf(TILE_COUNT - 1);
        const validMoves = getValidMoves(emptyIdx);

        if (validMoves.includes(index)) {
            const newTiles = [...tiles];
            [newTiles[emptyIdx], newTiles[index]] = [newTiles[index], newTiles[emptyIdx]];
            setTiles(newTiles);
            checkWin(newTiles);
        }
    };

    const checkWin = (currentTiles: number[]) => {
        const isWin = currentTiles.every((tile, index) => tile === index);
        if (isWin) {
            setIsSolved(true);
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    };

    return (
        <div className="max-w-md mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/games">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft />
                    </Button>
                </Link>
                <h1 className="text-3xl font-romantic text-primary">Aşk Yapbozu</h1>
            </div>

            <Card className="border-pink-200 shadow-xl overflow-hidden">
                <CardHeader className="text-center">
                    <CardTitle>
                        {isSolved ? (
                            <span className="text-green-600 flex items-center justify-center gap-2">
                                <Trophy className="animate-bounce" /> Harika!
                            </span>
                        ) : (
                            "Resmi Tamamla"
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div
                        className="grid grid-cols-3 gap-1 bg-pink-100 p-1 rounded-lg aspect-square relative"
                    >
                        {tiles.map((tileNumber, index) => {
                            // Last tile is empty
                            if (tileNumber === TILE_COUNT - 1) {
                                return <div key="empty" className="bg-transparent" />;
                            }

                            // Calculate position in the original image
                            const x = (tileNumber % GRID_SIZE) * 100;
                            const y = Math.floor(tileNumber / GRID_SIZE) * 100;

                            return (
                                <motion.div
                                    key={tileNumber}
                                    layout
                                    className="w-full h-full cursor-pointer rounded-sm overflow-hidden shadow-sm"
                                    onClick={() => handleTileClick(index)}
                                    whileHover={{ scale: 0.98 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <div
                                        className="w-full h-full bg-cover"
                                        style={{
                                            backgroundImage: 'url("https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop")',
                                            backgroundPosition: `${x}% ${y}%`,
                                            backgroundSize: '300%',
                                        }}
                                    />
                                </motion.div>
                            );
                        })}

                        {isSolved && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 z-10"
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop"
                                    alt="Solved"
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            </motion.div>
                        )}
                    </div>

                    <div className="mt-6 flex justify-center">
                        <Button onClick={shuffleTiles} variant="outline" className="gap-2">
                            <RefreshCcw size={16} />
                            Karıştır
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
