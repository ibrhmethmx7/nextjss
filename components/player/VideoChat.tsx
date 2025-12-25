import React, { useEffect, useState, useRef } from 'react';
import Peer from 'simple-peer';
import { ref, onChildAdded, push, set, remove, onDisconnect, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Mic, MicOff, Video, VideoOff, Move, Minus, Plus } from 'lucide-react';
import { motion } from "framer-motion";

interface VideoChatProps {
    roomId: string;
    userId: string;
    userName: string;
}

interface PeerData {
    peerId: string;
    peer: Peer.Instance;
    userName: string;
}

const VideoChat: React.FC<VideoChatProps> = ({ roomId, userId, userName }) => {
    const [peers, setPeers] = useState<PeerData[]>([]);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isMicOn, setIsMicOn] = useState(false);
    const [isCamOn, setIsCamOn] = useState(false);
    const [size, setSize] = useState(1);

    const userVideo = useRef<HTMLVideoElement>(null);
    const peersRef = useRef<PeerData[]>([]);

    useEffect(() => {
        // Initialize local stream (audio only initially to save bandwidth/permissions)
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(currentStream => {
            setStream(currentStream);
            if (userVideo.current) {
                userVideo.current.srcObject = currentStream;
            }

            // Default to off
            currentStream.getAudioTracks().forEach(track => track.enabled = false);
            currentStream.getVideoTracks().forEach(track => track.enabled = false);

            // Listen for incoming signals
            const signalsRef = ref(database, `rooms/${roomId}/signals/${userId}`);
            onChildAdded(signalsRef, (snapshot) => {
                const data = snapshot.val();
                if (!data) return;

                const { signal, callerID, callerName } = data;

                // If we receive an offer (someone calling us)
                if (data.type === 'offer') {
                    const peer = addPeer(signal, callerID, currentStream);
                    peersRef.current.push({
                        peerId: callerID,
                        peer,
                        userName: callerName
                    });
                    setPeers([...peersRef.current]);
                }
                // If we receive an answer (someone answered our call)
                else if (data.type === 'answer') {
                    const item = peersRef.current.find(p => p.peerId === callerID);
                    if (item) {
                        item.peer.signal(signal);
                    }
                }

                // Remove signal after processing
                remove(snapshot.ref);
            });

            // Join the room: Call all existing users
            const usersRef = ref(database, `rooms/${roomId}/users`);
            get(usersRef).then((snapshot) => {
                const users = snapshot.val();
                if (users) {
                    Object.values(users).forEach((user: any) => {
                        if (user.id !== userId) {
                            const peer = createPeer(user.id, userId, currentStream);
                            peersRef.current.push({
                                peerId: user.id,
                                peer,
                                userName: user.name
                            });
                            setPeers([...peersRef.current]);
                        }
                    });
                }
            });

        }).catch(err => console.error("Stream Error:", err));

    }, [roomId, userId]);

    // Function to call a peer (initiator)
    function createPeer(userToSignal: string, callerID: string, stream: MediaStream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            push(ref(database, `rooms/${roomId}/signals/${userToSignal}`), {
                type: 'offer',
                signal,
                callerID,
                callerName: userName
            });
        });

        return peer;
    }

    // Function to answer a call (receiver)
    function addPeer(incomingSignal: Peer.SignalData, callerID: string, stream: MediaStream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            push(ref(database, `rooms/${roomId}/signals/${callerID}`), {
                type: 'answer',
                signal,
                callerID: userId,
                callerName: userName
            });
        });

        peer.signal(incomingSignal);

        return peer;
    }

    const toggleMic = () => {
        if (stream) {
            stream.getAudioTracks().forEach(track => track.enabled = !isMicOn);
            setIsMicOn(!isMicOn);
        }
    };

    const toggleCam = () => {
        if (stream) {
            stream.getVideoTracks().forEach(track => track.enabled = !isCamOn);
            setIsCamOn(!isCamOn);
        }
    };

    const cardWidth = 128 * size;
    const cardHeight = 96 * size;

    return (
        <motion.div
            drag
            dragMomentum={false}
            className="fixed z-50 flex flex-col gap-2 p-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl"
            style={{ bottom: 80, right: 16 }}
        >
            {/* Controls Header */}
            <div className="flex items-center justify-between bg-white/5 px-2 py-1 rounded cursor-move mb-1 select-none">
                <div className="flex items-center gap-2 text-xs text-gray-300">
                    <Move size={12} />
                    <span className="font-medium">Görüntü</span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => setSize(s => Math.max(0.5, s - 0.1))} className="p-1 hover:bg-white/10 rounded text-gray-300"><Minus size={12} /></button>
                    <span className="text-[10px] text-gray-500 w-6 text-center">{(size * 100).toFixed(0)}%</span>
                    <button onClick={() => setSize(s => Math.min(2, s + 0.1))} className="p-1 hover:bg-white/10 rounded text-gray-300"><Plus size={12} /></button>
                </div>
            </div>

            <div className="flex flex-col gap-2 items-end">
                {/* Local User */}
                <div
                    className={`relative bg-black rounded-lg overflow-hidden border border-white/20 shadow-lg transition-all ${isCamOn ? 'opacity-100' : 'opacity-50'}`}
                    style={{ width: cardWidth, height: cardHeight }}
                >
                    <video muted ref={userVideo} autoPlay playsInline className="w-full h-full object-cover" />
                    <div className="absolute bottom-1 left-1 text-[10px] bg-black/50 px-1 rounded text-white truncate max-w-full">{userName} (Sen)</div>
                    <div className="absolute top-1 right-1 flex gap-1">
                        <button onClick={toggleMic} className={`p-1 rounded-full ${isMicOn ? 'bg-green-500' : 'bg-red-500'}`}>
                            {isMicOn ? <Mic size={10} /> : <MicOff size={10} />}
                        </button>
                        <button onClick={toggleCam} className={`p-1 rounded-full ${isCamOn ? 'bg-green-500' : 'bg-red-500'}`}>
                            {isCamOn ? <Video size={10} /> : <VideoOff size={10} />}
                        </button>
                    </div>
                </div>

                {/* Remote Peers */}
                {peers.map((peerData) => (
                    <VideoCard key={peerData.peerId} peer={peerData.peer} userName={peerData.userName} width={cardWidth} height={cardHeight} />
                ))}
            </div>
        </motion.div>
    );
};

const VideoCard = ({ peer, userName, width, height }: { peer: Peer.Instance, userName: string, width: number, height: number }) => {
    const ref = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        peer.on("stream", stream => {
            if (ref.current) {
                ref.current.srcObject = stream;
            }
        });
    }, [peer]);

    return (
        <div
            className="relative bg-black rounded-lg overflow-hidden border border-white/20 shadow-lg"
            style={{ width, height }}
        >
            <video ref={ref} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute bottom-1 left-1 text-[10px] bg-black/50 px-1 rounded text-white truncate max-w-full">{userName}</div>
        </div>
    );
};

export default VideoChat;
