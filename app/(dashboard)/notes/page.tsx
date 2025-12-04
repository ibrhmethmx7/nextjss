"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollText, Heart, Plus, X, Send } from "lucide-react";
import { fetchData, addItem } from "@/lib/api";

export default function NotesPage() {
    const [notes, setNotes] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [newNote, setNewNote] = useState({ title: "", content: "", date: new Date().toISOString().split('T')[0] });

    useEffect(() => {
        loadNotes();
    }, []);

    const loadNotes = async () => {
        try {
            const data = await fetchData();
            setNotes(data.notes);
        } catch (error) {
            console.error("Failed to load notes", error);
        }
    };

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.title || !newNote.content) return;

        try {
            await addItem("notes", newNote);
            setNewNote({ title: "", content: "", date: new Date().toISOString().split('T')[0] });
            setShowForm(false);
            loadNotes();
        } catch (error) {
            console.error("Failed to add note", error);
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-romantic text-primary drop-shadow-lg">Sana Notlarım</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Kalbimden dökülenler...
                </p>
                <Button onClick={() => setShowForm(!showForm)} variant="outline" className="gap-2 border-primary/50 text-primary hover:bg-primary/20">
                    {showForm ? <X size={16} /> : <Plus size={16} />}
                    {showForm ? "Vazgeç" : "Not Bırak"}
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
                        <Card className="max-w-md mx-auto bg-black/40 backdrop-blur-md border-white/10 mb-8">
                            <CardContent className="pt-6">
                                <form onSubmit={handleAddNote} className="space-y-4">
                                    <Input
                                        placeholder="Başlık"
                                        value={newNote.title}
                                        onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white"
                                    />
                                    <textarea
                                        className="flex min-h-[100px] w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                        placeholder="Mesajın..."
                                        value={newNote.content}
                                        onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                                    />
                                    <Button type="submit" className="w-full gap-2">
                                        <Send size={16} /> Gönder
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid gap-6 max-w-3xl mx-auto">
                {notes.map((note, index) => (
                    <motion.div
                        key={note.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.2 }}
                    >
                        <Card className="bg-black/40 backdrop-blur-md border-white/10 hover:shadow-lg hover:shadow-primary/10 transition-all">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-2xl font-romantic text-primary">
                                        <ScrollText size={20} />
                                        {note.title}
                                    </CardTitle>
                                    <span className="text-sm text-muted-foreground">{note.date}</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-lg leading-relaxed italic font-serif text-gray-300">
                                    "{note.content}"
                                </p>
                                <div className="flex justify-end mt-4">
                                    <Heart className="text-primary fill-current h-5 w-5 animate-pulse" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
