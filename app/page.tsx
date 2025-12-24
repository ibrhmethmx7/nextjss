"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Film, Gamepad2, Map, Calendar, Music } from "lucide-react";

const features = [
  {
    icon: Film,
    title: "Sinema Odası",
    desc: "Birlikte film izleyelim",
    href: "/watch",
    color: "text-pink-400",
    delay: 0.1
  },
  {
    icon: Gamepad2,
    title: "Oyun Alanı",
    desc: "Eğlenceli mini oyunlar",
    href: "/games",
    color: "text-purple-400",
    delay: 0.2
  },
  {
    icon: Map,
    title: "Anı Haritası",
    desc: "Gezdiğimiz yerler",
    href: "/map",
    color: "text-blue-400",
    delay: 0.3
  },
  {
    icon: Calendar,
    title: "Takvim",
    desc: "Özel günlerimiz",
    href: "/calendar",
    color: "text-teal-400",
    delay: 0.4
  },
  {
    icon: Music,
    title: "Müzik Kutusu",
    desc: "Bizim şarkılarımız",
    href: "/music",
    color: "text-yellow-400",
    delay: 0.5
  },
  {
    icon: Heart,
    title: "Sürpriz",
    desc: "Sana özel bir not",
    href: "/surprise",
    color: "text-red-500",
    delay: 0.6
  }
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16 relative z-10"
      >
        <h1 className="font-romantic text-6xl md:text-8xl text-gradient mb-4 drop-shadow-lg">
          Bizim Dünyamız
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-md mx-auto font-light tracking-wide">
          Seninle geçen her an, sonsuz bir masalın en güzel sayfası...
        </p>
      </motion.div>

      {/* Grid Menu */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full z-10">
        {features.map((item, index) => (
          <Link href={item.href} key={index} className="block group">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: item.delay, duration: 0.5 }}
              className="glass glass-hover p-6 rounded-3xl h-full flex flex-col items-center text-center relative overflow-hidden"
            >
              {/* Hover Glow Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className={`p-4 rounded-2xl bg-white/5 mb-4 group-hover:scale-110 transition-transform duration-300 ${item.color}`}>
                <item.icon className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-semibold mb-2 text-white/90 group-hover:text-white transition-colors">
                {item.title}
              </h3>

              <p className="text-sm text-white/50 group-hover:text-white/70 transition-colors">
                {item.desc}
              </p>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Footer Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="mt-16 text-center z-10"
      >
        <p className="font-romantic text-2xl text-white/30">
          "Seni seviyorum, her şeyden çok..."
        </p>
      </motion.div>

    </div>
  );
}
