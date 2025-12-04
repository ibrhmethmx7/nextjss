"use client";

import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Heart } from "lucide-react";

// Dynamic import to avoid SSR issues with Leaflet
const MapContainer = dynamic(
    () => import("react-leaflet").then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import("react-leaflet").then((mod) => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import("react-leaflet").then((mod) => mod.Marker),
    { ssr: false }
);
const Popup = dynamic(
    () => import("react-leaflet").then((mod) => mod.Popup),
    { ssr: false }
);

// Sample memories data - replace with your own!
const memories = [
    // World Level
    {
        id: "paris",
        title: "Paris Hayalimiz",
        description: "Bir gün birlikte gideceğiz...",
        image: "https://picsum.photos/seed/paris/400/300",
        coordinates: [48.8566, 2.3522] as [number, number],
        category: "world",
    },
    // Turkey Level
    {
        id: "istanbul",
        title: "İstanbul",
        description: "Büyük şehrin büyüsü",
        image: "https://picsum.photos/seed/istanbul/400/300",
        coordinates: [41.0082, 28.9784] as [number, number],
        category: "turkey",
    },
    {
        id: "izmir",
        title: "İzmir",
        description: "Deniz, kum, güneş ve sen",
        image: "https://picsum.photos/seed/izmir/400/300",
        coordinates: [38.4237, 27.1428] as [number, number],
        category: "turkey",
    },
    {
        id: "antalya",
        title: "Antalya",
        description: "Tatil anılarımız",
        image: "https://picsum.photos/seed/antalya/400/300",
        coordinates: [36.8969, 30.7133] as [number, number],
        category: "turkey",
    },
    // City Level - Example for Istanbul
    {
        id: "kadikoy",
        title: "Kadıköy Sahil",
        description: "İlk yürüyüşümüz buradaydı",
        image: "https://picsum.photos/seed/kadikoy/400/300",
        coordinates: [40.9927, 29.0290] as [number, number],
        category: "city",
    },
    {
        id: "besiktas",
        title: "Beşiktaş",
        description: "Favori kafemiz",
        image: "https://picsum.photos/seed/besiktas/400/300",
        coordinates: [41.0422, 29.0070] as [number, number],
        category: "city",
    },
    // Location Level - Specific places
    {
        id: "kafe1",
        title: "Bizim Kafemiz ☕",
        description: "Her hafta sonu buluştuğumuz yer",
        image: "https://picsum.photos/seed/cafe/400/300",
        coordinates: [41.0100, 29.0300] as [number, number],
        category: "location",
    },
];

export default function LoveMap() {
    const [selectedMemory, setSelectedMemory] = useState<typeof memories[0] | null>(null);
    const [mapReady, setMapReady] = useState(false);

    // Default center (Turkey)
    const defaultCenter: [number, number] = [39.0, 35.0];
    const defaultZoom = 6;

    return (
        <div className="relative w-full h-screen bg-[#050510]">
            {/* Leaflet CSS */}
            <link
                rel="stylesheet"
                href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
                crossOrigin=""
            />

            {/* Map Container */}
            <MapContainer
                center={defaultCenter}
                zoom={defaultZoom}
                className="w-full h-full z-0"
                style={{ background: "#050510" }}
                whenReady={() => setMapReady(true)}
            >
                {/* Dark Theme Tiles */}
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* Memory Markers */}
                {memories.map((memory) => (
                    <Marker
                        key={memory.id}
                        position={memory.coordinates}
                        eventHandlers={{
                            click: () => setSelectedMemory(memory),
                        }}
                    />
                ))}
            </MapContainer>

            {/* Instructions */}
            <div className="absolute top-4 left-4 z-[1000] bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-white/70 text-sm">
                <MapPin className="inline-block w-4 h-4 mr-2 text-primary" />
                Anılara tıkla
            </div>

            {/* Memory Detail Modal */}
            <AnimatePresence>
                {selectedMemory && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                        onClick={() => setSelectedMemory(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 50 }}
                            className="bg-[#0a0a1a] border border-white/10 rounded-2xl overflow-hidden max-w-md w-full shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Image */}
                            {selectedMemory.image && (
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={selectedMemory.image}
                                        alt={selectedMemory.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] to-transparent" />
                                </div>
                            )}

                            {/* Content */}
                            <div className="p-6 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Heart className="w-5 h-5 text-primary fill-current" />
                                    <h2 className="text-2xl font-romantic text-primary">
                                        {selectedMemory.title}
                                    </h2>
                                </div>
                                <p className="text-gray-300 leading-relaxed">
                                    {selectedMemory.description}
                                </p>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedMemory(null)}
                                className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
