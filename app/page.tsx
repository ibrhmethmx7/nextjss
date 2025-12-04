"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Film, Heart, Lock, User } from "lucide-react";

const users = [
  { id: "ben", name: "Ben", color: "from-blue-500 to-blue-700" },
  { id: "sen", name: "Sen", color: "from-pink-500 to-pink-700" },
];

export default function LoginPage() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find((u) => u.id === selectedUser);

    if (user && password === "1234") {
      localStorage.setItem("cinema_user", user.id);
      localStorage.setItem("cinema_user_name", user.name);
      window.location.href = "/dashboard";
    } else {
      setError("Şifre yanlış");
    }
  };

  useEffect(() => {
    if (localStorage.getItem("cinema_user")) {
      window.location.href = "/dashboard";
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] via-[#1a0a1a] to-[#0a0a0a] text-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8"
      >
        {/* Logo */}
        <div className="text-center space-y-4">
          <motion.div
            className="relative inline-block"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Film className="w-20 h-20 text-red-500 mx-auto" />
            <Heart className="w-8 h-8 text-pink-500 fill-current absolute -top-1 -right-1 animate-pulse" />
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            Bizim Sinemamız
          </h1>
          <p className="text-gray-400">Sadece biz için</p>
        </div>

        {/* User Selection */}
        {!selectedUser ? (
          <div className="space-y-4">
            <p className="text-center text-gray-400 text-sm">Kim giriş yapıyor?</p>
            <div className="grid grid-cols-2 gap-4">
              {users.map((user) => (
                <motion.button
                  key={user.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedUser(user.id)}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 transition-all text-center"
                >
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${user.color} mx-auto mb-3 flex items-center justify-center`}>
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-medium">{user.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="text-center mb-4">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${users.find(u => u.id === selectedUser)?.color} mx-auto mb-2 flex items-center justify-center`}>
                <User className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm text-gray-400">Merhaba {users.find(u => u.id === selectedUser)?.name}!</p>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <Input
                type="password"
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white text-center text-lg h-12"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <Button type="submit" className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-lg h-12">
              Giriş Yap
            </Button>

            <button
              type="button"
              onClick={() => setSelectedUser(null)}
              className="w-full text-sm text-gray-500 hover:text-white transition-colors"
            >
              Geri dön
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
