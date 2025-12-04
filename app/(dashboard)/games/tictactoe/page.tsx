"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Heart, X } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

export default function TicTacToeGame() {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [winner, setWinner] = useState<string | null>(null);

    const checkWinner = (squares: any[]) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6],
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        return null;
    };

    const handleClick = (i: number) => {
        if (winner || board[i]) return;

        const newBoard = [...board];
        newBoard[i] = isXNext ? "X" : "O";
        setBoard(newBoard);
        setIsXNext(!isXNext);

        const gameWinner = checkWinner(newBoard);
        if (gameWinner) {
            setWinner(gameWinner);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#ff0000', '#ff69b4']
            });
        } else if (!newBoard.includes(null)) {
            setWinner("Draw");
        }
    };

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setIsXNext(true);
        setWinner(null);
    };

    return (
        <div className="max-w-md mx-auto space-y-8 text-center">
            <div className="flex items-center justify-between">
                <Link href="/games">
                    <Button variant="ghost" className="text-white hover:text-primary">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Geri
                    </Button>
                </Link>
                <h1 className="text-3xl font-romantic text-primary">Aşk XOX</h1>
                <Button variant="ghost" size="icon" onClick={resetGame} className="text-white hover:text-primary">
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>

            <div className="bg-black/40 backdrop-blur-md p-8 rounded-2xl border border-white/10 inline-block">
                <div className="grid grid-cols-3 gap-4">
                    {board.map((square, i) => (
                        <motion.button
                            key={i}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleClick(i)}
                            className={cn(
                                "w-20 h-20 rounded-xl flex items-center justify-center text-4xl shadow-lg transition-all",
                                square ? "bg-white/10" : "bg-white/5 hover:bg-white/10",
                                winner && "opacity-50"
                            )}
                        >
                            {square === "X" && <X className="w-10 h-10 text-cyan-400" strokeWidth={3} />}
                            {square === "O" && <Heart className="w-10 h-10 text-pink-500 fill-current" />}
                        </motion.button>
                    ))}
                </div>
            </div>

            <div className="h-12">
                {winner ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl font-bold text-white"
                    >
                        {winner === "Draw" ? "Berabere! 🤝" : `${winner === "X" ? "Mavi" : "Pembe"} Kazandı! 🎉`}
                    </motion.div>
                ) : (
                    <p className="text-muted-foreground">
                        Sıra: <span className={isXNext ? "text-cyan-400" : "text-pink-500"}>{isXNext ? "Mavi (X)" : "Pembe (❤️)"}</span>
                    </p>
                )}
            </div>
        </div>
    );
}
