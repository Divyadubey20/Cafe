"use client";

import { Percent } from "lucide-react";
import { Offer } from "@/types";

interface OfferCardProps {
  offer: Offer;
}

export default function OfferCard({ offer }: OfferCardProps) {
  return (
    <div
      style={{ backgroundColor: offer.bgColor }}
      className="flex items-center justify-between gap-4 rounded-2xl p-4 shadow-sm border border-[#F0E6DC]/40 relative overflow-hidden h-28"
    >
      {/* Left side info */}
      <div className="flex-1 flex flex-col justify-center z-10">
        <div className="flex items-center gap-1.5 rounded-full bg-black/5 py-0.5 px-2 text-[10px] font-extrabold uppercase tracking-wide text-[#7A3F15] w-fit">
          <Percent className="h-3 w-3" />
          {offer.discount}
        </div>
        <h4 className="mt-1.5 text-sm font-extrabold text-[#2D1810] tracking-tight">
          {offer.title}
        </h4>
        <p className="text-[11px] text-[#6B4F3A] font-semibold">
          {offer.description}
        </p>
      </div>

      {/* Right side illustration or placeholder */}
      <div className="relative h-20 w-20 shrink-0 opacity-80">
        <div className="absolute inset-0 bg-[#D4880F]/10 rounded-full flex items-center justify-center font-bold text-2xl text-[#D4880F]/40">
          %
        </div>
        <img
          src={offer.image}
          alt={offer.title}
          className="h-full w-full object-cover rounded-xl transition-opacity duration-300 opacity-0"
          onLoad={(e) => {
            (e.target as HTMLElement).classList.remove("opacity-0");
          }}
          onError={(e) => {
            // Keep the fallback background % sign
          }}
        />
      </div>
    </div>
  );
}
