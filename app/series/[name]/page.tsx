"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { database } from "@/lib/firebase";
import { ref, onValue, update } from "firebase/database";

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

// Extract series name from title
function extractSeriesName(title: string): string {
    const cleanTitle = title
        .replace(/\s*\d+\.\s*[Bb]ölüm.*$/i, '')
        .replace(/\s*[Bb]ölüm\s*\d+.*$/i, '')
        .replace(/\s*[Ss]\d+[Ee]\d+.*$/i, '')
        .replace(/\s*[Ee]pisode\s*\d+.*$/i, '')
        .replace(/\s*-\s*\d+\s*$/i, '')
        .trim();
    return cleanTitle || title;
}

// Get highest quality YouTube thumbnail
function getHQThumbnail(url: string): string {
    if (!url) return "";
    if (url.includes("ytimg.com") || url.includes("youtube.com")) {
        const match = url.match(/\/vi\/([^/]+)\//);
        if (match) {
            return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
        }
    }
    return url;
}

export default function SeriesDetailPage() {
    const params = useParams();
    const router = useRouter();
    const seriesName = decodeURIComponent(params.name as string);
    const [episodes, setEpisodes] = useState<Movie[]>([]);
    const [allMovies, setAllMovies] = useState<Movie[]>([]);
    const [currentUser, setCurrentUser] = useState("");
    const [seriesRating, setSeriesRating] = useState({ myRating: 0, theirRating: 0 });

    useEffect(() => {
        const user = localStorage.getItem("cinema_user");
        if (!user) {
            router.push("/");
            return;
        }
        setCurrentUser(user);

        const moviesRef = ref(database, "movies");
        const unsubscribe = onValue(moviesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const movieList = Object.entries(data).map(([id, movie]: [string, any]) => ({
                    id,
                    ...movie,
                }));
                setAllMovies(movieList);

                // Filter episodes belonging to this series
                const seriesEpisodes = movieList
                    .filter((m) => extractSeriesName(m.title) === seriesName)
                    .sort((a, b) => a.title.localeCompare(b.title, 'tr'));

                setEpisodes(seriesEpisodes);

                // Calculate average rating from episodes
                if (seriesEpisodes.length > 0) {
                    const myRatings = seriesEpisodes.filter(e => e.myRating).map(e => e.myRating || 0);
                    const theirRatings = seriesEpisodes.filter(e => e.theirRating).map(e => e.theirRating || 0);

                    setSeriesRating({
                        myRating: myRatings.length > 0 ? Math.round(myRatings.reduce((a, b) => a + b, 0) / myRatings.length) : 0,
                        theirRating: theirRatings.length > 0 ? Math.round(theirRatings.reduce((a, b) => a + b, 0) / theirRatings.length) : 0
                    });
                }
            }
        });

        return () => unsubscribe();
    }, [seriesName, router]);

    const updateAllEpisodesRating = async (rating: number) => {
        const updateData = currentUser === "ben" ? { myRating: rating || null } : { theirRating: rating || null };

        // Update all episodes with this rating
        for (const episode of episodes) {
            const movieRef = ref(database, `movies/${episode.id}`);
            await update(movieRef, updateData);
        }
    };

    if (episodes.length === 0) {
        return (
            <div className="min-h-screen bg-[#141414] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const firstEpisode = episodes[0];

    return (
        <div className="min-h-screen bg-[#141414] text-white">
            {/* Fixed Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 to-transparent">
                <div className="px-4 md:px-12 py-4 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <span className="material-icons-round text-red-600 text-3xl">movie</span>
                        <span className="text-red-600 font-bold text-xl">SELOFLIX</span>
                    </Link>
                    <Link href="/add-movie" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <span className="material-icons-outlined text-white">add</span>
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <div className="relative h-[40vh] md:h-[50vh] pt-16">
                <img
                    src={getHQThumbnail(firstEpisode.poster)}
                    alt={seriesName}
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/80 via-transparent to-transparent" />

                {/* Series Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
                    <h1 className="text-3xl md:text-5xl font-bold mb-2">{seriesName}</h1>
                    <p className="text-gray-400 text-lg mb-4">{episodes.length} Bölüm</p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => {
                                if (firstEpisode.videoUrl) {
                                    router.push(`/watch?url=${encodeURIComponent(firstEpisode.videoUrl)}&title=${encodeURIComponent(firstEpisode.title)}&movieId=${firstEpisode.id}`);
                                }
                            }}
                            className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded font-semibold hover:bg-white/90 transition-colors"
                        >
                            <span className="material-icons-round">play_arrow</span>
                            İlk Bölümü Oynat
                        </button>
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 bg-gray-600/60 text-white px-6 py-3 rounded font-semibold hover:bg-gray-600/40 transition-colors"
                        >
                            <span className="material-icons-round">arrow_back</span>
                            Geri
                        </Link>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 md:px-12 py-8 space-y-8">

                {/* Episodes List */}
                <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="material-icons-round text-red-500">list</span>
                        Bölümler
                    </h3>
                    <div className="grid gap-3">
                        {episodes.map((episode, index) => (
                            <div
                                key={episode.id}
                                className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group"
                                onClick={() => router.push(`/movie/${episode.id}`)}
                            >
                                <span className="text-gray-500 text-lg w-8 text-center">{index + 1}</span>
                                <img
                                    src={episode.poster}
                                    alt={episode.title}
                                    className="w-32 h-20 object-cover rounded"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate text-lg">{episode.title}</p>
                                    <div className="flex items-center gap-4 mt-1">
                                        {episode.myRating && (
                                            <span className="text-sm text-gray-400">🐻 {episode.myRating}★</span>
                                        )}
                                        {episode.theirRating && (
                                            <span className="text-sm text-gray-400">🦄 {episode.theirRating}★</span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (episode.videoUrl) {
                                            router.push(`/watch?url=${encodeURIComponent(episode.videoUrl)}&title=${encodeURIComponent(episode.title)}&movieId=${episode.id}`);
                                        }
                                    }}
                                    className="p-3 bg-red-600 rounded-full hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <span className="material-icons-round">play_arrow</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Series Rating Section */}
                <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-300">
                        <span className="material-icons-round">star</span>
                        Dizi Puanımız
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">Tüm bölümlere aynı puanı vermek için kullan</p>
                    <div className="flex flex-wrap gap-4">
                        {/* İbrahim's Rating */}
                        <div className="flex items-center gap-4 bg-gray-800/50 rounded-lg px-6 py-4 border border-gray-700/50">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                <span className="text-xl">🐻</span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 mb-1">İbrahim</p>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => currentUser === "ben" && updateAllEpisodesRating(star === seriesRating.myRating ? 0 : star)}
                                            disabled={currentUser !== "ben"}
                                            className={`${currentUser === "ben" ? "hover:scale-110 cursor-pointer" : "cursor-default"} transition-transform`}
                                        >
                                            <span className={`material-icons text-2xl ${star <= seriesRating.myRating ? "text-yellow-400" : "text-gray-600"}`}>
                                                {star <= seriesRating.myRating ? "star" : "star_border"}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Selinay's Rating */}
                        <div className="flex items-center gap-4 bg-gray-800/50 rounded-lg px-6 py-4 border border-gray-700/50">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <span className="text-xl">🦄</span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 mb-1">Selinay</p>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => currentUser === "sen" && updateAllEpisodesRating(star === seriesRating.theirRating ? 0 : star)}
                                            disabled={currentUser !== "sen"}
                                            className={`${currentUser === "sen" ? "hover:scale-110 cursor-pointer" : "cursor-default"} transition-transform`}
                                        >
                                            <span className={`material-icons text-2xl ${star <= seriesRating.theirRating ? "text-yellow-400" : "text-gray-600"}`}>
                                                {star <= seriesRating.theirRating ? "star" : "star_border"}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
