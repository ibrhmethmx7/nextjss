"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Image, Gamepad2, PenTool, LogOut, Calendar } from "lucide-react";
import { StarBackground } from "@/components/features/StarBackground";
import { MusicPlayer } from "@/components/features/MusicPlayer";
import { CursorEffect } from "@/components/features/CursorEffect";
import { FloatingDock } from "@/components/ui/floating-dock";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/home", title: "Ana Sayfa", icon: <Home className="h-full w-full" /> },
    { href: "/memories", title: "Anılarımız", icon: <Image className="h-full w-full" /> },
    { href: "/games", title: "Oyunlar", icon: <Gamepad2 className="h-full w-full" /> },
    { href: "/notes", title: "Notlar", icon: <PenTool className="h-full w-full" /> },
    { href: "/calendar", title: "Takvim", icon: <Calendar className="h-full w-full" /> },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-background overflow-hidden cursor-none text-foreground">
            <StarBackground />
            <MusicPlayer />
            <CursorEffect />

            <AnimatePresence mode="wait">
                <motion.main
                    key={pathname}
                    initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col"
                >
                    {children}
                </motion.main>
            </AnimatePresence>

            <FloatingDock items={navItems} />
        </div>
    );
}
