"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addItem } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AdminPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: "",
        date: "",
        image: "",
        description: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addItem("memories", formData);
            alert("Anı başarıyla eklendi! 📸");
            setFormData({ title: "", date: "", image: "", description: "" });
            router.refresh();
        } catch (error) {
            alert("Bir hata oluştu.");
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-center text-primary font-romantic">Yeni Anı Ekle</h1>

            <Card className="bg-black/40 backdrop-blur-md border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Anı Detayları</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Başlık</label>
                            <Input
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Örn: Kapadokya Gezisi"
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Tarih</label>
                            <Input
                                required
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Fotoğraf URL</label>
                            <Input
                                required
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                placeholder="https://..."
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Açıklama</label>
                            <textarea
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="flex min-h-[100px] w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                placeholder="O gün neler hissettin?"
                            />
                        </div>

                        <Button type="submit" className="w-full">Kaydet</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
