"use client";

import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export const FloatingDock = ({
    items,
    className,
}: {
    items: { title: string; icon: React.ReactNode; href: string }[];
    className?: string;
}) => {
    return (
        <div className={cn("fixed bottom-8 left-1/2 -translate-x-1/2 z-50", className)}>
            <motion.div
                layoutId="dock"
                className="flex h-16 gap-4 items-end rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 px-4 pb-3 shadow-2xl shadow-primary/20"
            >
                {items.map((item) => (
                    <IconContainer key={item.title} {...item} />
                ))}
            </motion.div>
        </div>
    );
};

function IconContainer({
    title,
    icon,
    href,
}: {
    title: string;
    icon: React.ReactNode;
    href: string;
}) {
    const pathname = usePathname();
    const isActive = pathname === href;
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Link href={href}>
            <motion.div
                className="relative flex flex-col items-center justify-center gap-2 group"
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
            >
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, x: "-50%" }}
                            animate={{ opacity: 1, y: -50, x: "-50%" }}
                            exit={{ opacity: 0, y: 2, x: "-50%" }}
                            className="absolute left-1/2 -top-2 w-max -translate-x-1/2 rounded-md border border-gray-500/20 bg-gray-900/80 px-2 py-0.5 text-xs text-white backdrop-blur-md"
                        >
                            {title}
                        </motion.div>
                    )}
                </AnimatePresence>
                <motion.div
                    className={cn(
                        "flex items-center justify-center rounded-full bg-white/10 border border-white/10 shadow-sm transition-all duration-200",
                        isActive ? "bg-white/30 border-white/40" : "hover:bg-white/20"
                    )}
                    whileHover={{ scale: 1.2, translateY: -10 }}
                    whileTap={{ scale: 0.9 }}
                    style={{ width: 50, height: 50 }}
                >
                    <div className={cn("h-6 w-6", isActive ? "text-white" : "text-white/80")}>
                        {icon}
                    </div>
                </motion.div>
                {isActive && (
                    <motion.div
                        layoutId="active-dot"
                        className="absolute -bottom-2 w-1 h-1 bg-white rounded-full"
                    />
                )}
            </motion.div>
        </Link>
    );
}
