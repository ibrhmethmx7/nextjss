"use client";

import { useEffect, useState, Suspense, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Trash2, SkipForward, List, CheckCircle, Search, MessageCircle, Send, Maximize2, Minimize2 } from "lucide-react";
import Link from "next/link";
import { database, YOUTUBE_API_KEY } from "@/lib/firebase";
import AmbilightEffect from "@/components/player/AmbilightEffect";
import MobileSeekOverlay from "@/components/player/MobileSeekOverlay";
import { ReactionOverlay } from "@/components/player/ReactionSystem";
import VideoControls from "@/components/player/VideoControls";
import { ref, update, push, set, onValue, get } from "firebase/database";

type QueueItem = { id: string; title: string; url: string; thumbnail?: string; movieId?: string; };
type ChatMessage = { user: string; text: string; time: number; };

// YouTube Player Types
declare global {
    interface Window {
        onYouTubeIframeAPIReady: () => void;
        YT: any;
    }
}

async function searchYouTube(query: string): Promise<any[]> {
    try {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(query)}&type=video&key=${YOUTUBE_API_KEY}`);
        const data = await res.json();
        return data.items || [];
    } catch { return []; }
}

function getVideoId(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
    return match ? match[1] : null;
}

function getThumbnail(url: string): string {
    const videoId = getVideoId(url);
    if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    return "";
}

function WatchContent() {
    const searchParams = useSearchParams();
    const initialUrl = searchParams.get("url") || "";
    const initialTitle = searchParams.get("title") || "";
    const movieId = searchParams.get("movieId") || "";
    const startTime = parseInt(searchParams.get("startTime") || "0", 10);

    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activePanel, setActivePanel] = useState<"chat" | "queue">("chat");
    const [isFullscreen, setIsFullscreen] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    const [roomId, setRoomId] = useState("");
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [currentUser, setCurrentUser] = useState("");
    const [userId, setUserId] = useState("");
    const [isCreator, setIsCreator] = useState(false);
    const [sessionId] = useState(Math.random().toString(36).substring(2));
    const [showChatMessages, setShowChatMessages] = useState(false);

    // Auto-show chat on new message
    useEffect(() => {
        if (chatMessages.length > 0) {
            setShowChatMessages(true);
            const timer = setTimeout(() => setShowChatMessages(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [chatMessages]);

    // Player State
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(100);
    const [isMuted, setIsMuted] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const mobileChatContainerRef = useRef<HTMLDivElement>(null);
    const fullscreenChatRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);
    const isRemoteUpdate = useRef(false);

    // Auto-scroll fullscreen chat
    useEffect(() => {
        if (showChatMessages && fullscreenChatRef.current) {
            fullscreenChatRef.current.scrollTop = fullscreenChatRef.current.scrollHeight;
        }
    }, [chatMessages, showChatMessages]);

    // Initialize User and Room
    useEffect(() => {
        let uid = localStorage.getItem("cinema_user_id");
        if (!uid) {
            uid = Math.random().toString(36).substring(2) + Date.now().toString(36);
            localStorage.setItem("cinema_user_id", uid);
        }
        setUserId(uid);

        const user = localStorage.getItem("cinema_user");
        const username = user || "misafir";
        setCurrentUser(username);

        const room = searchParams.get("room") || Math.random().toString(36).substring(2, 8);
        setRoomId(room);

        if (!searchParams.get("room")) {
            window.history.replaceState({}, "", `${window.location.pathname}?room=${room}${initialUrl ? `&url=${encodeURIComponent(initialUrl)}` : ""}`);
        }

        const checkCreator = async () => {
            const roomRef = ref(database, `rooms/${room}`);
            const snapshot = await get(roomRef);
            if (!snapshot.exists()) {
                await set(roomRef, { creatorId: uid, creatorName: username, created: Date.now() });
                setIsCreator(true);
            } else {
                const data = snapshot.val();
                if (data.creatorId === uid) setIsCreator(true);
            }
        };
        checkCreator();

        if (initialUrl) {
            const queueRef = ref(database, `rooms/${room}/queue`);
            get(queueRef).then((snap) => {
                if (!snap.exists()) {
                    const decodedUrl = decodeURIComponent(initialUrl);
                    const decodedTitle = decodeURIComponent(initialTitle) || "Video";
                    const initialQueue: any[] = [{
                        id: "initial",
                        title: decodedTitle,
                        url: decodedUrl,
                        thumbnail: getThumbnail(decodedUrl),
                    }];
                    // Only add movieId if it exists
                    if (movieId) {
                        initialQueue[0].movieId = movieId;
                    }
                    set(queueRef, initialQueue);
                }
            });
        }
    }, [initialUrl, initialTitle, movieId, searchParams]);

    // Sync Data (Chat, Queue, CurrentIndex)
    useEffect(() => {
        if (!roomId) return;

        const chatRef = ref(database, `rooms/${roomId}/messages`);
        const unsubChat = onValue(chatRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const messages = Object.values(data) as ChatMessage[];
                console.log("TÜM MESAJLAR:", messages);
                setChatMessages(messages);
            }
        });

        const queueRef = ref(database, `rooms/${roomId}/queue`);
        const unsubQueue = onValue(queueRef, (snapshot) => {
            const data = snapshot.val();
            if (data) setQueue(data as QueueItem[]);
        });

        const indexRef = ref(database, `rooms/${roomId}/currentIndex`);
        const unsubIndex = onValue(indexRef, (snapshot) => {
            const data = snapshot.val();
            if (data !== null) setCurrentIndex(data);
        });

        return () => {
            unsubChat();
            unsubQueue();
            unsubIndex();
        };
    }, [roomId]);

    // Video Sync Logic
    useEffect(() => {
        if (!roomId) return;

        const playerStateRef = ref(database, `rooms/${roomId}/playerState`);

        const unsubPlayer = onValue(playerStateRef, (snapshot) => {
            const data = snapshot.val();
            if (!data || !playerRef.current) return;

            // Ignore my own updates
            if (data.sessionId === sessionId) return;

            const player = playerRef.current;
            // Check if player is ready (has methods)
            if (!player.getPlayerState || !player.seekTo) return;

            const playerStatus = player.getPlayerState();
            const currentTime = player.getCurrentTime();

            isRemoteUpdate.current = true;

            // Sync Play/Pause
            if (data.isPlaying && playerStatus !== 1 && playerStatus !== 3) {
                player.playVideo();
                setIsPlaying(true);
            } else if (!data.isPlaying && playerStatus === 1) {
                player.pauseVideo();
                setIsPlaying(false);
            }

            // Sync Time (if drift > 2 seconds)
            if (Math.abs(currentTime - data.currentTime) > 2) {
                player.seekTo(data.currentTime, true);
                setCurrentTime(data.currentTime);
            }

            // Reset flag after a short delay to allow events to fire
            setTimeout(() => { isRemoteUpdate.current = false; }, 500);
        });

        return () => unsubPlayer();
    }, [roomId, sessionId]);

    // Creator: Send updates (Periodic)
    useEffect(() => {
        if (!isCreator || !roomId) return;

        const interval = setInterval(() => {
            const player = playerRef.current;
            if (player && player.getPlayerState && !isRemoteUpdate.current) {
                const currentTime = player.getCurrentTime();
                const isPlaying = player.getPlayerState() === 1;

                update(ref(database, `rooms/${roomId}/playerState`), {
                    currentTime,
                    isPlaying,
                    timestamp: Date.now(),
                    sessionId // Tag with my session
                });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isCreator, roomId, sessionId]);

    // Local Player State Polling (for UI) + Save Progress every 5 seconds
    const lastSaveRef = useRef(0);
    useEffect(() => {
        const interval = setInterval(() => {
            if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
                try {
                    const time = playerRef.current.getCurrentTime();
                    const dur = playerRef.current.getDuration();
                    setCurrentTime(time);
                    setDuration(dur);
                    setIsPlaying(playerRef.current.getPlayerState() === 1);
                    setVolume(playerRef.current.getVolume());
                    setIsMuted(playerRef.current.isMuted());

                    // Save progress every 5 seconds for the movie
                    const now = Date.now();
                    if (movieId && time > 0 && dur > 0 && (now - lastSaveRef.current > 5000)) {
                        lastSaveRef.current = now;
                        const progress = (time / dur) * 100;
                        console.log(`Saving progress: ${time.toFixed(0)}s (${progress.toFixed(0)}%) for movie ${movieId}`);
                        update(ref(database, `movies/${movieId}`), {
                            watchProgress: Math.floor(time),
                            watchProgressPercent: Math.round(progress),
                            lastWatched: now
                        });
                    }
                } catch (e) {
                    // Player not ready yet
                }
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [movieId]);

    // Initialize YouTube Player
    const currentVideo = queue[currentIndex];

    useEffect(() => {
        if (!currentVideo) return;

        const videoId = getVideoId(currentVideo.url);
        if (!videoId) return;

        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        }

        const initPlayer = () => {
            if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
                playerRef.current.loadVideoById(videoId);
                return;
            }

            playerRef.current = new window.YT.Player('youtube-player', {
                height: '100%',
                width: '100%',
                videoId: videoId,
                playerVars: {
                    'playsinline': 1,
                    'autoplay': 1,
                    'controls': 0, // Hide native controls
                    'disablekb': 1, // Disable native keyboard controls
                    'modestbranding': 1,
                    'rel': 0,
                    'showinfo': 0,
                    'iv_load_policy': 3
                },
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
        };

        if (window.YT && window.YT.Player) {
            initPlayer();
        } else {
            window.onYouTubeIframeAPIReady = initPlayer;
        }

    }, [currentVideo]);

    const onPlayerReady = (event: any) => {
        const player = event.target;
        setDuration(player.getDuration());
        setVolume(player.getVolume());
        setIsMuted(player.isMuted());

        // Resume from URL startTime parameter (most reliable)
        if (startTime > 0) {
            setTimeout(() => {
                player.seekTo(startTime, true);
                player.playVideo();
            }, 1000);
        }
    };


    const onPlayerStateChange = (event: any) => {
        const player = event.target;
        const isPlaying = event.data === 1;
        setIsPlaying(isPlaying);

        // Safely get duration
        if (typeof player.getDuration === 'function') {
            setDuration(player.getDuration());
        }

        if (!isCreator || isRemoteUpdate.current) return;

        // Safely get current time
        const currentTime = typeof player.getCurrentTime === 'function' ? player.getCurrentTime() : 0;

        update(ref(database, `rooms/${roomId}/playerState`), {
            isPlaying,
            currentTime,
            timestamp: Date.now(),
            sessionId
        });
    };

    // Auto-scroll chat
    useEffect(() => {
        if (chatMessages.length > 0) {
            setTimeout(() => {
                if (chatContainerRef.current) {
                    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                }
                if (mobileChatContainerRef.current) {
                    mobileChatContainerRef.current.scrollTop = mobileChatContainerRef.current.scrollHeight;
                }
            }, 100);
        }
    }, [chatMessages, activePanel]);

    const copyRoomLink = () => {
        const url = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
        navigator.clipboard.writeText(url);
        alert("Oda linki kopyalandı! Arkadaşlarına gönder.");
    };

    const toggleFullscreen = async () => {
        if (!document.fullscreenElement && containerRef.current) {
            try { await containerRef.current.requestFullscreen(); }
            catch { setIsFullscreen(!isFullscreen); }
        } else if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            setIsFullscreen(!isFullscreen);
        }
    };

    // Listen for fullscreen change
    useEffect(() => {
        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);


    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        setSearchResults(await searchYouTube(searchQuery));
        setSearching(false);
    };

    const addToQueue = (item: any) => {
        const videoId = item.id.videoId;
        const newItem = {
            id: Date.now().toString(),
            title: item.snippet.title,
            url: `https://www.youtube.com/watch?v=${videoId}`,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url
        };
        const newQueue = [...queue, newItem];
        set(ref(database, `rooms/${roomId}/queue`), newQueue);
        setSearchResults([]);
        setSearchQuery("");
    };

    const addToQueueByUrl = (url: string) => {
        const newItem = {
            id: Date.now().toString(),
            title: "Video",
            url,
            thumbnail: getThumbnail(url)
        };
        const newQueue = [...queue, newItem];
        set(ref(database, `rooms/${roomId}/queue`), newQueue);
    };

    const removeFromQueue = (index: number) => {
        if (!isCreator) return;
        const newQueue = queue.filter((_, i) => i !== index);
        set(ref(database, `rooms/${roomId}/queue`), newQueue);
        if (currentIndex >= newQueue.length - 1) {
            set(ref(database, `rooms/${roomId}/currentIndex`), Math.max(0, newQueue.length - 2));
        }
    };

    const playNext = async () => {
        if (!isCreator) return;
        if (currentVideo?.movieId) {
            try { await update(ref(database, `movies/${currentVideo.movieId}`), { status: "completed" }); } catch { }
        }
        if (currentIndex < queue.length - 1) {
            set(ref(database, `rooms/${roomId}/currentIndex`), currentIndex + 1);
        }
    };

    const setIndex = (index: number) => {
        if (!isCreator) return;
        set(ref(database, `rooms/${roomId}/currentIndex`), index);
    };

    const markCompleted = async () => {
        try {
            if (currentVideo?.movieId) {
                await update(ref(database, `movies/${currentVideo.movieId}`), { status: "completed" });
            } else if (currentVideo) {
                const poster = currentVideo.thumbnail || getThumbnail(currentVideo.url) || `https://picsum.photos/seed/${Date.now()}/300/450`;
                await set(push(ref(database, "movies")), {
                    title: currentVideo.title,
                    poster: poster,
                    status: "completed",
                    videoUrl: currentVideo.url,
                    addedAt: Date.now(),
                    addedBy: currentUser,
                });
            }
            alert("Bitirdik listesine eklendi!");
        } catch (e) {
            console.error(e);
            alert("Hata!");
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !roomId) return;
        await set(push(ref(database, `rooms/${roomId}/messages`)), { user: currentUser === "ben" ? "Ben" : "Sen", text: newMessage, time: Date.now() });
        setNewMessage("");
    };

    // Control Handlers
    const handleTogglePlay = () => {
        if (!playerRef.current) return;
        if (isPlaying) {
            playerRef.current.pauseVideo();
        } else {
            playerRef.current.playVideo();
        }
    };

    const handleSeek = (time: number) => {
        if (!playerRef.current) return;
        playerRef.current.seekTo(time, true);
        setCurrentTime(time);
    };

    const handleMobileSeek = (seconds: number) => {
        if (!playerRef.current) return;
        const newTime = Math.max(0, Math.min(currentTime + seconds, duration));
        playerRef.current.seekTo(newTime, true);
        setCurrentTime(newTime);
    };

    const handleVolumeChange = (vol: number) => {
        if (!playerRef.current) return;
        playerRef.current.setVolume(vol);
        setVolume(vol);
        if (vol > 0 && isMuted) {
            playerRef.current.unMute();
            setIsMuted(false);
        }
    };

    const handleToggleMute = () => {
        if (!playerRef.current) return;
        if (isMuted) {
            playerRef.current.mute();
            setIsMuted(true);
        } else {
            playerRef.current.unMute();
            setIsMuted(false);
        }
    };

    const handleSkipForward = () => {
        if (!playerRef.current) return;
        const newTime = Math.min(currentTime + 10, duration);
        playerRef.current.seekTo(newTime, true);
        setCurrentTime(newTime);
    };

    const handleSkipBack = () => {
        if (!playerRef.current) return;
        const newTime = Math.max(currentTime - 10, 0);
        playerRef.current.seekTo(newTime, true);
        setCurrentTime(newTime);
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in an input or textarea
            if (["INPUT", "TEXTAREA"].includes((document.activeElement as HTMLElement).tagName)) return;

            switch (e.key.toLowerCase()) {
                case " ":
                case "k":
                    e.preventDefault();
                    handleTogglePlay();
                    break;
                case "arrowleft":
                case "j":
                    e.preventDefault();
                    handleSeek(Math.max(0, currentTime - 10));
                    break;
                case "arrowright":
                case "l":
                    e.preventDefault();
                    handleSeek(Math.min(duration, currentTime + 10));
                    break;
                case "arrowup":
                    e.preventDefault();
                    handleVolumeChange(Math.min(100, volume + 10));
                    break;
                case "arrowdown":
                    e.preventDefault();
                    handleVolumeChange(Math.max(0, volume - 10));
                    break;
                case "m":
                    e.preventDefault();
                    handleToggleMute();
                    break;
                case "f":
                    e.preventDefault();
                    toggleFullscreen();
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentTime, duration, volume, isPlaying, isMuted]);

    // Empty state
    if (queue.length === 0) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white p-4">
                <Link href="/dashboard"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" /> Geri</Button></Link>
                <div className="max-w-xl mx-auto mt-8 space-y-6">
                    <h1 className="text-2xl font-bold text-center">Video Ara</h1>
                    <div className="flex gap-2">
                        <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleSearch()} placeholder="YouTube'da ara..." className="bg-white/5 border-white/10 h-12" style={{ fontSize: '16px' }} />
                        <Button onClick={handleSearch} disabled={searching} className="bg-red-600 h-12"><Search className="h-5 w-5" /></Button>
                    </div>
                    {searchResults.map((item) => (
                        <div key={item.id.videoId} onClick={() => addToQueue(item)} className="flex gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 cursor-pointer">
                            <img src={item.snippet.thumbnails.default.url} className="w-28 h-20 object-cover rounded" />
                            <div><p className="font-medium line-clamp-2">{item.snippet.title}</p><p className="text-xs text-gray-500">{item.snippet.channelTitle}</p></div>
                        </div>
                    ))}
                    <div className="pt-4 border-t border-white/10">
                        <p className="text-sm text-gray-400 mb-2">veya embed URL yapıştır:</p>
                        <Input placeholder="Video URL..." className="bg-white/5 border-white/10 h-12" style={{ fontSize: '16px' }} onKeyPress={(e) => { if (e.key === "Enter") { addToQueueByUrl((e.target as HTMLInputElement).value); } }} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className={`${isFullscreen ? 'fixed inset-0 bg-black z-50' : 'h-screen bg-[#0a0a0a] overflow-hidden'} text-white flex flex-col md:flex-row transition-all duration-300`}>

            {/* Main Content */}
            <div className={`flex-1 flex flex-col min-w-0 ${isFullscreen ? 'h-full' : 'h-full'}`}>

                {/* Header - Hidden in Fullscreen */}
                {!isFullscreen && (
                    <div className="flex items-center justify-between p-2 border-b border-white/5 bg-black/80 shrink-0">
                        <div className="flex items-center gap-2">
                            <Link href="/dashboard"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button></Link>
                            <Button variant="outline" size="sm" onClick={copyRoomLink} className="text-xs border-white/10 bg-white/5 hover:bg-white/10">
                                <span className="mr-2">Oda: {roomId}</span>
                                🔗 Linki Kopyala
                            </Button>
                        </div>
                        <span className="text-sm truncate flex-1 text-center px-2">{currentVideo?.title}</span>
                        <div className="flex gap-1 md:hidden">
                            <Button variant="ghost" size="sm" onClick={() => setActivePanel("chat")} className={activePanel === "chat" ? "bg-white/10" : ""}><MessageCircle className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => setActivePanel("queue")} className={activePanel === "queue" ? "bg-white/10" : ""}><List className="h-4 w-4" /></Button>
                        </div>
                    </div>
                )}

                {/* Video Container */}
                <div className={`relative w-full shrink-0 ${isFullscreen ? 'flex-1 h-full' : ''}`} style={!isFullscreen ? { paddingTop: "56.25%" } : {}}>
                    {/* Ambilight Effect */}
                    <AmbilightEffect thumbnailUrl={currentVideo?.thumbnail || getThumbnail(currentVideo?.url || "")} />

                    {/* YouTube Player Div */}
                    <div id="youtube-player" className="absolute inset-0 w-full h-full pointer-events-none" />

                    {/* Mobile Seek Overlay */}
                    <MobileSeekOverlay onSeek={handleMobileSeek} />

                    {/* Reaction Overlay */}
                    <ReactionOverlay roomId={roomId} />

                    {/* Click blocker for YouTube iframe (to prevent clicking native controls if they appear) */}
                    <div className="absolute inset-0 z-0" onClick={handleTogglePlay}></div>

                    {/* Custom Video Controls */}
                    <VideoControls
                        roomId={roomId}
                        isPlaying={isPlaying}
                        isMuted={isMuted}
                        isFullscreen={isFullscreen}
                        currentTime={currentTime}
                        duration={duration}
                        volume={volume}
                        title={currentVideo?.title || ""}
                        onTogglePlay={handleTogglePlay}
                        onToggleMute={handleToggleMute}
                        onToggleFullscreen={toggleFullscreen}
                        onSeek={handleSeek}
                        onVolumeChange={handleVolumeChange}
                        onSkipForward={handleSkipForward}
                        onSkipBack={handleSkipBack}
                    />

                    {/* Fullscreen Chat Overlay */}
                    {isFullscreen && (
                        <div className="absolute left-0 right-0 bottom-20 px-4 z-[60] pointer-events-none">
                            {/* Chat Messages - Always visible in fullscreen */}
                            <div className="max-w-md ml-auto pointer-events-auto">
                                {/* Messages */}
                                <div
                                    ref={fullscreenChatRef}
                                    className="max-h-32 overflow-y-auto space-y-1 mb-2 scroll-smooth"
                                >
                                    {chatMessages.slice(-5).map((msg, i) => (
                                        <div
                                            key={i}
                                            className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1.5 text-sm"
                                        >
                                            <span className={`font-semibold ${msg.user === "Ben" ? "text-blue-400" : "text-pink-400"}`}>
                                                {msg.user}:
                                            </span>{" "}
                                            <span className="text-white/90">{msg.text}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Input */}
                                <div className="flex gap-2 bg-black/50 backdrop-blur-sm rounded-lg p-2">
                                    <Input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                                        placeholder="Mesaj yaz..."
                                        className="bg-transparent border-none h-9 text-sm text-white placeholder:text-white/50 focus-visible:ring-0"
                                        style={{ fontSize: '16px' }}
                                    />
                                    <Button
                                        size="sm"
                                        onClick={sendMessage}
                                        className="bg-red-600 hover:bg-red-700 h-9 px-3"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Normal Controls & Mobile Panel - Hidden in Fullscreen */}
                {!isFullscreen && (
                    <>
                        <div className="p-3 flex items-center justify-between gap-2 border-b border-white/5 bg-black/40 shrink-0">
                            <Button size="sm" variant="outline" onClick={markCompleted} className="border-green-500/50 text-green-400 text-xs hover:bg-green-500/10">
                                <CheckCircle className="h-4 w-4 mr-1" /> Bitirdik
                            </Button>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">{currentIndex + 1}/{queue.length}</span>
                                {isCreator && currentIndex < queue.length - 1 && <Button size="sm" onClick={playNext} className="bg-red-600 text-xs"><SkipForward className="h-4 w-4 mr-1" /> Sonraki</Button>}
                            </div>
                        </div>

                        {/* Mobile Panel */}
                        <div className="md:hidden flex-1 border-t border-white/5 bg-black/50 flex flex-col" style={{ minHeight: 250 }}>
                            <div className="flex border-b border-white/5 shrink-0">
                                <button onClick={() => setActivePanel("chat")} className={`flex-1 p-2 text-sm flex items-center justify-center gap-2 ${activePanel === "chat" ? "bg-white/10 text-white" : "text-gray-400"}`}><MessageCircle className="h-4 w-4" /> Sohbet</button>
                                <button onClick={() => setActivePanel("queue")} className={`flex-1 p-2 text-sm flex items-center justify-center gap-2 ${activePanel === "queue" ? "bg-white/10 text-white" : "text-gray-400"}`}><List className="h-4 w-4" /> Kuyruk</button>
                            </div>
                            {activePanel === "chat" ? (
                                <div className="flex-1 flex flex-col min-h-0">
                                    <div ref={mobileChatContainerRef} className="flex-1 overflow-y-auto p-2 space-y-2 scroll-smooth">
                                        {chatMessages.length === 0 && <p className="text-gray-500 text-sm text-center py-4">Henüz mesaj yok</p>}
                                        {chatMessages.map((msg, i) => <div key={i} className="bg-white/5 rounded p-2"><span className={`text-xs font-medium ${msg.user === "Ben" ? "text-blue-400" : "text-pink-400"}`}>{msg.user}</span><p className="text-sm">{msg.text}</p></div>)}
                                    </div>
                                    <div className="p-2 flex gap-2 border-t border-white/5 shrink-0">
                                        <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === "Enter" && sendMessage()} placeholder="Mesaj..." className="bg-white/5 border-white/10 h-10" style={{ fontSize: '16px' }} />
                                        <Button size="sm" onClick={sendMessage} className="bg-red-600 h-10"><Send className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col min-h-0">
                                    <div className="p-2 flex gap-2 border-b border-white/5 shrink-0">
                                        <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleSearch()} placeholder="YouTube'da ara..." className="bg-white/5 border-white/10 h-10" style={{ fontSize: '16px' }} />
                                        <Button size="sm" onClick={handleSearch} className="bg-red-600 h-10"><Search className="h-4 w-4" /></Button>
                                    </div>
                                    {searchResults.length > 0 && (
                                        <div className="p-2 space-y-1 max-h-24 overflow-y-auto border-b border-white/5 shrink-0">
                                            {searchResults.map((item) => <div key={item.id.videoId} onClick={() => addToQueue(item)} className="flex gap-2 p-1 rounded hover:bg-white/10 cursor-pointer"><img src={item.snippet.thumbnails.default.url} className="w-10 h-6 rounded" /><p className="text-xs line-clamp-1">{item.snippet.title}</p></div>)}
                                        </div>
                                    )}
                                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                        {queue.map((item, i) => (
                                            <div key={item.id} onClick={() => isCreator && setIndex(i)} className={`p-2 rounded-lg flex items-center gap-2 ${i === currentIndex ? "bg-red-600/30 border border-red-500/30" : "bg-white/5 hover:bg-white/10"} ${isCreator ? "cursor-pointer" : ""}`}>
                                                <span className="text-xs w-5 text-gray-500">{i + 1}</span>
                                                {item.thumbnail && <img src={item.thumbnail} className="w-14 h-8 rounded object-cover" />}
                                                <span className="flex-1 text-sm truncate">{item.title}</span>
                                                {isCreator && i !== currentIndex && <button onClick={(e) => { e.stopPropagation(); removeFromQueue(i); }}><Trash2 className="h-4 w-4 text-gray-500 hover:text-red-400" /></button>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Desktop Side Panel (Twitch style) - Hidden in Fullscreen */}
            {!isFullscreen && (
                <div className="hidden md:flex flex-col w-80 border-l border-white/5 bg-black/30 h-full">
                    <div className="flex border-b border-white/5 shrink-0">
                        <button onClick={() => setActivePanel("chat")} className={`flex-1 p-3 text-sm flex items-center justify-center gap-2 ${activePanel === "chat" ? "bg-white/10 text-white" : "text-gray-400"}`}><MessageCircle className="h-4 w-4" /> Sohbet</button>
                        <button onClick={() => setActivePanel("queue")} className={`flex-1 p-3 text-sm flex items-center justify-center gap-2 ${activePanel === "queue" ? "bg-white/10 text-white" : "text-gray-400"}`}><List className="h-4 w-4" /> Kuyruk</button>
                    </div>

                    {activePanel === "chat" ? (
                        <div className="flex-1 flex flex-col min-h-0">
                            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-3 space-y-2 scroll-smooth">
                                {chatMessages.length === 0 && <p className="text-gray-500 text-sm text-center py-8">Henüz mesaj yok</p>}
                                {chatMessages.map((msg, i) => (
                                    <div key={i} className="bg-white/5 rounded-lg p-2">
                                        <span className={`text-xs font-medium ${msg.user === "Ben" ? "text-blue-400" : "text-pink-400"}`}>{msg.user}</span>
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="p-3 flex gap-2 border-t border-white/5 shrink-0">
                                <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === "Enter" && sendMessage()} placeholder="Mesaj yaz..." className="bg-white/5 border-white/10 h-10" style={{ fontSize: '16px' }} />
                                <Button size="sm" onClick={sendMessage} className="bg-red-600 h-10"><Send className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="p-3 flex gap-2 border-b border-white/5 shrink-0">
                                <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleSearch()} placeholder="YouTube'da ara..." className="bg-white/5 border-white/10 h-10" style={{ fontSize: '16px' }} />
                                <Button size="sm" onClick={handleSearch} className="bg-red-600 h-10"><Search className="h-4 w-4" /></Button>
                            </div>
                            {searchResults.length > 0 && (
                                <div className="p-2 space-y-1 max-h-32 overflow-y-auto border-b border-white/5 shrink-0">
                                    {searchResults.map((item) => (
                                        <div key={item.id.videoId} onClick={() => addToQueue(item)} className="flex gap-2 p-2 rounded hover:bg-white/10 cursor-pointer">
                                            <img src={item.snippet.thumbnails.default.url} className="w-16 h-10 rounded" />
                                            <p className="text-xs line-clamp-2 flex-1">{item.snippet.title}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                {queue.map((item, i) => (
                                    <div key={item.id} onClick={() => isCreator && setIndex(i)} className={`p-2 rounded-lg flex items-center gap-2 ${i === currentIndex ? "bg-red-600/30 border border-red-500/30" : "bg-white/5 hover:bg-white/10"} ${isCreator ? "cursor-pointer" : ""}`}>
                                        <span className="text-xs w-5 text-gray-500">{i + 1}</span>
                                        {item.thumbnail && <img src={item.thumbnail} className="w-14 h-8 rounded object-cover" />}
                                        <span className="flex-1 text-sm truncate">{item.title}</span>
                                        {isCreator && i !== currentIndex && <button onClick={(e) => { e.stopPropagation(); removeFromQueue(i); }}><Trash2 className="h-4 w-4 text-gray-500 hover:text-red-400" /></button>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function WatchPage() {
    return <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Yükleniyor...</div>}><WatchContent /></Suspense>;
}
