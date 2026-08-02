"use client";

import Link from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { UtensilsCrossed, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

export default function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const table = searchParams.get("table") || "12";
  const { getItemCount } = useCart();
  
  const itemCount = getItemCount();

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[#F0E6DC] bg-white px-6 shadow-sm">
      {/* Table grid button */}
      <button 
        onClick={() => router.push(`/welcome?table=${table}`)}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF5EB] text-[#D4880F] transition-colors active:bg-[#F0E6DC]"
      >
        <UtensilsCrossed className="h-5 w-5" />
      </button>

      {/* Restaurant Title */}
      <h1 className="font-serif text-xl font-bold tracking-tight text-[#2D1810]">
        Cafe
      </h1>

      {/* Cart Icon Link */}
      <button 
        onClick={() => router.push(`/cart?table=${table}`)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF5EB] text-[#2D1810] transition-colors active:bg-[#F0E6DC]"
      >
        <ShoppingBag className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#E8981A] text-[10px] font-bold text-white shadow-md">
            {itemCount}
          </span>
        )}
      </button>
    </header>
  );
}
