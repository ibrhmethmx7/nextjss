"use client";

import { PointerLockControls } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Vector3 } from "three";

export function Player() {
    const { camera } = useThree();
    const [moveForward, setMoveForward] = useState(false);
    const [moveBackward, setMoveBackward] = useState(false);
    const [moveLeft, setMoveLeft] = useState(false);
    const [moveRight, setMoveRight] = useState(false);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            switch (event.code) {
                case "ArrowUp":
                case "KeyW":
                    setMoveForward(true);
                    break;
                case "ArrowLeft":
                case "KeyA":
                    setMoveLeft(true);
                    break;
                case "ArrowDown":
                case "KeyS":
                    setMoveBackward(true);
                    break;
                case "ArrowRight":
                case "KeyD":
                    setMoveRight(true);
                    break;
            }
        };

        const onKeyUp = (event: KeyboardEvent) => {
            switch (event.code) {
                case "ArrowUp":
                case "KeyW":
                    setMoveForward(false);
                    break;
                case "ArrowLeft":
                case "KeyA":
                    setMoveLeft(false);
                    break;
                case "ArrowDown":
                case "KeyS":
                    setMoveBackward(false);
                    break;
                case "ArrowRight":
                case "KeyD":
                    setMoveRight(false);
                    break;
            }
        };

        document.addEventListener("keydown", onKeyDown);
        document.addEventListener("keyup", onKeyUp);

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.removeEventListener("keyup", onKeyUp);
        };
    }, []);

    useFrame((state, delta) => {
        const speed = 5 * delta;
        const direction = new Vector3();

        if (moveForward) direction.z -= speed;
        if (moveBackward) direction.z += speed;
        if (moveLeft) direction.x -= speed;
        if (moveRight) direction.x += speed;

        camera.translateX(direction.x);
        camera.translateZ(direction.z);

        // Keep player on the ground
        camera.position.y = 1.7;
    });

    return <PointerLockControls />;
}
