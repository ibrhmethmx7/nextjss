"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Environment, Loader } from "@react-three/drei";
import { Gallery } from "./Gallery";
import { Player } from "./Player";

export default function Scene() {
    return (
        <>
            <Canvas
                shadows
                camera={{ position: [0, 2, 5], fov: 75 }}
                className="w-full h-screen bg-black"
            >
                <Suspense fallback={null}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} castShadow />

                    <Gallery />
                    <Player />

                    <Environment preset="night" />
                </Suspense>
            </Canvas>
            <Loader />
        </>
    );
}
