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
};

export default function DashboardPage() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [activeTab, setActiveTab] = useState<"watching" | "watchlist" | "completed">("watching");
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

    const tabs = [
        { id: "watching", label: "Devam Ettiklerimiz", icon: "play_circle", movies: watchingMovies },
        { id: "watchlist", label: "İzleyeceğiz", icon: "bookmark", movies: watchlistMovies },
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
                            <span className="text-red-600 font-bold text-xl hidden md:block">SİNEMAMIZ</span>
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
                {watchingMovies.length > 0 && activeTab === "watching" && (
                    <div className="relative h-[50vh] md:h-[70vh] mb-8 rounded-lg overflow-hidden">
                        <img
                            src={watchingMovies[0].poster || `https://picsum.photos/seed/${watchingMovies[0].id}/1920/1080`}
                            alt={watchingMovies[0].title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-transparent" />

                        <div className="absolute bottom-8 left-0 right-0 px-8">
                            <h2 className="text-3xl md:text-5xl font-bold mb-4">{watchingMovies[0].title}</h2>
                            <div className="flex gap-3">
                                <Link
                                    href={`/watch?url=${encodeURIComponent(watchingMovies[0].videoUrl || "")}&title=${encodeURIComponent(watchingMovies[0].title)}&movieId=${watchingMovies[0].id}`}
                                    className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded font-semibold hover:bg-white/90 transition-colors"
                                >
                                    <span className="material-icons-round">play_arrow</span>
                                    Oynat
                                </Link>
                                <Link
                                    href={`/movie/${watchingMovies[0].id}`}
                                    className="flex items-center gap-2 bg-gray-500/70 text-white px-6 py-2 rounded font-semibold hover:bg-gray-500/50 transition-colors"
                                >
                                    <span className="material-icons-outlined">info</span>
                                    Detaylar
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Continue Watching Section - Always visible if there are watching movies */}
                {watchingMovies.length > 0 && (
                    <section className="mb-8">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <span className="material-icons-round text-red-500">play_circle</span>
                            İzlemeye Devam Et
                        </h3>
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {watchingMovies.map((movie) => (
                                <Link
                                    key={movie.id}
                                    href={`/watch?url=${encodeURIComponent(movie.videoUrl || "")}&title=${encodeURIComponent(movie.title)}&movieId=${movie.id}`}
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
                                        {/* Progress bar simulation */}
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                                            <div className="h-full bg-red-600 w-1/3" />
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
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                            {filteredMovies.map((movie) => (
                                <Link
                                    key={movie.id}
                                    href={`/movie/${movie.id}`}
                                    className="group relative aspect-[2/3] rounded overflow-hidden bg-gray-800"
                                >
                                    <img
                                        src={movie.poster || `https://picsum.photos/seed/${movie.id}/300/450`}
                                        alt={movie.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                        <h4 className="text-sm font-semibold line-clamp-2">{movie.title}</h4>
                                        {movie.year && <p className="text-xs text-gray-400">{movie.year}</p>}

                                        {/* Quick Play Button */}
                                        {movie.videoUrl && (
                                            <div
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    router.push(`/watch?url=${encodeURIComponent(movie.videoUrl || "")}&title=${encodeURIComponent(movie.title)}&movieId=${movie.id}`);
                                                }}
                                                className="mt-2 flex items-center justify-center gap-1 bg-white text-black text-xs py-1.5 rounded font-medium hover:bg-white/90"
                                            >
                                                <span className="material-icons-round text-sm">play_arrow</span>
                                                İzle
                                            </div>
                                        )}
                                    </div>

                                    {/* Status Badge */}
                                    {movie.status === "watching" && (
                                        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                                            <span className="material-icons-round text-xs">play_arrow</span>
                                        </div>
                                    )}

                                    {/* Ratings */}
                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent opacity-100 group-hover:opacity-0 transition-opacity">
                                        <div className="flex gap-1">
                                            {movie.myRating && (
                                                <span className="text-xs bg-blue-500/80 px-1.5 py-0.5 rounded">💙{movie.myRating}</span>
                                            )}
                                            {movie.theirRating && (
                                                <span className="text-xs bg-pink-500/80 px-1.5 py-0.5 rounded">💖{movie.theirRating}</span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* Other Sections (if not actively viewing that tab) */}
                {activeTab !== "watching" && watchingMovies.length > 0 && (
                    <MovieRow title="Devam Ettiklerimiz" icon="play_circle" movies={watchingMovies} router={router} />
                )}
                {activeTab !== "watchlist" && watchlistMovies.length > 0 && (
                    <MovieRow title="İzleyeceğiz" icon="bookmark" movies={watchlistMovies} router={router} />
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

// Movie Row Component
function MovieRow({ title, icon, movies, router }: { title: string; icon: string; movies: Movie[]; router: any }) {
    return (
        <section className="mb-8">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-300">
                <span className="material-icons-round text-lg">{icon}</span>
                {title}
            </h3>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-4">
                {movies.slice(0, 10).map((movie) => (
                    <Link
                        key={movie.id}
                        href={`/movie/${movie.id}`}
                        className="flex-shrink-0 w-32 md:w-40 group"
                    >
                        <div className="aspect-[2/3] rounded overflow-hidden bg-gray-800 relative">
                            <img
                                src={movie.poster || `https://picsum.photos/seed/${movie.id}/300/450`}
                                alt={movie.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="material-icons-round text-4xl">play_circle</span>
                            </div>
                        </div>
                        <p className="text-sm mt-2 truncate text-gray-300">{movie.title}</p>
                    </Link>
                ))}
            </div>
        </section>
    );
}
