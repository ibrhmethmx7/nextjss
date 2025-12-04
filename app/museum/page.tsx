"use client";

import dynamic from "next/dynamic";
import { BackgroundMusic } from "@/components/3d/BackgroundMusic";

const Scene = dynamic(() => import("@/components/3d/Scene"), { ssr: false });

export default function MuseumPage() {
    return (
        <div className="w-full h-screen bg-black relative">
            <div className="absolute top-4 left-4 z-10 text-white/50 text-sm pointer-events-none select-none">
                <p>Hareket: W, A, S, D</p>
                <p>Bakış: Mouse</p>
                <p>Çıkış: ESC</p>
            </div>
            <BackgroundMusic />
            <Scene />
        </div>
    );
}
