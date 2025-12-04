"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Play, Search } from "lucide-react";
import Link from "next/link";
import { YOUTUBE_API_KEY } from "@/lib/firebase";

async function searchYouTube(query: string): Promise<any[]> {
    try {
        const res = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&type=video&key=${YOUTUBE_API_KEY}`
        );
        const data = await res.json();
        return data.items || [];
    } catch (e) {
        console.error("YouTube search error:", e);
        return [];
    }
}

export default function MoviesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        const results = await searchYouTube(searchQuery);
        setSearchResults(results);
        setSearching(false);
    };

    const playVideo = (item: any) => {
        const videoId = item.id.videoId;
        const title = encodeURIComponent(item.snippet.title);
        window.location.href = `/watch?url=https://www.youtube.com/watch?v=${videoId}&title=${title}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f1a] to-[#0a0a0a] text-white">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 p-3">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm" className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="text-lg font-bold">Birlikte İzle</h1>
                </div>
            </div>

            <div className="p-4 max-w-2xl mx-auto space-y-6">
                {/* YouTube Search */}
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                            placeholder="🔍 YouTube'da film veya video ara..."
                            className="bg-white/5 border-white/10 text-white h-14 rounded-2xl text-lg px-5"
                        />
                        <Button
                            onClick={handleSearch}
                            disabled={searching}
                            className="bg-red-600 hover:bg-red-700 h-14 px-6 rounded-2xl"
                        >
                            {searching ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                            ) : (
                                <Search className="h-5 w-5" />
                            )}
                        </Button>
                    </div>

                    {/* Popular suggestions */}
                    {searchResults.length === 0 && (
                        <div className="flex flex-wrap gap-2">
                            {["Film", "Dizi", "Romantik Komedi", "Korku", "Anime"].map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => { setSearchQuery(tag); }}
                                    className="px-4 py-2 bg-white/5 rounded-full text-sm hover:bg-white/10 transition-colors"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-sm text-gray-500">{searchResults.length} sonuç bulundu</p>
                        <div className="grid gap-3">
                            {searchResults.map((item) => (
                                <motion.div
                                    key={item.id.videoId}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => playVideo(item)}
                                    className="flex gap-4 p-3 bg-white/5 rounded-2xl hover:bg-white/10 cursor-pointer transition-all group"
                                >
                                    <div className="relative">
                                        <img
                                            src={item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url}
                                            alt=""
                                            className="w-40 h-24 object-cover rounded-xl"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                                            <Play className="h-10 w-10 text-white" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0 py-1">
                                        <h3 className="font-medium line-clamp-2 group-hover:text-red-400 transition-colors">
                                            {item.snippet.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">{item.snippet.channelTitle}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Or paste URL */}
                <div className="pt-6 border-t border-white/10">
                    <p className="text-sm text-gray-500 text-center mb-3">veya direkt link yapıştır</p>
                    <Input
                        placeholder="YouTube, Vimeo veya video linki..."
                        className="bg-white/5 border-white/10 text-white h-12 rounded-xl"
                        onKeyPress={(e) => {
                            if (e.key === "Enter") {
                                const url = (e.target as HTMLInputElement).value;
                                if (url) window.location.href = `/watch?url=${encodeURIComponent(url)}`;
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
