"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { quizQuestions } from "@/lib/data";
import { CheckCircle, XCircle, Trophy, RefreshCcw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

export default function QuizPage() {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showScore, setShowScore] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    const handleAnswerClick = (optionIndex: number) => {
        if (isAnswered) return;

        setSelectedOption(optionIndex);
        setIsAnswered(true);

        if (optionIndex === quizQuestions[currentQuestion].correctAnswer) {
            setScore(score + 1);
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.7 },
                colors: ['#c21e56', '#d4af37']
            });
        }
    };

    const handleNextQuestion = () => {
        const nextQuestion = currentQuestion + 1;
        if (nextQuestion < quizQuestions.length) {
            setCurrentQuestion(nextQuestion);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setShowScore(true);
            if (score + (selectedOption === quizQuestions[currentQuestion].correctAnswer ? 1 : 0) === quizQuestions.length) {
                confetti({
                    particleCount: 200,
                    spread: 100,
                    origin: { y: 0.6 },
                    colors: ['#c21e56', '#d4af37', '#ffffff']
                });
            }
        }
    };

    const resetQuiz = () => {
        setCurrentQuestion(0);
        setScore(0);
        setShowScore(false);
        setSelectedOption(null);
        setIsAnswered(false);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/games">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft />
                    </Button>
                </Link>
                <h1 className="text-3xl font-romantic text-primary">İlişki Testi</h1>
            </div>

            <AnimatePresence mode="wait">
                {showScore ? (
                    <motion.div
                        key="score"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <Card className="border-pink-200 shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-3xl text-primary flex flex-col items-center gap-4">
                                    <Trophy size={64} className="text-yellow-500 animate-bounce" />
                                    Test Tamamlandı!
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-2xl font-bold">
                                    Skorun: {score} / {quizQuestions.length}
                                </p>
                                <p className="text-muted-foreground text-lg">
                                    {score === quizQuestions.length
                                        ? "Mükemmel! Bizi çok iyi tanıyorsun ❤️"
                                        : score > quizQuestions.length / 2
                                            ? "Harika! Ama biraz daha çalışmalısın 😉"
                                            : "Olsun, seni yine de seviyorum 😘"}
                                </p>
                            </CardContent>
                            <CardFooter className="justify-center">
                                <Button onClick={resetQuiz} variant="outline" className="gap-2">
                                    <RefreshCcw size={16} />
                                    Tekrar Oyna
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div
                        key={currentQuestion}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <Card className="border-pink-200 shadow-lg">
                            <CardHeader>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-muted-foreground">
                                        Soru {currentQuestion + 1} / {quizQuestions.length}
                                    </span>
                                    <span className="text-sm font-bold text-primary">
                                        Puan: {score}
                                    </span>
                                </div>
                                <CardTitle className="text-xl md:text-2xl">
                                    {quizQuestions[currentQuestion].question}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {quizQuestions[currentQuestion].options.map((option, index) => {
                                    const isSelected = selectedOption === index;
                                    const isCorrect = index === quizQuestions[currentQuestion].correctAnswer;

                                    let variant = "outline";
                                    if (isAnswered) {
                                        if (isSelected && isCorrect) variant = "default"; // Correct selection
                                        else if (isSelected && !isCorrect) variant = "destructive"; // Wrong selection
                                        else if (isCorrect) variant = "default"; // Show correct answer
                                    }

                                    return (
                                        <Button
                                            key={index}
                                            variant={variant as any}
                                            className={cn(
                                                "w-full justify-start text-left h-auto py-4 text-base",
                                                isAnswered && !isSelected && !isCorrect && "opacity-50"
                                            )}
                                            onClick={() => handleAnswerClick(index)}
                                            disabled={isAnswered}
                                        >
                                            {isAnswered && isCorrect && <CheckCircle className="mr-2 h-5 w-5 text-green-500" />}
                                            {isAnswered && isSelected && !isCorrect && <XCircle className="mr-2 h-5 w-5 text-white" />}
                                            {!isAnswered && <div className="w-5 mr-2" />} {/* Spacer */}
                                            {option}
                                        </Button>
                                    );
                                })}
                            </CardContent>
                            <CardFooter className="justify-end">
                                {isAnswered && (
                                    <Button onClick={handleNextQuestion} className="gap-2 animate-pulse">
                                        {currentQuestion === quizQuestions.length - 1 ? "Sonucu Gör" : "Sonraki Soru"}
                                        <ArrowLeft className="rotate-180" size={16} />
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
