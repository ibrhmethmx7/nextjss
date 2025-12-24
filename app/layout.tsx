import type { Metadata } from "next";
import { Inter, Great_Vibes } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import AuroraBackground from "@/components/ui/AuroraBackground";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-great-vibes",
});

export const metadata: Metadata = {
  title: "Our Memories",
  description: "A special place for us.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(
          "min-h-screen bg-background font-sans antialiased selection:bg-primary/30 selection:text-primary-foreground",
          inter.variable,
          greatVibes.variable
        )}
      >
        <AuroraBackground />
        <main className="relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
