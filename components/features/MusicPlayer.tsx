"use client";

import { useState, useRef, useEffect } from "react";
import { Music, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MusicPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Initialize audio
        audioRef.current = new Audio("/music/romantic.mp3"); // Need to add a file here later
        audioRef.current.loop = true;
        audioRef.current.volume = 0.5;

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch((e) => console.log("Audio play failed:", e));
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        if (!audioRef.current) return;
        audioRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-lg border border-pink-200">
            <Button
                variant="ghost"
                size="icon"
                className={cn("rounded-full h-10 w-10", isPlaying && "text-primary animate-pulse")}
                onClick={togglePlay}
            >
                {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-muted-foreground" onClick={toggleMute}>
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </Button>
        </div>
    );
}
