"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
    const router = useRouter();
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
            router.push("/");
            return;
        }
        setCurrentUser(user);
    }, [router]);

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
            router.push("/dashboard");
        } catch (error: any) {
            console.error("Firebase error:", error);
            alert(`Hata: ${error.message || "Bilinmeyen hata"}`);
            setLoading(false);
        }
    };

    const statusOptions = [
        { id: "watchlist", label: "İzleyeceğiz", icon: "bookmark" },
        { id: "watching", label: "İzliyoruz", icon: "play_circle" },
        { id: "completed", label: "Bitirdik", icon: "check_circle" },
    ];

    return (
        <div className="min-h-screen bg-[#141414] text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/5">
                <div className="px-4 py-4 flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <span className="material-icons-round">arrow_back</span>
                    </Link>
                    <h1 className="text-xl font-semibold">Film Ekle</h1>
                </div>
            </header>

            <main className="max-w-lg mx-auto p-4 space-y-6">
                {/* YouTube Search - Only show if no video selected */}
                {!selectedVideo && (
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm text-gray-400">
                            <span className="material-icons text-red-500 text-lg">youtube_searched_for</span>
                            YouTube'da Ara
                        </label>
                        <div className="flex gap-2">
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                                placeholder="Film veya video ara..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500"
                                style={{ fontSize: '16px' }}
                            />
                            <button
                                onClick={handleSearch}
                                disabled={searching}
                                className="bg-red-600 hover:bg-red-700 px-4 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <span className="material-icons">search</span>
                            </button>
                        </div>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div className="bg-white/5 rounded-lg p-2 space-y-1 max-h-80 overflow-y-auto">
                                {searchResults.map((item) => (
                                    <div
                                        key={item.id.videoId}
                                        onClick={() => selectVideo(item)}
                                        className="flex gap-3 p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
                                    >
                                        <img
                                            src={item.snippet.thumbnails.default.url}
                                            alt=""
                                            className="w-28 h-20 object-cover rounded"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium line-clamp-2">{item.snippet.title}</p>
                                            <p className="text-xs text-gray-500 mt-1">{item.snippet.channelTitle}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Selected Video */}
                {selectedVideo && (
                    <div className="bg-white/5 rounded-lg p-4 relative">
                        <button
                            onClick={clearSelection}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 hover:bg-red-600 transition-colors"
                        >
                            <span className="material-icons text-sm">close</span>
                        </button>
                        <div className="flex gap-4">
                            <img src={poster} alt="" className="w-24 h-32 object-cover rounded" />
                            <div className="flex-1">
                                <p className="font-medium line-clamp-2">{title}</p>
                                <p className="text-xs text-gray-500 mt-1">{selectedVideo.snippet.channelTitle}</p>
                                <div className="mt-3 flex items-center gap-2 text-green-500 text-sm">
                                    <span className="material-icons text-lg">check_circle</span>
                                    Video seçildi
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Manual Input - Only show if no video selected */}
                {!selectedVideo && (
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm text-gray-400">
                            <span className="material-icons-outlined text-lg">movie</span>
                            veya Manuel Ekle
                        </label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Film adı..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30"
                            style={{ fontSize: '16px' }}
                        />
                    </div>
                )}

                {/* Status */}
                <div className="space-y-3">
                    <label className="text-sm text-gray-400">Durum</label>
                    <div className="grid grid-cols-3 gap-2">
                        {statusOptions.map((s) => (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => setStatus(s.id as any)}
                                className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${status === s.id
                                        ? "bg-white text-black"
                                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                                    }`}
                            >
                                <span className="material-icons-round">{s.icon}</span>
                                <span className="text-xs">{s.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Rating */}
                <div className="bg-white/5 rounded-lg p-4">
                    <label className="text-sm text-gray-400 text-center block mb-3">Puanım</label>
                    <div className="flex gap-2 justify-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setMyRating(star === myRating ? 0 : star)}
                                className="transition-transform hover:scale-110"
                            >
                                <span
                                    className={`material-icons text-3xl ${star <= myRating ? "text-yellow-400" : "text-gray-600"
                                        }`}
                                >
                                    {star <= myRating ? "star" : "star_border"}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    disabled={loading || !title}
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <span className="material-icons">add</span>
                            Ekle
                        </>
                    )}
                </button>
            </main>
        </div>
    );
}
