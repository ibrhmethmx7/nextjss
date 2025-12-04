"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import {
    Film, Play, Clock, CheckCircle, Plus, Star,
    LogOut, PlayCircle, User
} from "lucide-react";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

type Movie = {
    id: string;
    title: string;
    poster: string;
    year?: string;
    myRating?: number;
    theirRating?: number;
    status: "watching" | "watchlist" | "completed";
    videoUrl?: string;
    addedAt: number;
};

export default function DashboardPage() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [activeTab, setActiveTab] = useState<"watching" | "watchlist" | "completed">("watching");
    const [currentUser, setCurrentUser] = useState<string>("");
    const [userName, setUserName] = useState<string>("");

    useEffect(() => {
        // Check auth
        if (typeof window !== "undefined") {
            const user = localStorage.getItem("cinema_user");
            const name = localStorage.getItem("cinema_user_name");
            if (!user) {
                window.location.href = "/";
                return;
            }
            setCurrentUser(user);
            setUserName(name || "");
        }

        // Load movies from Firebase
        const moviesRef = ref(database, "movies");
        const unsubscribe = onValue(moviesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const movieList = Object.entries(data).map(([id, movie]: [string, any]) => ({
                    id,
                    ...movie,
                }));
                setMovies(movieList.sort((a, b) => b.addedAt - a.addedAt));
            }
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("cinema_user");
        localStorage.removeItem("cinema_user_name");
        window.location.href = "/";
    };

    const filteredMovies = movies.filter((m) => m.status === activeTab);

    const tabs = [
        { id: "watching", label: "İzliyoruz", icon: Play, color: "from-blue-600 to-blue-800" },
        { id: "watchlist", label: "İzleyeceğiz", icon: Clock, color: "from-yellow-600 to-orange-700" },
        { id: "completed", label: "Bitirdik", icon: CheckCircle, color: "from-green-600 to-emerald-700" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f1a] to-[#0a0a0a] text-white pb-24">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
                <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
                            <Film className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">Bizim Sinemamız</h1>
                            <p className="text-xs text-gray-500">Merhaba {userName} {currentUser === "ben" ? "💙" : "💖"}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/add-movie">
                            <Button size="sm" className="bg-red-600 hover:bg-red-700 rounded-full h-9 w-9 p-0">
                                <Plus className="h-5 w-5" />
                            </Button>
                        </Link>
                        <Button size="sm" variant="ghost" onClick={handleLogout} className="rounded-full h-9 w-9 p-0">
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="px-4 py-4">
                <div className="grid grid-cols-3 gap-3">
                    {tabs.map((tab) => {
                        const count = movies.filter(m => m.status === tab.id).length;
                        return (
                            <motion.button
                                key={tab.id}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`relative overflow-hidden rounded-2xl p-4 transition-all ${activeTab === tab.id ? "ring-2 ring-white/30" : ""
                                    }`}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${tab.color} opacity-80`} />
                                <div className="relative">
                                    <tab.icon className="h-6 w-6 mb-2" />
                                    <p className="text-2xl font-bold">{count}</p>
                                    <p className="text-xs opacity-80">{tab.label}</p>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Section Title */}
            <div className="px-4 py-2 flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                    {tabs.find(t => t.id === activeTab)?.label}
                </h2>
                <span className="text-sm text-gray-500">{filteredMovies.length} film</span>
            </div>

            {/* Movie Grid */}
            <div className="px-4">
                <AnimatePresence mode="wait">
                    {filteredMovies.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-16"
                        >
                            <Film className="h-16 w-16 mx-auto mb-4 text-gray-700" />
                            <p className="text-gray-500 mb-4">Bu listede henüz film yok</p>
                            <Link href="/add-movie">
                                <Button className="bg-red-600 hover:bg-red-700 rounded-full">
                                    <Plus className="h-4 w-4 mr-2" /> Film Ekle
                                </Button>
                            </Link>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                        >
                            {filteredMovies.map((movie, index) => (
                                <motion.div
                                    key={movie.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link href={`/movie/${movie.id}`}>
                                        <div className="group cursor-pointer">
                                            <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-800 shadow-lg">
                                                <img
                                                    src={movie.poster || `https://picsum.photos/seed/${movie.id}/300/450`}
                                                    alt={movie.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />

                                                {/* Overlay on hover */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <PlayCircle className="h-12 w-12 text-white" />
                                                </div>

                                                {/* Continue watching badge */}
                                                {activeTab === "watching" && (
                                                    <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                                        <Play className="h-3 w-3" /> Devam et
                                                    </div>
                                                )}

                                                {/* Ratings */}
                                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
                                                    <div className="flex justify-between items-center">
                                                        {movie.myRating && (
                                                            <span className="bg-blue-500/80 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                                                💙 {movie.myRating}
                                                            </span>
                                                        )}
                                                        {movie.theirRating && (
                                                            <span className="bg-pink-500/80 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                                                💖 {movie.theirRating}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <h3 className="mt-2 text-sm font-medium truncate">{movie.title}</h3>
                                            {movie.year && <p className="text-xs text-gray-500">{movie.year}</p>}
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/5 p-4 safe-area-pb">
                <div className="flex justify-center gap-4">
                    <Link href="/movies">
                        <Button className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-full px-6">
                            <Play className="h-4 w-4 mr-2" /> Birlikte İzle
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
