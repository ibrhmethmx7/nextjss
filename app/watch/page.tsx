"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Trash2, SkipForward, List, CheckCircle, Search, MessageCircle, Send, Maximize2, Minimize2 } from "lucide-react";
import Link from "next/link";
import { database, YOUTUBE_API_KEY } from "@/lib/firebase";
import { ref, update, push, set, onValue, get } from "firebase/database";

type QueueItem = { id: string; title: string; url: string; thumbnail?: string; movieId?: string; };
type ChatMessage = { user: string; text: string; time: number; };

async function searchYouTube(query: string): Promise<any[]> {
    try {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(query)}&type=video&key=${YOUTUBE_API_KEY}`);
        const data = await res.json();
        return data.items || [];
    } catch { return []; }
}

function getEmbedUrl(url: string): string {
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    return url;
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

    const containerRef = useRef<HTMLDivElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Initialize User and Room
    useEffect(() => {
        // User ID Setup
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

        // Check/Set Creator
        const checkCreator = async () => {
            const roomRef = ref(database, `rooms/${room}`);
            const snapshot = await get(roomRef);
            if (!snapshot.exists()) {
                // Create room
                await set(roomRef, { creatorId: uid, creatorName: username, created: Date.now() });
                setIsCreator(true);
            } else {
                const data = snapshot.val();
                if (data.creatorId === uid) setIsCreator(true);
            }
        };
        checkCreator();

        // Initial Queue Setup (only if queue is empty and we have initial params)
        // We should only do this if we are the creator or if the room is new?
        // For now, let's just push if the queue is empty in the DB.
        if (initialUrl) {
            const queueRef = ref(database, `rooms/${room}/queue`);
            get(queueRef).then((snap) => {
                if (!snap.exists()) {
                    const decodedUrl = decodeURIComponent(initialUrl);
                    const decodedTitle = decodeURIComponent(initialTitle) || "Video";
                    const initialQueue = [{
                        id: "initial",
                        title: decodedTitle,
                        url: decodedUrl,
                        thumbnail: getThumbnail(decodedUrl),
                        movieId: movieId || undefined
                    }];
                    set(queueRef, initialQueue);
                }
            });
        }
    }, [initialUrl, initialTitle, movieId, searchParams]);

    // Sync Data (Chat, Queue, CurrentIndex)
    useEffect(() => {
        if (!roomId) return;

        // Chat
        const chatRef = ref(database, `rooms/${roomId}/messages`);
        const unsubChat = onValue(chatRef, (snapshot) => {
            const data = snapshot.val();
            if (data) setChatMessages((Object.values(data) as ChatMessage[]).slice(-50));
        });

        // Queue
        const queueRef = ref(database, `rooms/${roomId}/queue`);
        const unsubQueue = onValue(queueRef, (snapshot) => {
            const data = snapshot.val();
            if (data) setQueue(data as QueueItem[]);
        });

        // Current Index
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

    // Auto-scroll chat
    useEffect(() => {
        if (chatMessages.length > 0) {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }, [chatMessages, activePanel]);

    const copyRoomLink = () => {
        const url = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
        navigator.clipboard.writeText(url);
        alert("Oda linki kopyalandı! Arkadaşlarına gönder.");
    };

    // Fullscreen Listener
    useEffect(() => {
        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

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

    const currentVideo = queue[currentIndex];

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
        if (!isCreator) return; // Only creator can manage queue? Or maybe everyone? Let's restrict to creator for now as requested.
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
        <div ref={containerRef} className={`${isFullscreen ? 'fixed inset-0 bg-black z-50' : 'h-screen bg-[#0a0a0a] overflow-hidden'} text-white flex flex-col lg:flex-row transition-all duration-300`}>

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
                        <div className="flex gap-1 lg:hidden">
                            <Button variant="ghost" size="sm" onClick={() => setActivePanel("chat")} className={activePanel === "chat" ? "bg-white/10" : ""}><MessageCircle className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => setActivePanel("queue")} className={activePanel === "queue" ? "bg-white/10" : ""}><List className="h-4 w-4" /></Button>
                        </div>
                    </div>
                )}

                {/* Video Container */}
                <div className={`relative w-full shrink-0 ${isFullscreen ? 'flex-1 h-full' : ''}`} style={!isFullscreen ? { paddingTop: "56.25%" } : {}}>
                    <iframe
                        src={getEmbedUrl(currentVideo.url)}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />

                    {/* Fullscreen Overlay */}
                    {isFullscreen && (
                        <>
                            {/* Floating Chat */}
                            <div className="absolute right-4 bottom-24 w-80 max-h-64 overflow-hidden pointer-events-none flex flex-col justify-end">
                                <div className="overflow-y-auto max-h-full space-y-2 p-2">
                                    {chatMessages.slice(-10).map((msg, i) => (
                                        <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-sm border border-white/5 shadow-lg">
                                            <span className={`font-bold ${msg.user === "Ben" ? "text-blue-400" : "text-pink-400"}`}>{msg.user}: </span>
                                            <span className="text-white/90">{msg.text}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Controls Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pointer-events-none pt-20 pb-16">
                                <div className="flex items-center justify-between gap-2 pointer-events-auto max-w-4xl mx-auto w-full">
                                    <Button size="sm" variant="ghost" onClick={toggleFullscreen} className="hover:bg-white/10"><Minimize2 className="h-5 w-5" /></Button>
                                    <div className="flex gap-2 flex-1 max-w-xl">
                                        <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === "Enter" && sendMessage()} placeholder="Mesaj..." className="bg-black/50 border-white/20 h-10 backdrop-blur-md" style={{ fontSize: '16px' }} />
                                        <Button size="sm" onClick={sendMessage} className="bg-red-600 h-10 px-4"><Send className="h-4 w-4" /></Button>
                                    </div>
                                    {isCreator && (
                                        <div className="flex gap-2">
                                            <span className="text-xs text-white/50 self-center">{currentIndex + 1}/{queue.length}</span>
                                            {currentIndex < queue.length - 1 && <Button size="sm" onClick={playNext} className="bg-red-600 h-10"><SkipForward className="h-4 w-4" /></Button>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Normal Mode Maximize Button */}
                    {!isFullscreen && (
                        <button onClick={toggleFullscreen} className="absolute top-2 right-2 p-2 bg-black/60 rounded-lg hover:bg-black/80 z-10 text-white/80 hover:text-white transition-colors">
                            <Maximize2 className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {/* Normal Controls & Mobile Panel - Hidden in Fullscreen */}
                {!isFullscreen && (
                    <>
                        <div className="p-3 flex items-center justify-between gap-2 border-b border-white/5 bg-black/40">
                            <Button size="sm" variant="outline" onClick={markCompleted} className="border-green-500/50 text-green-400 text-xs hover:bg-green-500/10">
                                <CheckCircle className="h-4 w-4 mr-1" /> Bitirdik
                            </Button>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">{currentIndex + 1}/{queue.length}</span>
                                {isCreator && currentIndex < queue.length - 1 && <Button size="sm" onClick={playNext} className="bg-red-600 text-xs"><SkipForward className="h-4 w-4 mr-1" /> Sonraki</Button>}
                            </div>
                        </div>

                        {/* Mobile Panel */}
                        <div className="lg:hidden flex-1 border-t border-white/5 bg-black/50 flex flex-col" style={{ minHeight: 250 }}>
                            <div className="flex border-b border-white/5">
                                <button onClick={() => setActivePanel("chat")} className={`flex-1 p-2 text-sm flex items-center justify-center gap-2 ${activePanel === "chat" ? "bg-white/10 text-white" : "text-gray-400"}`}><MessageCircle className="h-4 w-4" /> Sohbet</button>
                                <button onClick={() => setActivePanel("queue")} className={`flex-1 p-2 text-sm flex items-center justify-center gap-2 ${activePanel === "queue" ? "bg-white/10 text-white" : "text-gray-400"}`}><List className="h-4 w-4" /> Kuyruk</button>
                            </div>
                            {activePanel === "chat" ? (
                                <div className="flex-1 flex flex-col min-h-0">
                                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                                        {chatMessages.length === 0 && <p className="text-gray-500 text-sm text-center py-4">Henüz mesaj yok</p>}
                                        {chatMessages.map((msg, i) => <div key={i} className="bg-white/5 rounded p-2"><span className={`text-xs font-medium ${msg.user === "Ben" ? "text-blue-400" : "text-pink-400"}`}>{msg.user}</span><p className="text-sm">{msg.text}</p></div>)}
                                        <div ref={chatEndRef} />
                                    </div>
                                    <div className="p-2 flex gap-2 border-t border-white/5">
                                        <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === "Enter" && sendMessage()} placeholder="Mesaj..." className="bg-white/5 border-white/10 h-10" style={{ fontSize: '16px' }} />
                                        <Button size="sm" onClick={sendMessage} className="bg-red-600 h-10"><Send className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col min-h-0">
                                    <div className="p-2 flex gap-2 border-b border-white/5">
                                        <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleSearch()} placeholder="YouTube'da ara..." className="bg-white/5 border-white/10 h-10" style={{ fontSize: '16px' }} />
                                        <Button size="sm" onClick={handleSearch} className="bg-red-600 h-10"><Search className="h-4 w-4" /></Button>
                                    </div>
                                    {searchResults.length > 0 && (
                                        <div className="p-2 space-y-1 max-h-24 overflow-y-auto border-b border-white/5">
                                            {searchResults.map((item) => <div key={item.id.videoId} onClick={() => addToQueue(item)} className="flex gap-2 p-1 rounded hover:bg-white/10 cursor-pointer"><img src={item.snippet.thumbnails.default.url} className="w-10 h-6 rounded" /><p className="text-xs line-clamp-1">{item.snippet.title}</p></div>)}
                                        </div>
                                    )}
                                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                        {queue.map((item, i) => (
                                            <div key={item.id} onClick={() => isCreator && setIndex(i)} className={`p-2 rounded flex items-center gap-2 ${i === currentIndex ? "bg-red-600/30" : "bg-white/5"} ${isCreator ? "cursor-pointer" : ""}`}>
                                                <span className="text-xs w-4">{i + 1}</span>
                                                {item.thumbnail && <img src={item.thumbnail} className="w-10 h-6 rounded" />}
                                                <span className="flex-1 text-xs truncate">{item.title}</span>
                                                {isCreator && i !== currentIndex && <button onClick={(e) => { e.stopPropagation(); removeFromQueue(i); }}><Trash2 className="h-3 w-3 text-gray-500" /></button>}
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
                <div className="hidden lg:flex flex-col w-80 border-l border-white/5 bg-black/30 h-full">
                    <div className="flex border-b border-white/5 shrink-0">
                        <button onClick={() => setActivePanel("chat")} className={`flex-1 p-3 text-sm flex items-center justify-center gap-2 ${activePanel === "chat" ? "bg-white/10 text-white" : "text-gray-400"}`}><MessageCircle className="h-4 w-4" /> Sohbet</button>
                        <button onClick={() => setActivePanel("queue")} className={`flex-1 p-3 text-sm flex items-center justify-center gap-2 ${activePanel === "queue" ? "bg-white/10 text-white" : "text-gray-400"}`}><List className="h-4 w-4" /> Kuyruk</button>
                    </div>

                    {activePanel === "chat" ? (
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                {chatMessages.length === 0 && <p className="text-gray-500 text-sm text-center py-8">Henüz mesaj yok</p>}
                                {chatMessages.map((msg, i) => (
                                    <div key={i} className="bg-white/5 rounded-lg p-2">
                                        <span className={`text-xs font-medium ${msg.user === "Ben" ? "text-blue-400" : "text-pink-400"}`}>{msg.user}</span>
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
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
