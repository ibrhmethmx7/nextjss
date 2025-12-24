"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Smile, ThumbsUp, PartyPopper } from "lucide-react";
import { database } from "@/lib/firebase";
import { ref, push, onChildAdded, serverTimestamp } from "firebase/database";

// Types
type ReactionType = "heart" | "smile" | "like" | "party";
interface Reaction {
    id: string;
    type: ReactionType;
    x: number; // Random horizontal position
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

// --- Components ---

export function ReactionOverlay({ roomId }: { roomId: string }) {
    const [reactions, setReactions] = useState<Reaction[]>([]);

    useEffect(() => {
        if (!roomId) return;

        const reactionsRef = ref(database, `rooms/${roomId}/reactions`);
        // Listen for new reactions
        const unsubscribe = onChildAdded(reactionsRef, (snapshot) => {
            const data = snapshot.val();
            if (!data || Date.now() - data.timestamp > 5000) return; // Ignore old reactions

            const newReaction: Reaction = {
                id: snapshot.key || Math.random().toString(),
                type: data.type,
                x: Math.random() * 80 + 10 // Random position 10% - 90%
            };

            setReactions((prev) => [...prev, newReaction]);

            // Remove from DOM after animation
            setTimeout(() => {
                setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
            }, 2000);
        });

        return () => unsubscribe();
    }, [roomId]);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
            <AnimatePresence>
                {reactions.map((reaction) => {
                    const Icon = ICONS[reaction.type];
                    return (
                        <motion.div
                            key={reaction.id}
                            initial={{ opacity: 0, y: 100, scale: 0.5 }}
                            animate={{ opacity: 1, y: -200, scale: 1.5, x: (Math.random() - 0.5) * 50 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            className={`absolute bottom-20 ${COLORS[reaction.type]}`}
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

export function ReactionButton({ roomId, type }: { roomId: string; type: ReactionType }) {
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
