"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
    watchProgress?: number;
    watchProgressPercent?: number;
    lastWatched?: number;
};

// Get highest quality YouTube thumbnail
function getHQThumbnail(url: string): string {
    if (!url) return "";
    // Convert YouTube thumbnail to max resolution
    if (url.includes("ytimg.com") || url.includes("youtube.com")) {
        // Extract video ID and use maxresdefault
        const match = url.match(/\/vi\/([^/]+)\//);
        if (match) {
            return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
        }
    }
    return url;
}

export default function DashboardPage() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [activeTab, setActiveTab] = useState<"watchlist" | "completed">("watchlist");
    const [currentUser, setCurrentUser] = useState<string>("");
    const [userName, setUserName] = useState<string>("");
    const [searchOpen, setSearchOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== "undefined") {
            const user = localStorage.getItem("cinema_user");
            const name = localStorage.getItem("cinema_user_name");
            if (!user) {
                router.push("/");
                return;
            }
            setCurrentUser(user);
            setUserName(name || "");
        }

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
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("cinema_user");
        localStorage.removeItem("cinema_user_name");
        router.push("/");
    };

    const filteredMovies = movies.filter((m) => m.status === activeTab);
    const watchingMovies = movies.filter((m) => m.status === "watching");
    const watchlistMovies = movies.filter((m) => m.status === "watchlist");
    const completedMovies = movies.filter((m) => m.status === "completed");
    // Continue watching: movies with progress OR status=watching (so always shows something)
    const continueWatchingMovies = movies
        .filter((m) => m.watchProgress || m.status === "watching")
        .sort((a, b) => (b.lastWatched || b.addedAt || 0) - (a.lastWatched || a.addedAt || 0));

    const tabs = [
        { id: "watchlist", label: "İzleme Listemiz", icon: "bookmark", movies: watchlistMovies },
        { id: "completed", label: "Bitirdiklerimiz", icon: "check_circle", movies: completedMovies },
    ];

    return (
        <div className="min-h-screen bg-[#141414]">
            {/* Netflix-style Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent">
                <div className="px-4 md:px-12 py-4 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-6">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <span className="material-icons-round text-red-600 text-3xl">movie</span>
                            <span className="text-red-600 font-bold text-xl hidden md:block">SELOFLIX</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-6">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`text-sm transition-colors ${activeTab === tab.id
                                        ? "text-white font-semibold"
                                        : "text-gray-400 hover:text-gray-200"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-4">
                        {/* Search Button */}
                        <button
                            onClick={() => setSearchOpen(!searchOpen)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <span className="material-icons-outlined text-white">search</span>
                        </button>

                        {/* Add Movie */}
                        <Link
                            href="/add-movie"
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <span className="material-icons-outlined text-white">add</span>
                        </Link>

                        {/* Profile */}
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded flex items-center justify-center ${currentUser === "ben" ? "bg-blue-600" : "bg-pink-600"
                                }`}>
                                <span className="material-icons-round text-white text-lg">
                                    {currentUser === "ben" ? "person" : "favorite"}
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="hidden md:block text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                Çıkış
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Tabs */}
                <div className="md:hidden px-4 pb-2 flex gap-4 overflow-x-auto scrollbar-hide">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm transition-all ${activeTab === tab.id
                                ? "bg-white text-black font-medium"
                                : "bg-white/10 text-white"
                                }`}
                        >
                            <span className="material-icons-round text-lg">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-28 md:pt-20 pb-20 px-4 md:px-12">

                {/* Hero Banner - Featured Movie */}
                {continueWatchingMovies.length > 0 && (
                    <div className="relative h-[50vh] md:h-[60vh] mb-8 rounded-xl overflow-hidden">
                        <img
                            src={getHQThumbnail(continueWatchingMovies[0].poster) || `https://picsum.photos/seed/${continueWatchingMovies[0].id}/1920/1080`}
                            alt={continueWatchingMovies[0].title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/90 via-transparent to-transparent" />

                        <div className="absolute bottom-8 left-8 right-8 md:right-auto md:max-w-lg">
                            <h2 className="text-2xl md:text-4xl font-bold mb-3">{continueWatchingMovies[0].title}</h2>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        const movie = continueWatchingMovies[0];
                                        const startTime = movie.watchProgress ? Math.floor(Math.max(0, movie.watchProgress - 5)) : 0;
                                        router.push(`/watch?url=${encodeURIComponent(movie.videoUrl || "")}&title=${encodeURIComponent(movie.title)}&movieId=${movie.id}&startTime=${startTime}`);
                                    }}
                                    className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded font-semibold hover:bg-white/90 transition-colors"
                                >
                                    <span className="material-icons-round">play_arrow</span>
                                    Oynat
                                </button>
                                <Link
                                    href={`/movie/${continueWatchingMovies[0].id}`}
                                    className="flex items-center gap-2 bg-gray-500/60 text-white px-5 py-2.5 rounded font-semibold hover:bg-gray-500/40 transition-colors"
                                >
                                    <span className="material-icons-outlined">info</span>
                                    Detaylar
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Continue Watching Section - Movies with any progress */}
                {continueWatchingMovies.length > 0 && (
                    <section className="mb-8">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <span className="material-icons-round text-red-500">play_circle</span>
                            İzlemeye Devam Et
                        </h3>
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {continueWatchingMovies.map((movie) => (
                                <Link
                                    key={movie.id}
                                    href={`/watch?url=${encodeURIComponent(movie.videoUrl || "")}&title=${encodeURIComponent(movie.title)}&movieId=${movie.id}&startTime=${Math.floor(Math.max(0, (movie.watchProgress || 0) - 5))}`}
                                    className="flex-shrink-0 w-64 md:w-80 group"
                                >
                                    <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-800">
                                        <img
                                            src={movie.poster}
                                            alt={movie.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        {/* Play overlay */}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="material-icons-round text-5xl">play_circle</span>
                                        </div>
                                        {/* Progress info */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                                            <div className="flex items-center justify-between text-xs text-gray-300 mb-1">
                                                <span>{Math.floor((movie.watchProgress || 0) / 60)}:{String(Math.floor((movie.watchProgress || 0) % 60)).padStart(2, '0')}</span>
                                                <span>%{movie.watchProgressPercent || 0}</span>
                                            </div>
                                            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-red-600"
                                                    style={{ width: `${movie.watchProgressPercent || 0}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-sm font-medium truncate">{movie.title}</p>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Movie Rows */}
                <section className="mb-8">
                    <h3 className="text-xl md:text-2xl font-semibold mb-4 flex items-center gap-2">
                        <span className="material-icons-round text-red-500">{tabs.find(t => t.id === activeTab)?.icon}</span>
                        {tabs.find(t => t.id === activeTab)?.label}
                        <span className="text-gray-500 text-sm font-normal ml-2">({filteredMovies.length})</span>
                    </h3>

                    {filteredMovies.length === 0 ? (
                        <div className="text-center py-16">
                            <span className="material-icons-outlined text-6xl text-gray-700 mb-4 block">movie</span>
                            <p className="text-gray-500 mb-4">Bu listede henüz film yok</p>
                            <Link
                                href="/add-movie"
                                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded transition-colors"
                            >
                                <span className="material-icons-round">add</span>
                                Film Ekle
                            </Link>
                        </div>
                    ) : (
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {filteredMovies.map((movie) => (
                                <div
                                    key={movie.id}
                                    onClick={() => {
                                        if (movie.videoUrl) {
                                            const startTime = movie.watchProgress ? Math.floor(Math.max(0, movie.watchProgress - 5)) : 0;
                                            router.push(`/watch?url=${encodeURIComponent(movie.videoUrl)}&title=${encodeURIComponent(movie.title)}&movieId=${movie.id}&startTime=${startTime}`);
                                        } else {
                                            router.push(`/movie/${movie.id}`);
                                        }
                                    }}
                                    className="flex-shrink-0 w-64 md:w-80 group cursor-pointer"
                                >
                                    <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-800">
                                        <img
                                            src={movie.poster || `https://picsum.photos/seed/${movie.id}/640/360`}
                                            alt={movie.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            loading="lazy"
                                        />
                                        {/* Play overlay */}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="material-icons-round text-5xl text-white">play_circle</span>
                                        </div>
                                        {/* Ratings at bottom */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                                            <div className="flex gap-2">
                                                {movie.myRating && (
                                                    <span className="text-xs bg-blue-500/80 px-1.5 py-0.5 rounded">💙{movie.myRating}</span>
                                                )}
                                                {movie.theirRating && (
                                                    <span className="text-xs bg-pink-500/80 px-1.5 py-0.5 rounded">💖{movie.theirRating}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-sm font-medium truncate">{movie.title}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Other Sections (if not actively viewing that tab) */}
                {activeTab !== "watchlist" && watchlistMovies.length > 0 && (
                    <MovieRow title="İzleme Listemiz" icon="bookmark" movies={watchlistMovies} router={router} />
                )}
                {activeTab !== "completed" && completedMovies.length > 0 && (
                    <MovieRow title="Bitirdiklerimiz" icon="check_circle" movies={completedMovies} router={router} />
                )}
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 bg-black/95 border-t border-white/10 md:hidden">
                <div className="flex justify-around py-2">
                    <Link href="/dashboard" className="flex flex-col items-center gap-1 p-2">
                        <span className="material-icons-round text-white">home</span>
                        <span className="text-xs text-gray-400">Ana Sayfa</span>
                    </Link>
                    <Link href="/add-movie" className="flex flex-col items-center gap-1 p-2">
                        <span className="material-icons-outlined text-gray-400">add_circle_outline</span>
                        <span className="text-xs text-gray-400">Ekle</span>
                    </Link>
                    <button onClick={handleLogout} className="flex flex-col items-center gap-1 p-2">
                        <span className="material-icons-outlined text-gray-400">logout</span>
                        <span className="text-xs text-gray-400">Çıkış</span>
                    </button>
                </div>
            </nav>
        </div>
    );
}

// Movie Row Component - Horizontal 16:9 Cards
function MovieRow({ title, icon, movies, router }: { title: string; icon: string; movies: Movie[]; router: any }) {
    return (
        <section className="mb-8">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-300">
                <span className="material-icons-round text-lg">{icon}</span>
                {title}
            </h3>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
                {movies.slice(0, 10).map((movie) => (
                    <div
                        key={movie.id}
                        onClick={() => {
                            if (movie.videoUrl) {
                                const startTime = movie.watchProgress ? Math.floor(Math.max(0, movie.watchProgress - 5)) : 0;
                                router.push(`/watch?url=${encodeURIComponent(movie.videoUrl)}&title=${encodeURIComponent(movie.title)}&movieId=${movie.id}&startTime=${startTime}`);
                            } else {
                                router.push(`/movie/${movie.id}`);
                            }
                        }}
                        className="flex-shrink-0 w-64 md:w-80 group cursor-pointer"
                    >
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-800">
                            <img
                                src={movie.poster || `https://picsum.photos/seed/${movie.id}/640/360`}
                                alt={movie.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="material-icons-round text-5xl text-white">play_circle</span>
                            </div>
                        </div>
                        <p className="text-sm mt-2 truncate text-gray-300">{movie.title}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
