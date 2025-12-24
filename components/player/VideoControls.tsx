"use client";

import { useState, useEffect, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Play, Pause, Maximize2, Minimize2, Volume2, VolumeX,
    SkipBack, SkipForward
} from "lucide-react";
import { ReactionButton, QuickTextButton, QUICK_TEXTS } from "./ReactionSystem";

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

const VideoControls = memo(function VideoControls({
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

    // Format time (seconds -> mm:ss)
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Handle mouse/touch move to show/hide controls
    useEffect(() => {
        const handleInteraction = () => {
            setIsVisible(true);
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
            if (!isPlaying) return;
            controlsTimeoutRef.current = setTimeout(() => {
                if (!isSeeking) setIsVisible(false);
            }, 3000);
        };

        window.addEventListener("mousemove", handleInteraction);
        window.addEventListener("touchstart", handleInteraction);
        return () => {
            window.removeEventListener("mousemove", handleInteraction);
            window.removeEventListener("touchstart", handleInteraction);
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        };
    }, [isPlaying, isSeeking]);

    // Update seek value when currentTime changes
    useEffect(() => {
        if (!isSeeking) {
            setSeekValue(currentTime);
        }
    }, [currentTime, isSeeking]);

    const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        setSeekValue(value);
        onSeek(value);
    };

    const handleSeekStart = () => setIsSeeking(true);
    const handleSeekEnd = () => {
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
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 z-50 flex flex-col justify-between bg-gradient-to-b from-black/50 via-transparent to-black/70 pointer-events-none"
                >
                    {/* Top Bar - Only on desktop */}
                    <div className="hidden md:flex p-4 justify-between items-start pointer-events-auto">
                        <h2 className="text-white text-base font-medium drop-shadow-md truncate max-w-[60%]">{title}</h2>
                    </div>

                    {/* Center - Empty spacer */}
                    <div className="flex-1" />

                    {/* Bottom Controls */}
                    <div className="p-3 md:p-4 space-y-3 pointer-events-auto">
                        {/* Progress Bar - Larger touch area on mobile */}
                        <div className="group relative flex items-center h-8 md:h-6 w-full cursor-pointer">
                            {/* Visual Track */}
                            <div className="relative h-1 md:h-1.5 w-full bg-white/30 rounded-full group-hover:h-2 md:group-hover:h-2.5 transition-all">
                                <div
                                    className="absolute top-0 left-0 h-full bg-red-500 rounded-full"
                                    style={{ width: `${progressPercent}%` }}
                                />
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 h-4 w-4 md:h-3 md:w-3 bg-red-500 rounded-full shadow-lg transition-transform"
                                    style={{ left: `calc(${progressPercent}% - 8px)` }}
                                />
                            </div>
                            {/* Invisible input for seeking */}
                            <input
                                type="range"
                                min={0}
                                max={duration || 100}
                                value={seekValue}
                                onChange={handleSeekChange}
                                onMouseDown={handleSeekStart}
                                onMouseUp={handleSeekEnd}
                                onTouchStart={handleSeekStart}
                                onTouchEnd={handleSeekEnd}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>

                        {/* Control Buttons */}
                        <div className="flex items-center justify-between gap-2">
                            {/* Left Controls */}
                            <div className="flex items-center gap-2 md:gap-4">
                                {/* Play/Pause */}
                                <button
                                    onClick={onTogglePlay}
                                    className="p-2 md:p-1 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
                                >
                                    {isPlaying
                                        ? <Pause className="w-6 h-6 md:w-6 md:h-6 text-white fill-white" />
                                        : <Play className="w-6 h-6 md:w-6 md:h-6 text-white fill-white" />
                                    }
                                </button>

                                {/* Skip Buttons - Always visible */}
                                <button
                                    onClick={onSkipBack}
                                    className="p-2 md:p-1 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
                                >
                                    <SkipBack className="w-5 h-5 text-white" />
                                </button>
                                <button
                                    onClick={onSkipForward}
                                    className="p-2 md:p-1 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
                                >
                                    <SkipForward className="w-5 h-5 text-white" />
                                </button>

                                {/* Volume - Only on desktop */}
                                <div className="hidden md:flex items-center gap-2 group/volume">
                                    <button onClick={onToggleMute} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                                        {isMuted || volume === 0
                                            ? <VolumeX className="w-5 h-5 text-white" />
                                            : <Volume2 className="w-5 h-5 text-white" />
                                        }
                                    </button>
                                    <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-200">
                                        <input
                                            type="range"
                                            min={0}
                                            max={100}
                                            value={isMuted ? 0 : volume}
                                            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                                            className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                                        />
                                    </div>
                                </div>

                                {/* Time Display */}
                                <span className="text-white/80 text-xs md:text-sm font-medium tabular-nums">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </span>
                            </div>

                            {/* Right Controls */}
                            <div className="flex items-center gap-2 md:gap-3">
                                {/* Reactions - Only on desktop */}
                                <div className="hidden md:flex items-center gap-1">
                                    <ReactionButton roomId={roomId} type="heart" />
                                    <ReactionButton roomId={roomId} type="smile" />
                                    <ReactionButton roomId={roomId} type="like" />
                                    <ReactionButton roomId={roomId} type="party" />
                                </div>

                                {/* Quick Text Reactions */}
                                <div className="hidden md:flex items-center gap-1">
                                    {QUICK_TEXTS.map((item) => (
                                        <QuickTextButton
                                            key={item.text}
                                            roomId={roomId}
                                            text={item.text}
                                            bg={item.bg}
                                        />
                                    ))}
                                </div>

                                {/* Fullscreen - Always visible, larger on mobile */}
                                <button
                                    onClick={onToggleFullscreen}
                                    className="p-2 md:p-2 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors bg-white/5"
                                >
                                    {isFullscreen
                                        ? <Minimize2 className="w-6 h-6 md:w-5 md:h-5 text-white" />
                                        : <Maximize2 className="w-6 h-6 md:w-5 md:h-5 text-white" />
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
});

export default VideoControls;

