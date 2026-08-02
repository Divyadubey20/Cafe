"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  name: string;
  slug: string;
  image: string;
  isActive?: boolean;
}

export default function CategoryCard({ name, slug, image, isActive = false }: CategoryCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const table = searchParams.get("table") || "12";

  const handleClick = () => {
    router.push(`/menu/${slug}?table=${table}`);
  };

  // Generate a fallback warm color background based on category slug
  const getFallbackBg = (slugStr: string) => {
    const colors = [
      "bg-amber-100 text-amber-800",
      "bg-orange-100 text-orange-800",
      "bg-yellow-100 text-yellow-800",
      "bg-emerald-100 text-emerald-800",
      "bg-red-100 text-red-800"
    ];
    let hash = 0;
    for (let i = 0; i < slugStr.length; i++) {
      hash = slugStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <button
      onClick={handleClick}
      className="flex flex-col items-center gap-2 cursor-pointer transition-transform active:scale-[0.96]"
    >
      {/* Circle Icon Container */}
      <div
        className={cn(
          "relative flex h-16 w-16 items-center justify-center rounded-full border shadow-sm transition-all duration-300",
          isActive 
            ? "border-[#D4880F] bg-white ring-2 ring-[#D4880F]/20 scale-105" 
            : "border-[#F0E6DC] bg-white hover:border-[#9B8577]/50"
        )}
      >
        <div className={cn("relative h-14 w-14 overflow-hidden rounded-full", getFallbackBg(slug))}>
          {/* Fallback avatar text: First letter */}
          <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">
            {name.charAt(0)}
          </div>
          {/* Render category image */}
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-opacity duration-300 opacity-0"
            onLoad={(e) => {
              (e.target as HTMLElement).classList.remove("opacity-0");
            }}
            onError={(e) => {
              // Leave it to fallback text
            }}
          />
        </div>
      </div>

      {/* Name Label */}
      <span
        className={cn(
          "text-xs font-bold tracking-wide",
          isActive ? "text-[#D4880F]" : "text-[#6B4F3A]"
        )}
      >
        {name}
      </span>
    </button>
  );
}
