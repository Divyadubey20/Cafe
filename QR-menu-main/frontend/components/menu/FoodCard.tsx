"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Star, Plus, Minus } from "lucide-react";
import { MenuItem } from "@/types";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface FoodCardProps {
  item: MenuItem;
}

export default function FoodCard({ item }: FoodCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const table = searchParams.get("table") || "12";
  const { items, addToCart, updateQuantity } = useCart();

  // Find if this item is in the cart
  const cartItem = items.find((i) => i.menuItem.id === item.id);
  const quantity = cartItem?.quantity || 0;

  const { updateInstruction } = useCart();
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState("");

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if they didn't click the ADD buttons
    const target = e.target as HTMLElement;
    if (target.closest(".action-btn")) return;
    router.push(`/dish/${item.id}?table=${table}`);
  };

  const handleAdd = () => {
    addToCart(item, 1, note);
  };

  const handleIncrease = () => {
    updateQuantity(item.id, quantity + 1);
  };

  const handleDecrease = () => {
    updateQuantity(item.id, quantity - 1);
  };

  const [imageSrc, setImageSrc] = useState(item.image || "/images/logo.png");

  const onImgError = () => setImageSrc("/images/logo.png");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={handleCardClick}
      className="flex justify-between items-start gap-4 border border-[#F0E6DC]/60 bg-white p-4 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all duration-300"
    >
      {/* Left side: Information */}
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          {/* Veg Indicator */}
          <span className="flex items-center justify-center h-4.5 w-4.5 border-2 border-emerald-500 rounded p-0.5 bg-white">
            <span className={cn("h-2 w-2 rounded-full", item.isVeg ? "bg-emerald-500" : "bg-red-500")} />
          </span>

          {/* Badges */}
          {item.isBestSeller && (
            <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-amber-700">
              Best Seller
            </span>
          )}
          {item.isChefSpecial && (
            <span className="rounded bg-orange-50 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-orange-700">
              Chef Special
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="text-base font-extrabold text-[#2D1810] tracking-tight line-clamp-1">
          {item.name}
        </h4>

        {/* Rating and Prep Time */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#6B4F3A]">
          <span className="flex items-center gap-0.5 text-[#E8981A]">
            <Star className="h-3.5 w-3.5 fill-current" />
            {item.rating}
          </span>
          <span className="h-1 w-1 rounded-full bg-[#9B8577]" />
          <span>{item.prepTime}</span>
        </div>

        {/* Price */}
        <span className="text-base font-extrabold text-[#7A3F15]">
          {formatPrice(item.price)}
        </span>

        {/* Description */}
        <p className="text-xs text-[#9B8577] font-medium leading-relaxed line-clamp-2">
          {item.description}
        </p>
      </div>

      {/* Middle: Image thumbnail */}
      <div className="shrink-0 w-24 h-20 rounded-md overflow-hidden bg-[#F8F5F2] flex items-center justify-center">
        <Image src={imageSrc} alt={item.name} width={160} height={120} className="object-cover" onError={onImgError} />
      </div>

      {/* Right side: Action Button */}
      <div className="relative flex flex-col items-center justify-center shrink-0 w-24 self-center">
        {/* ADD Button or Quantity Selector */}
        <div className="action-btn w-full">
          {quantity > 0 ? (
            <div className="flex items-center justify-between rounded-xl bg-[#FFF5EB] border border-[#E8981A] px-2 py-1.5 text-center font-bold text-[#D4880F] shadow-sm transition-all">
              <button 
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleDecrease(); }} 
                className="hover:text-[#7A3F15] active:scale-90 p-0.5"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="text-sm font-extrabold">{quantity}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleIncrease(); }} 
                className="hover:text-[#7A3F15] active:scale-90 p-0.5"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleAdd(); }}
              className="flex w-full items-center justify-center gap-1 rounded-xl bg-[#E8981A] py-1.5 px-3 font-bold text-white shadow-md transition-all hover:bg-[#D4880F] active:scale-[0.96]"
            >
              <Plus className="h-3.5 w-3.5" />
              ADD
            </button>
          )}
        </div>
          {/* Notes toggle when item is in cart */}
          {quantity > 0 && (
            <div className="mt-2 w-full">
              <button
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); setShowNote((s) => !s); setNote(cartItem?.specialInstruction || ""); }}
                className="w-full text-xs text-[#6B4F3A] underline"
              >
                {showNote ? "Hide note" : "Add note"}
              </button>
              {showNote && (
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onBlur={() => updateInstruction(item.id, note)}
                  placeholder="Add special instructions..."
                  rows={2}
                  className="mt-1 w-full rounded-md border border-[#F0E6DC] p-2 text-xs"
                />
              )}
            </div>
          )}
      </div>
    </motion.div>
  );
}
