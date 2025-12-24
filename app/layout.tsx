import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SELOFLIX",
  description: "Netflix tarzı kişisel sinema uygulaması",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        {/* Google Material Icons */}
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined|Material+Icons+Round"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className={cn(
          "min-h-screen bg-[#141414] font-sans antialiased text-white",
          inter.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}
