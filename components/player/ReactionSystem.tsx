"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Smile, ThumbsUp, PartyPopper } from "lucide-react";
import { database } from "@/lib/firebase";
import { ref, push, onChildAdded, serverTimestamp } from "firebase/database";

// Types
type ReactionType = "heart" | "smile" | "like" | "party" | "text";
interface Reaction {
    id: string;
    type: ReactionType;
    text?: string;
    x: number;
}

// Icons Map
const ICONS = {
    heart: Heart,
    smile: Smile,
    like: ThumbsUp,
    party: PartyPopper
};

const COLORS = {
    heart: "text-red-500 fill-red-500",
    smile: "text-yellow-400 fill-yellow-400",
    like: "text-blue-500 fill-blue-500",
    party: "text-purple-500 fill-purple-500"
};

// Quick text reactions
const QUICK_TEXTS: { text: string; icon: string; bg: string }[] = [
    { text: "uiiyyyy", icon: "🐺", bg: "bg-pink-500" },
];

// Music clips - local audio files
// Music clips - local audio files
const MUSIC_CLIPS = [
    {
        id: "yansima",
        label: "Hastayım",
        icon: "🤒",
        audioSrc: "/sounds/yansıma.mp3",
        bg: "bg-gradient-to-r from-purple-500 to-pink-500"
    },
    {
        id: "karakas",
        label: "Kara Kaş",
        icon: "🤨",
        audioSrc: "/sounds/karakas.mp3",
        bg: "bg-gradient-to-r from-amber-500 to-red-500"
    },
    {
        id: "vahvah",
        label: "Vah Vah",
        icon: "😱",
        audioSrc: "/sounds/vahvah.mp3",
        bg: "bg-gradient-to-r from-orange-500 to-red-500"
    },
    {
        id: "hayde",
        label: "Hayde",
        icon: "🤷‍♂️",
        audioSrc: "/sounds/hayde.mp3",
        bg: "bg-gradient-to-r from-green-500 to-emerald-600"
    }
];

// --- Components ---

export function ReactionOverlay({ roomId }: { roomId: string }) {
    const [reactions, setReactions] = useState<Reaction[]>([]);

    useEffect(() => {
        if (!roomId) return;

        const reactionsRef = ref(database, `rooms/${roomId}/reactions`);
        const unsubscribe = onChildAdded(reactionsRef, (snapshot) => {
            const data = snapshot.val();
            if (!data || Date.now() - data.timestamp > 5000) return;

            const newReaction: Reaction = {
                id: snapshot.key || Math.random().toString(),
                type: data.type,
                text: data.text,
                x: Math.random() * 70 + 15
            };

            setReactions((prev) => [...prev, newReaction]);

            setTimeout(() => {
                setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
            }, 2500);
        });

        return () => unsubscribe();
    }, [roomId]);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
            <AnimatePresence>
                {reactions.map((reaction) => {
                    // Text reaction
                    if (reaction.type === "text" && reaction.text) {
                        return (
                            <motion.div
                                key={reaction.id}
                                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                                animate={{ opacity: 1, y: -150, scale: 1.2 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 2.5, ease: "easeOut" }}
                                className="absolute bottom-20"
                                style={{ left: `${reaction.x}%` }}
                            >
                                <span className="bg-white/90 text-black font-bold px-3 py-1.5 rounded-full text-sm md:text-base shadow-lg whitespace-nowrap">
                                    {reaction.text}
                                </span>
                            </motion.div>
                        );
                    }

                    // Emoji reaction
                    const Icon = ICONS[reaction.type as keyof typeof ICONS];
                    if (!Icon) return null;

                    return (
                        <motion.div
                            key={reaction.id}
                            initial={{ opacity: 0, y: 100, scale: 0.5 }}
                            animate={{ opacity: 1, y: -200, scale: 1.5 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            className={`absolute bottom-20 ${COLORS[reaction.type as keyof typeof COLORS]}`}
                            style={{ left: `${reaction.x}%` }}
                        >
                            <Icon className="w-8 h-8 md:w-12 md:h-12 drop-shadow-lg" />
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}

export function ReactionButton({ roomId, type }: { roomId: string; type: keyof typeof ICONS }) {
    const sendReaction = useCallback(() => {
        if (!roomId) return;
        push(ref(database, `rooms/${roomId}/reactions`), {
            type,
            timestamp: serverTimestamp()
        });
    }, [roomId, type]);

    const Icon = ICONS[type];

    return (
        <button
            onClick={sendReaction}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors active:scale-90"
        >
            <Icon className={`w-5 h-5 ${COLORS[type]}`} />
        </button>
    );
}

export function QuickTextButton({ roomId, text, icon, bg }: { roomId: string; text: string; icon: string; bg: string }) {
    const sendText = useCallback(() => {
        if (!roomId) return;
        push(ref(database, `rooms/${roomId}/reactions`), {
            type: "text",
            text,
            timestamp: serverTimestamp()
        });
    }, [roomId, text]);

    return (
        <button
            onClick={sendText}
            className={`px-1.5 py-0.5 md:px-2 md:py-1 rounded-full ${bg} text-white text-[10px] md:text-xs font-semibold hover:opacity-80 transition-opacity active:scale-95`}
        >
            <span className="md:hidden lg:inline">{text}</span>
            <span className="hidden md:inline lg:hidden text-base">{icon}</span>
        </button>
    );
}

// Music Clip Button - plays local audio file
export function MusicClipButton({
    label,
    icon,
    audioSrc,
    bg
}: {
    label: string;
    icon: string;
    audioSrc: string;
    bg: string;
}) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const playClip = useCallback(() => {
        if (isPlaying) return;

        // Stop any existing audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        setIsPlaying(true);

        // Create and play audio
        const audio = new Audio(audioSrc);
        audioRef.current = audio;

        audio.play().catch(err => {
            console.error('Audio play failed:', err);
            setIsPlaying(false);
        });

        // When audio ends
        audio.onended = () => {
            setIsPlaying(false);
            audioRef.current = null;
        };
    }, [audioSrc, isPlaying]);

    return (
        <button
            onClick={playClip}
            disabled={isPlaying}
            className={`px-1.5 py-0.5 md:px-2 md:py-1 rounded-full ${bg} text-white text-[10px] md:text-xs font-semibold hover:opacity-80 transition-all active:scale-95 ${isPlaying ? 'animate-pulse opacity-70' : ''}`}
        >
            {isPlaying ? '🎶' : (
                <>
                    <span className="md:hidden lg:inline">{label}</span>
                    <span className="hidden md:inline lg:hidden text-base">{icon}</span>
                </>
            )}
        </button>
    );
}

// Export constants for use in VideoControls
export { QUICK_TEXTS, MUSIC_CLIPS };
