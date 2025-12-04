"use client";

import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import { Text } from "@react-three/drei";
import { useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Frame({ url, position, rotation, title }: { url: string; position: [number, number, number]; rotation?: [number, number, number]; title?: string }) {
    const texture = useLoader(TextureLoader, url);
    const [hovered, setHover] = useState(false);
    const groupRef = useRef<THREE.Group>(null);
    const [scale, setScale] = useState(1);

    useFrame(() => {
        const targetScale = hovered ? 1.1 : 1;
        setScale((prev) => THREE.MathUtils.lerp(prev, targetScale, 0.1));
    });

    return (
        <group position={position} rotation={rotation} ref={groupRef} scale={scale}>
            <group
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
            >
                {/* Frame Border */}
                <mesh position={[0, 0, -0.05]}>
                    <boxGeometry args={[3.2, 2.2, 0.1]} />
                    <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
                </mesh>

                {/* Image Plane */}
                <mesh>
                    <planeGeometry args={[3, 2]} />
                    <meshBasicMaterial map={texture} />
                </mesh>
            </group>

            {/* Title Text */}
            {hovered && title && (
                <Text
                    position={[0, -1.5, 0.1]}
                    fontSize={0.2}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    maxWidth={3}
                >
                    {title}
                </Text>
            )}
        </group>
    );
}
