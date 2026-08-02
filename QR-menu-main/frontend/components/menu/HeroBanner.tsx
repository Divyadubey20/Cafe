"use client";

import { useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";

export default function HeroBanner() {
  const searchParams = useSearchParams();
  const table = searchParams.get("table") || "12";

  return (
    <div className="px-6 py-3">
      <div className="rounded-3xl bg-gradient-to-r from-[#D4880F] to-[#E8981A] p-6 text-white shadow-md shadow-[#D4880F]/20 relative overflow-hidden">
        {/* Subtle decorative circle */}
        <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-white/10" />
        
        <div className="flex flex-col gap-1 relative z-10">
          <div className="flex items-center gap-1.5 rounded-full bg-white/15 py-0.5 px-3.5 text-[10px] font-bold tracking-wider uppercase w-fit">
            <Sparkles className="h-3 w-3 text-yellow-300 fill-current" />
            Table {table}
          </div>
          <h2 className="mt-2 font-serif text-xl font-bold tracking-tight">
            Order directly from your table
          </h2>
          <p className="text-xs text-white/80 font-medium">
            Browse our fresh categories, tap to add items, and customize instructions.
          </p>
        </div>
      </div>
    </div>
  );
}
