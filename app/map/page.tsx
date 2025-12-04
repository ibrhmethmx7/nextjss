"use client";

import dynamic from "next/dynamic";

const LoveMap = dynamic(() => import("@/components/map/LoveMap"), { ssr: false });

export default function MapPage() {
    return <LoveMap />;
}
