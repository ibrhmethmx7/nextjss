"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { database } from "@/lib/firebase";
import { ref, set } from "firebase/database";
import { Heart, Sparkles, MessageCircleHeart } from "lucide-react";

export default function SurprisePage() {
    const searchParams = useSearchParams();
    const [roomId, setRoomId] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const room = searchParams.get("room");
        if (room) setRoomId(room);
    }, [searchParams]);

    const triggerSurprise = async () => {
        if (!roomId) return;
        setLoading(true);
        try {
            await set(ref(database, `rooms/${roomId}/surprise`), {
                timestamp: Date.now(),
                message: message || "Seni Seviyorum ❤️" // Default message if empty
            });
        } catch (error) {
            console.error(error);
            alert("Hata oluştu!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
                    Sürpriz Kontrol Paneli
                </h1>
                <p className="text-gray-400">Kız arkadaşına çiçekler ve güzel sözler gönder! 🌸</p>
            </div>

            <div className="w-full max-w-md space-y-6 bg-white/5 p-8 rounded-2xl border border-white/10 shadow-2xl shadow-pink-900/20">
                <div className="space-y-2">
                    <label className="text-sm text-gray-400">Oda ID</label>
                    <Input
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        placeholder="Oda ID'sini gir..."
                        className="bg-black/50 border-white/20 h-12 text-lg focus:ring-pink-500"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm text-gray-400">Mesajın (İsteğe Bağlı)</label>
                    <div className="relative">
                        <Input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Örn: Seni çok seviyorum..."
                            className="bg-black/50 border-white/20 h-12 text-lg pl-10 focus:ring-pink-500"
                        />
                        <MessageCircleHeart className="absolute left-3 top-3 h-6 w-6 text-pink-500" />
                    </div>
                </div>

                <Button
                    onClick={triggerSurprise}
                    disabled={!roomId || loading}
                    className="w-full h-16 text-xl font-bold bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg shadow-pink-600/30"
                >
                    {loading ? (
                        <Sparkles className="animate-spin h-6 w-6" />
                    ) : (
                        <>
                            <Heart className="mr-2 h-6 w-6 fill-white" />
                            Sürprizi Gönder
                        </>
                    )}
                </Button>

                <p className="text-xs text-center text-gray-500 pt-2">
                    Butona bastığında ekranda konfetiler patlayacak ve yazdığın mesaj belirecek.
                </p>
            </div>
        </div>
    );
}
