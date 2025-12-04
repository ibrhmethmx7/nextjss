"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { fetchData } from "@/lib/api";

export default function MemoriesPage() {
    const [memories, setMemories] = useState<any[]>([]);

    useEffect(() => {
        const loadMemories = async () => {
            try {
                const data = await fetchData();
                setMemories(data.memories);
            } catch (error) {
                console.error("Failed to load memories", error);
            }
        };
        loadMemories();
    }, []);

    return (
        <div className="space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-romantic text-primary drop-shadow-lg">Anılarımız</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Birlikte biriktirdiğimiz en güzel anlar...
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {memories.map((memory, index) => (
                    <motion.div
                        key={memory.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -10 }}
                    >
                        <Card className="overflow-hidden bg-black/40 backdrop-blur-md border-white/10 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 group h-full">
                            <div className="relative h-64 overflow-hidden">
                                <img
                                    src={memory.image}
                                    alt={memory.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                    <p className="text-white text-sm font-medium">{format(new Date(memory.date), "d MMMM yyyy", { locale: tr })}</p>
                                </div>
                            </div>
                            <CardContent className="p-6 space-y-2">
                                <h3 className="text-xl font-semibold text-primary font-romantic">{memory.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {memory.description}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
