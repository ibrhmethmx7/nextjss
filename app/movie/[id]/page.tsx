"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Star, Edit2, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { database } from "@/lib/firebase";
import { ref, onValue, update, remove } from "firebase/database";

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

export default function MovieDetailPage() {
    const params = useParams();
    const movieId = params.id as string;
    const [movie, setMovie] = useState<Movie | null>(null);
    const [currentUser, setCurrentUser] = useState("");
    const [editRating, setEditRating] = useState(0);

    useEffect(() => {
        const user = localStorage.getItem("cinema_user");
        if (!user) {
            window.location.href = "/";
            return;
        }
        setCurrentUser(user);

        const movieRef = ref(database, `movies/${movieId}`);
        const unsubscribe = onValue(movieRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setMovie({ id: movieId, ...data });
                setEditRating(user === "ben" ? (data.myRating || 0) : (data.theirRating || 0));
            }
        });

        return () => unsubscribe();
    }, [movieId]);

    const updateRating = async (rating: number) => {
        const movieRef = ref(database, `movies/${movieId}`);
        const updateData = currentUser === "ben"
            ? { myRating: rating || null }
            : { theirRating: rating || null };
        await update(movieRef, updateData);
        setEditRating(rating);
    };

    const updateStatus = async (newStatus: string) => {
        const movieRef = ref(database, `movies/${movieId}`);
        await update(movieRef, { status: newStatus });
    };

    const deleteMovie = async () => {
        if (confirm("Bu filmi silmek istediğine emin misin?")) {
            await remove(ref(database, `movies/${movieId}`));
            window.location.href = "/dashboard";
        }
    };

    if (!movie) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
                <div className="animate-pulse">Yükleniyor...</div>
            </div>
        );
    }

    const statusLabels: Record<string, string> = {
        watching: "İzliyoruz",
        watchlist: "İzleyeceğiz",
        completed: "Bitirdik",
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f1a] to-[#0a0a0a] text-white">
            {/* Hero */}
            <div className="relative h-[50vh] overflow-hidden">
                <img
                    src={movie.poster}
                    alt={movie.title}
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/50 to-transparent" />

                {/* Back button */}
                <Link href="/dashboard" className="absolute top-4 left-4 z-10">
                    <Button variant="ghost" size="sm" className="rounded-full bg-black/50 backdrop-blur">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>

                {/* Delete button */}
                <button onClick={deleteMovie} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 backdrop-blur hover:bg-red-600 transition-colors">
                    <Trash2 className="h-5 w-5" />
                </button>
            </div>

            {/* Content */}
            <div className="px-4 -mt-20 relative z-10 pb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Title */}
                    <div>
                        <h1 className="text-3xl font-bold">{movie.title}</h1>
                        {movie.year && <p className="text-gray-400 mt-1">{movie.year}</p>}
                    </div>

                    {/* Status */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {["watchlist", "watching", "completed"].map((s) => (
                            <Button
                                key={s}
                                size="sm"
                                variant={movie.status === s ? "default" : "outline"}
                                className={`rounded-full whitespace-nowrap ${movie.status === s ? "bg-red-600" : "border-white/10"
                                    }`}
                                onClick={() => updateStatus(s)}
                            >
                                {statusLabels[s]}
                            </Button>
                        ))}
                    </div>

                    {/* Ratings */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                            <p className="text-sm text-blue-400 mb-2 text-center">💙 Onun Puanı</p>
                            <div className="flex justify-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`h-6 w-6 ${star <= (movie.myRating || 0) ? "text-yellow-400 fill-current" : "text-gray-600"
                                            }`}
                                    />
                                ))}
                            </div>
                            {currentUser === "ben" && (
                                <p className="text-xs text-center mt-2 text-gray-500">Senin puanın</p>
                            )}
                        </div>

                        <div className="p-4 bg-pink-500/10 rounded-2xl border border-pink-500/20">
                            <p className="text-sm text-pink-400 mb-2 text-center">💖 Onun Puanı</p>
                            <div className="flex justify-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`h-6 w-6 ${star <= (movie.theirRating || 0) ? "text-yellow-400 fill-current" : "text-gray-600"
                                            }`}
                                    />
                                ))}
                            </div>
                            {currentUser === "sen" && (
                                <p className="text-xs text-center mt-2 text-gray-500">Senin puanın</p>
                            )}
                        </div>
                    </div>

                    {/* Your Rating */}
                    <div className="p-4 bg-white/5 rounded-2xl">
                        <p className="text-sm text-gray-400 mb-3 text-center">
                            {currentUser === "ben" ? "💙" : "💖"} Puanını Güncelle
                        </p>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <motion.button
                                    key={star}
                                    whileTap={{ scale: 0.8 }}
                                    onClick={() => updateRating(star === editRating ? 0 : star)}
                                >
                                    <Star
                                        className={`h-8 w-8 transition-all ${star <= editRating
                                                ? "text-yellow-400 fill-current drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                                                : "text-gray-600 hover:text-gray-400"
                                            }`}
                                    />
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Watch Button */}
                    {movie.videoUrl ? (
                        <a href={movie.videoUrl} target="_blank" rel="noopener noreferrer">
                            <Button className="w-full h-14 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl text-lg">
                                <Play className="h-5 w-5 mr-2" /> İzle
                                <ExternalLink className="h-4 w-4 ml-2" />
                            </Button>
                        </a>
                    ) : (
                        <Link href={`/movies?title=${encodeURIComponent(movie.title)}`}>
                            <Button className="w-full h-14 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl text-lg">
                                <Play className="h-5 w-5 mr-2" /> Birlikte İzle
                            </Button>
                        </Link>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
