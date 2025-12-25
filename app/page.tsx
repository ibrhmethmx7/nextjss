"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<"ben" | "sen" | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const passwords = {
    ben: "1234",      // İbrahim'in şifresi
    sen: "1234",      // Selinay'ın şifresi
  };

  const handleProfileClick = (user: "ben" | "sen") => {
    setSelectedUser(user);
    setPassword("");
    setError("");
  };

  const handleLogin = () => {
    if (!selectedUser) return;

    if (password === passwords[selectedUser]) {
      setLoading(true);
      localStorage.setItem("cinema_user", selectedUser);
      localStorage.setItem("cinema_user_name", selectedUser === "ben" ? "İbrahim" : "Selinay");
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } else {
      setError("Yanlış şifre!");
    }
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

            {!selectedUser ? (
              /* Profile Selection */
              <div className="grid grid-cols-2 gap-6">
                {/* İbrahim */}
                <button
                  onClick={() => handleProfileClick("ben")}
                  disabled={loading}
                  className="group flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-white/5 transition-all disabled:opacity-50"
                >
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center group-hover:ring-4 ring-white transition-all">
                    <span className="text-5xl">🐻</span>
                  </div>
                  <span className="text-gray-400 group-hover:text-white transition-colors text-lg">İbrahim</span>
                </button>

                {/* Selinay */}
                <button
                  onClick={() => handleProfileClick("sen")}
                  disabled={loading}
                  className="group flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-white/5 transition-all disabled:opacity-50"
                >
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:ring-4 ring-white transition-all">
                    <span className="text-5xl">🦄</span>
                  </div>
                  <span className="text-gray-400 group-hover:text-white transition-colors text-lg">Selinay</span>
                </button>
              </div>
            ) : (
              /* Password Entry */
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${selectedUser === "ben" ? "bg-gradient-to-br from-amber-500 to-orange-600" : "bg-gradient-to-br from-purple-500 to-pink-500"}`}>
                    <span className="text-3xl">
                      {selectedUser === "ben" ? "🐻" : "🦄"}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-lg">{selectedUser === "ben" ? "İbrahim" : "Selinay"}</p>
                    <p className="text-gray-400 text-sm">Şifre gir</p>
                  </div>
                </div>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="Şifre"
                  autoFocus
                  className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600"
                />

                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded font-medium transition-colors"
                  >
                    Geri
                  </button>
                  <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded font-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? "Giriş yapılıyor..." : "Giriş"}
                  </button>
                </div>
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
