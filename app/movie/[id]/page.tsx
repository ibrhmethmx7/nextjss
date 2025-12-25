"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function MovieDetailPage() {
    const params = useParams();
    const router = useRouter();
    const movieId = params.id as string;
    const [movie, setMovie] = useState<Movie | null>(null);
    const [currentUser, setCurrentUser] = useState("");
    const [editRating, setEditRating] = useState(0);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        const user = localStorage.getItem("cinema_user");
        if (!user) {
            router.push("/");
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
    }, [movieId, router]);

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
        await remove(ref(database, `movies/${movieId}`));
        router.push("/dashboard");
    };

    if (!movie) {
        return (
            <div className="min-h-screen bg-[#141414] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const statusOptions = [
        { id: "watchlist", label: "İzleme Listesi", icon: "bookmark" },
        { id: "watching", label: "İzliyoruz", icon: "play_circle" },
        { id: "completed", label: "Bitirdik", icon: "check_circle" },
    ];

    return (
        <div className="min-h-screen bg-[#141414] text-white">
            {/* Fixed Header - Same as Dashboard */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 to-transparent">
                <div className="px-4 md:px-12 py-4 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <img src="/img/logo.png" alt="SELOFLIX" className="h-10 object-contain" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link href="/add-movie" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <span className="material-icons-outlined text-white">add</span>
                        </Link>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <span className="material-icons-outlined text-gray-400 hover:text-red-500">delete</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <div className="relative h-[50vh] md:h-[60vh] pt-16">
                <img
                    src={getHQThumbnail(movie.poster)}
                    alt={movie.title}
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/80 via-transparent to-transparent" />

                {/* Movie Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
                    <h1 className="text-3xl md:text-5xl font-bold mb-2">{movie.title}</h1>
                    {movie.year && <p className="text-gray-400 text-lg mb-4">{movie.year}</p>}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                        {movie.videoUrl ? (
                            <Link
                                href={`/watch?url=${encodeURIComponent(movie.videoUrl)}&title=${encodeURIComponent(movie.title)}&movieId=${movie.id}`}
                                className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded font-semibold hover:bg-white/90 transition-colors"
                            >
                                <span className="material-icons-round">play_arrow</span>
                                Oynat
                            </Link>
                        ) : (
                            <Link
                                href={`/movies?title=${encodeURIComponent(movie.title)}`}
                                className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded font-semibold hover:bg-white/90 transition-colors"
                            >
                                <span className="material-icons-round">play_arrow</span>
                                Video Seç
                            </Link>
                        )}
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
                {/* Status Tabs */}
                <div className="flex flex-wrap gap-2">
                    {statusOptions.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => updateStatus(s.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${movie.status === s.id
                                ? "bg-white text-black"
                                : "bg-white/10 text-white hover:bg-white/20"
                                }`}
                        >
                            <span className="material-icons-round text-lg">{s.icon}</span>
                            {s.label}
                        </button>
                    ))}
                </div>

                {/* Ratings Section */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-300">
                        <span className="material-icons-round">star</span>
                        Puanlarımız
                    </h3>
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
                                            onClick={() => currentUser === "ben" && updateRating(star === editRating ? 0 : star)}
                                            disabled={currentUser !== "ben"}
                                            className={`${currentUser === "ben" ? "hover:scale-110 cursor-pointer" : "cursor-default"} transition-transform`}
                                        >
                                            <span className={`material-icons text-2xl ${star <= (movie.myRating || 0) ? "text-yellow-400" : "text-gray-600"}`}>
                                                {star <= (movie.myRating || 0) ? "star" : "star_border"}
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
                                            onClick={() => currentUser === "sen" && updateRating(star === editRating ? 0 : star)}
                                            disabled={currentUser !== "sen"}
                                            className={`${currentUser === "sen" ? "hover:scale-110 cursor-pointer" : "cursor-default"} transition-transform`}
                                        >
                                            <span className={`material-icons text-2xl ${star <= (movie.theirRating || 0) ? "text-yellow-400" : "text-gray-600"}`}>
                                                {star <= (movie.theirRating || 0) ? "star" : "star_border"}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1a1a] rounded-lg p-6 max-w-sm w-full">
                        <h3 className="text-xl font-bold mb-2">Filmi Sil</h3>
                        <p className="text-gray-400 mb-6">"{movie.title}" filmini silmek istediğine emin misin?</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-3 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={deleteMovie}
                                className="flex-1 py-3 rounded bg-red-600 hover:bg-red-700 transition-colors"
                            >
                                Sil
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
