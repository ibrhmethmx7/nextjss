"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Film, Plus, Star, Search, X, PlayCircle } from "lucide-react";
import Link from "next/link";
import { database, YOUTUBE_API_KEY } from "@/lib/firebase";
import { ref, push, set } from "firebase/database";

async function searchYouTube(query: string): Promise<any[]> {
    try {
        const res = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=8&q=${encodeURIComponent(query)}&type=video&key=${YOUTUBE_API_KEY}`
        );
        const data = await res.json();
        return data.items || [];
    } catch (e) {
        console.error("YouTube search error:", e);
        return [];
    }
}

export default function AddMoviePage() {
    const [title, setTitle] = useState("");
    const [poster, setPoster] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [status, setStatus] = useState<"watching" | "watchlist" | "completed">("watchlist");
    const [myRating, setMyRating] = useState(0);
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState("");

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<any>(null);

    useEffect(() => {
        const user = localStorage.getItem("cinema_user");
        if (!user) {
            window.location.href = "/";
            return;
        }
        setCurrentUser(user);
    }, []);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        const results = await searchYouTube(searchQuery);
        setSearchResults(results);
        setSearching(false);
    };

    const selectVideo = (item: any) => {
        setSelectedVideo(item);
        setTitle(item.snippet.title);
        setPoster(item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url);
        setVideoUrl(`https://www.youtube.com/watch?v=${item.id.videoId}`);
        setSearchResults([]);
        setSearchQuery("");
    };

    const clearSelection = () => {
        setSelectedVideo(null);
        setTitle("");
        setPoster("");
        setVideoUrl("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) {
            alert("Film adı gerekli!");
            return;
        }

        setLoading(true);
        try {
            const moviesRef = ref(database, "movies");
            const newMovieRef = push(moviesRef);

            const movieData: any = {
                title,
                poster: poster || `https://picsum.photos/seed/${encodeURIComponent(title)}/300/450`,
                status,
                videoUrl: videoUrl || "",
                addedAt: Date.now(),
                addedBy: currentUser,
            };

            if (currentUser === "ben" && myRating > 0) {
                movieData.myRating = myRating;
            } else if (currentUser === "sen" && myRating > 0) {
                movieData.theirRating = myRating;
            }

            await set(newMovieRef, movieData);
            window.location.href = "/dashboard";
        } catch (error: any) {
            console.error("Firebase error:", error);
            alert(`Hata: ${error.message || "Bilinmeyen hata"}`);
            setLoading(false);
        }
    };

    const statusOptions = [
        { id: "watchlist", label: "İzleyeceğiz", color: "from-yellow-600 to-orange-600" },
        { id: "watching", label: "İzliyoruz", color: "from-blue-600 to-indigo-600" },
        { id: "completed", label: "Bitirdik", color: "from-green-600 to-emerald-600" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f1a] to-[#0a0a0a] text-white p-4 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-xl font-bold">Film/Video Ekle</h1>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-lg mx-auto space-y-6"
            >
                {/* YouTube Search */}
                <div className="space-y-3">
                    <label className="text-sm text-gray-400 flex items-center gap-2">
                        <PlayCircle className="h-4 w-4 text-red-500" /> YouTube'da Ara
                    </label>
                    <div className="flex gap-2">
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                            placeholder="Film veya video ara..."
                            className="bg-white/5 border-white/10 text-white h-12 rounded-xl"
                            style={{ fontSize: '16px' }}
                        />
                        <Button onClick={handleSearch} disabled={searching} className="bg-red-600 hover:bg-red-700 h-12 px-4 rounded-xl">
                            <Search className="h-5 w-5" />
                        </Button>
                    </div>

                    {searchResults.length > 0 && (
                        <div className="bg-white/5 rounded-xl p-3 space-y-2 max-h-80 overflow-y-auto">
                            {searchResults.map((item) => (
                                <div
                                    key={item.id.videoId}
                                    onClick={() => selectVideo(item)}
                                    className="flex gap-3 p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
                                >
                                    <img src={item.snippet.thumbnails.default.url} alt="" className="w-28 h-20 object-cover rounded-lg" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium line-clamp-2">{item.snippet.title}</p>
                                        <p className="text-xs text-gray-500 mt-1">{item.snippet.channelTitle}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Selected Video */}
                {selectedVideo && (
                    <div className="bg-white/5 rounded-xl p-4 relative">
                        <button onClick={clearSelection} className="absolute top-2 right-2 p-1 rounded-full bg-black/50 hover:bg-red-600">
                            <X className="h-4 w-4" />
                        </button>
                        <div className="flex gap-4">
                            <img src={poster} alt="" className="w-24 h-32 object-cover rounded-lg" />
                            <div className="flex-1">
                                <p className="font-medium">{title}</p>
                                <p className="text-xs text-gray-500 mt-1">{selectedVideo.snippet.channelTitle}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Manual Input */}
                {!selectedVideo && (
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 flex items-center gap-2">
                            <Film className="h-4 w-4" /> veya Manuel Ekle
                        </label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Film adı..." className="bg-white/5 border-white/10 text-white h-12 rounded-xl" />
                    </div>
                )}

                {/* Status */}
                <div className="space-y-2">
                    <label className="text-sm text-gray-400">Durum</label>
                    <div className="grid grid-cols-3 gap-2">
                        {statusOptions.map((s) => (
                            <motion.button
                                key={s.id}
                                type="button"
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setStatus(s.id as any)}
                                className={`relative overflow-hidden rounded-xl p-3 transition-all ${status === s.id ? "ring-2 ring-white/50" : ""}`}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${s.color} ${status === s.id ? "opacity-100" : "opacity-30"}`} />
                                <span className="relative text-sm">{s.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Rating */}
                <div className="space-y-3 p-4 bg-white/5 rounded-2xl">
                    <label className="text-sm text-gray-400 text-center block">Puanım</label>
                    <div className="flex gap-1 justify-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <motion.button key={star} type="button" whileTap={{ scale: 0.8 }} onClick={() => setMyRating(star === myRating ? 0 : star)}>
                                <Star className={`h-8 w-8 ${star <= myRating ? "text-yellow-400 fill-current" : "text-gray-600"}`} />
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <Button
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 h-14 rounded-xl text-lg font-medium"
                    disabled={loading || !title}
                >
                    {loading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full" />
                    ) : (
                        <><Plus className="h-5 w-5 mr-2" /> Ekle</>
                    )}
                </Button>
            </motion.div>
        </div>
    );
}
