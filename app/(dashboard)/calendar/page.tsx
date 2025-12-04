"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon, Star, Gift, Heart, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { fetchData, addItem } from "@/lib/api";

const typeIcons: Record<string, any> = {
    anniversary: Heart,
    special: Star,
    birthday: Gift,
};

const typeColors: Record<string, string> = {
    anniversary: "text-red-500 bg-red-50/10",
    special: "text-yellow-500 bg-yellow-50/10",
    birthday: "text-purple-500 bg-purple-50/10",
};

export default function CalendarPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: "", date: "", type: "special" });

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const data = await fetchData();
            setEvents(data.calendarEvents);
        } catch (error) {
            console.error("Failed to load events", error);
        }
    };

    const handleAddEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEvent.title || !newEvent.date) return;

        try {
            await addItem("calendarEvents", newEvent);
            setNewEvent({ title: "", date: "", type: "special" });
            setShowForm(false);
            loadEvents();
        } catch (error) {
            console.error("Failed to add event", error);
        }
    };

    // Sort events by month/day
    const sortedEvents = [...events].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        // Compare only month and day for annual recurrence logic if needed, 
        // but here we just sort by full date for simplicity or next occurrence
        return dateA.getTime() - dateB.getTime();
    });

    return (
        <div className="space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-romantic text-primary drop-shadow-lg">Özel Günlerimiz</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Asla unutmayacağım tarihler...
                </p>
                <Button onClick={() => setShowForm(!showForm)} variant="outline" className="gap-2 border-primary/50 text-primary hover:bg-primary/20">
                    {showForm ? <X size={16} /> : <Plus size={16} />}
                    {showForm ? "İptal" : "Yeni Tarih Ekle"}
                </Button>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <Card className="max-w-md mx-auto bg-black/40 backdrop-blur-md border-white/10">
                            <CardContent className="pt-6">
                                <form onSubmit={handleAddEvent} className="space-y-4">
                                    <Input
                                        placeholder="Başlık (Örn: Sinema Gecesi)"
                                        value={newEvent.title}
                                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white"
                                    />
                                    <Input
                                        type="date"
                                        value={newEvent.date}
                                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white"
                                    />
                                    <select
                                        value={newEvent.type}
                                        onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                                        className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                    >
                                        <option value="special" className="bg-gray-900">Özel Gün ⭐</option>
                                        <option value="anniversary" className="bg-gray-900">Yıldönümü ❤️</option>
                                        <option value="birthday" className="bg-gray-900">Doğum Günü 🎂</option>
                                    </select>
                                    <Button type="submit" className="w-full">Kaydet</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid gap-4 max-w-2xl mx-auto">
                {sortedEvents.map((event, index) => {
                    const Icon = typeIcons[event.type] || CalendarIcon;
                    const colorClass = typeColors[event.type] || "text-gray-400 bg-gray-500/10";

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="bg-black/40 backdrop-blur-md border-white/10 hover:border-primary/50 transition-colors group">
                                <CardContent className="flex items-center gap-4 p-4">
                                    <div className={`p-3 rounded-full ${colorClass} group-hover:scale-110 transition-transform`}>
                                        <Icon size={24} />
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                                        <p className="text-muted-foreground">
                                            {format(new Date(event.date), "d MMMM yyyy", { locale: tr })}
                                        </p>
                                    </div>
                                    <div className="text-sm font-medium text-primary/60">
                                        {event.type === "birthday" ? "🎂" : "❤️"}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
