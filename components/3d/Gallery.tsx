"use client";

import { Frame } from "./Frame";
import { useLoader } from "@react-three/fiber";
import { TextureLoader, RepeatWrapping } from "three";

// Placeholder images - replace with your own photos!
const memories = [
    { id: 1, url: "https://picsum.photos/seed/love1/800/600", title: "İlk Buluşma", position: [0, 2, -9.9] as [number, number, number] },
    { id: 2, url: "https://picsum.photos/seed/love2/800/600", title: "Tatilimiz", position: [-9.9, 2, 0] as [number, number, number], rotation: [0, Math.PI / 2, 0] as [number, number, number] },
    { id: 3, url: "https://picsum.photos/seed/love3/800/600", title: "Yılbaşı", position: [9.9, 2, 0] as [number, number, number], rotation: [0, -Math.PI / 2, 0] as [number, number, number] },
    { id: 4, url: "https://picsum.photos/seed/love4/800/600", title: "Gülüşün", position: [0, 2, 9.9] as [number, number, number], rotation: [0, Math.PI, 0] as [number, number, number] },
];

export function Gallery() {
    // Floor texture
    const floorTexture = useLoader(TextureLoader, "https://picsum.photos/seed/floor/1000/1000");
    floorTexture.wrapS = floorTexture.wrapT = RepeatWrapping;
    floorTexture.repeat.set(10, 10);

    return (
        <group>
            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[20, 20]} />
                <meshStandardMaterial map={floorTexture} roughness={0.5} metalness={0.1} />
            </mesh>

            {/* Ceiling */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 10, 0]}>
                <planeGeometry args={[20, 20]} />
                <meshStandardMaterial color="#1a1a1a" />
            </mesh>

            {/* Walls */}
            <mesh position={[0, 5, -10]}>
                <planeGeometry args={[20, 10]} />
                <meshStandardMaterial color="#050510" />
            </mesh>
            <mesh position={[0, 5, 10]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[20, 10]} />
                <meshStandardMaterial color="#050510" />
            </mesh>
            <mesh position={[-10, 5, 0]} rotation={[0, Math.PI / 2, 0]}>
                <planeGeometry args={[20, 10]} />
                <meshStandardMaterial color="#050510" />
            </mesh>
            <mesh position={[10, 5, 0]} rotation={[0, -Math.PI / 2, 0]}>
                <planeGeometry args={[20, 10]} />
                <meshStandardMaterial color="#050510" />
            </mesh>

            {/* Frames */}
            {memories.map((memory) => (
                <Frame key={memory.id} {...memory} />
            ))}
        </group>
    );
}
