"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (user: "ben" | "sen", name: string) => {
    setLoading(true);
    localStorage.setItem("cinema_user", user);
    localStorage.setItem("cinema_user_name", name);
    setTimeout(() => {
      router.push("/dashboard");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#141414] flex flex-col">
      {/* Netflix-style Header */}
      <header className="p-6 md:p-8">
        <div className="flex items-center gap-2">
          <span className="material-icons-round text-red-600 text-4xl">movie</span>
          <span className="text-red-600 font-bold text-2xl tracking-tight">SELOFLIX</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Login Box */}
          <div className="bg-black/70 rounded-lg p-8 md:p-12 backdrop-blur-sm">
            <h1 className="text-3xl font-bold mb-8 text-white">Kim İzliyor?</h1>

            {/* Profile Selection */}
            <div className="grid grid-cols-2 gap-6">
              {/* Ben */}
              <button
                onClick={() => handleLogin("ben", "İbrahim")}
                disabled={loading}
                className="group flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-white/5 transition-all disabled:opacity-50"
              >
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center group-hover:ring-4 ring-white transition-all">
                  <span className="material-icons-round text-white text-5xl">person</span>
                </div>
                <span className="text-gray-400 group-hover:text-white transition-colors text-lg">İbrahim</span>
              </button>

              {/* Sen */}
              <button
                onClick={() => handleLogin("sen", "Sevgilim")}
                disabled={loading}
                className="group flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-white/5 transition-all disabled:opacity-50"
              >
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center group-hover:ring-4 ring-white transition-all">
                  <span className="material-icons-round text-white text-5xl">favorite</span>
                </div>
                <span className="text-gray-400 group-hover:text-white transition-colors text-lg">Sevgilim</span>
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="mt-8 flex justify-center">
                <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Footer Text */}
          <p className="text-center text-gray-500 text-sm mt-8">
            Birlikte izlemek için profil seç 🎬
          </p>
        </div>
      </main>
    </div>
  );
}
