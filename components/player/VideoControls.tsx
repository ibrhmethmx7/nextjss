"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Play, Pause, Maximize2, Minimize2, Volume2, VolumeX,
    SkipBack, SkipForward, Settings
} from "lucide-react";
import { ReactionButton } from "./ReactionSystem";

interface VideoControlsProps {
    roomId: string;
    isPlaying: boolean;
    isMuted: boolean;
    isFullscreen: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    title: string;
    onTogglePlay: () => void;
    onToggleMute: () => void;
    onToggleFullscreen: () => void;
    onSeek: (time: number) => void;
    onVolumeChange: (volume: number) => void;
    onSkipForward: () => void;
    onSkipBack: () => void;
}

export default function VideoControls({
    roomId,
    isPlaying,
    isMuted,
    isFullscreen,
    currentTime,
    duration,
    volume,
    title,
    onTogglePlay,
    onToggleMute,
    onToggleFullscreen,
    onSeek,
    onVolumeChange,
    onSkipForward,
    onSkipBack
}: VideoControlsProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [isSeeking, setIsSeeking] = useState(false);
    const [seekValue, setSeekValue] = useState(0);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Format time (seconds -> mm:ss)
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Handle mouse move to show/hide controls
    useEffect(() => {
        const handleMouseMove = () => {
            setIsVisible(true);
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
            if (!isPlaying) return; // Keep visible if paused
            controlsTimeoutRef.current = setTimeout(() => {
                if (!isSeeking) setIsVisible(false);
            }, 3000);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("touchstart", handleMouseMove);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("touchstart", handleMouseMove);
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        };
    }, [isPlaying, isSeeking]);

    // Update seek value when currentTime changes (if not seeking)
    useEffect(() => {
        if (!isSeeking) {
            setSeekValue(currentTime);
        }
    }, [currentTime, isSeeking]);

    const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSeekValue(parseFloat(e.target.value));
        onSeek(parseFloat(e.target.value));
    };

    const handleSeekMouseDown = () => {
        setIsSeeking(true);
    };

    const handleSeekMouseUp = () => {
        setIsSeeking(false);
        onSeek(seekValue);
    };

    const progressPercent = duration ? (seekValue / duration) * 100 : 0;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 flex flex-col justify-between bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none"
                >
                    {/* Top Bar */}
                    <div className="p-4 flex justify-between items-start pointer-events-auto">
                        <h2 className="text-white text-lg font-medium drop-shadow-md">{title}</h2>
                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <Settings className="w-6 h-6 text-white" />
                        </button>
                    </div>

                    {/* Center Play/Pause Animation (Optional - usually handled by click overlay) */}
                    <div className="flex-1 flex items-center justify-center pointer-events-none">
                        {/* Could add big play/pause icon here on toggle */}
                    </div>

                    {/* Bottom Controls */}
                    <div className="p-4 space-y-2 pointer-events-auto pb-8 md:pb-4">
                        {/* Progress Bar */}
                        <div className="group relative flex items-center h-6 w-full cursor-pointer">
                            {/* Visual Track */}
                            <div className="relative h-1.5 w-full bg-white/20 rounded-full group-hover:h-2.5 transition-all duration-200">
                                <div
                                    className="absolute top-0 left-0 h-full bg-red-600 rounded-full"
                                    style={{ width: `${progressPercent}%` }}
                                />
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 h-3 w-3 bg-red-600 rounded-full scale-0 group-hover:scale-100 transition-transform shadow-lg"
                                    style={{ left: `${progressPercent}%` }}
                                />
                            </div>
                            {/* Input covering the larger hit area */}
                            <input
                                type="range"
                                min={0}
                                max={duration || 100}
                                value={seekValue}
                                onChange={handleSeekChange}
                                onMouseDown={handleSeekMouseDown}
                                onMouseUp={handleSeekMouseUp}
                                onTouchStart={handleSeekMouseDown}
                                onTouchEnd={handleSeekMouseUp}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button onClick={onTogglePlay} className="text-white hover:text-red-500 transition-colors">
                                    {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white" />}
                                </button>

                                <button onClick={onSkipBack} className="text-white hover:text-white/80 transition-colors">
                                    <SkipBack className="w-5 h-5" />
                                </button>
                                <button onClick={onSkipForward} className="text-white hover:text-white/80 transition-colors">
                                    <SkipForward className="w-5 h-5" />
                                </button>

                                <div className="flex items-center gap-2 group/volume">
                                    <button onClick={onToggleMute} className="text-white hover:text-white/80 transition-colors">
                                        {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                    </button>
                                    <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300">
                                        <input
                                            type="range"
                                            min={0}
                                            max={100}
                                            value={isMuted ? 0 : volume}
                                            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                                            className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                                        />
                                    </div>
                                </div>

                                <span className="text-white/80 text-xs font-medium">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Reactions */}
                                <div className="flex items-center gap-1 mr-2">
                                    <ReactionButton roomId={roomId} type="heart" />
                                    <ReactionButton roomId={roomId} type="smile" />
                                    <ReactionButton roomId={roomId} type="like" />
                                    <ReactionButton roomId={roomId} type="party" />
                                </div>

                                <button onClick={onToggleFullscreen} className="text-white hover:text-white/80 transition-colors">
                                    {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
