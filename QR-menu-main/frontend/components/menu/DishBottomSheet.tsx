"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, Star, Clock, Flame, Users, Plus, Minus, Check } from "lucide-react";
import type { MenuItem } from "@/types";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface DishBottomSheetProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DishBottomSheet({ item, isOpen, onClose }: DishBottomSheetProps) {
  const { items, addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [instruction, setInstruction] = useState("");
  const [added, setAdded] = useState(false);
  const [imageSrc, setImageSrc] = useState(item?.image || "/images/logo.png");
  const onImgError = () => setImageSrc("/images/logo.png");

  // Sync state when details item changes or sheet opens
  useEffect(() => {
    if (item && isOpen) {
      const existing = items.find((i) => i.menuItem.id === item.id);
      if (existing) {
        setQty(existing.quantity);
        setInstruction(existing.specialInstruction);
      } else {
        setQty(1);
        setInstruction("");
      }
      setAdded(false);
    }
  }, [item, isOpen, items]);

  if (!item) return null;

  const handleIncrease = () => setQty((prev) => prev + 1);
  const handleDecrease = () => setQty((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAdd = () => {
    addToCart(item, qty, instruction);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Bottom Sheet drawer panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex max-h-[85vh] max-w-md flex-col rounded-t-3xl border-t border-[#F0E6DC]/60 bg-[#FFF8F0] shadow-2xl overflow-hidden"
          >
            {/* Grab Handle */}
            <div className="mx-auto my-3 h-1.5 w-12 shrink-0 rounded-full bg-neutral-300" />

            {/* Scrollable Container */}
            <div className="flex-1 overflow-y-auto px-6 pb-28 no-scrollbar">
              {/* Close Button & Title Area (Image-less Layout) */}
              <div className="flex justify-between items-center mt-2 mb-3">
                <span className="text-[10px] font-bold text-[#E8981A] uppercase tracking-wider bg-[#FFF5EB] px-2.5 py-0.5 rounded-lg border border-[#E8981A]/20">
                  Dish Details
                </span>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[#2D1810] shadow-sm hover:bg-slate-200 active:scale-90"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Item Details block */}
              <div className="mt-4 rounded-2xl bg-white p-5 border border-[#F0E6DC]/40 shadow-sm">
                <div className="mb-3 w-full h-36 overflow-hidden rounded-md bg-[#F8F5F2] flex items-center justify-center">
                  <Image src={imageSrc} alt={item.name} width={600} height={240} className="object-cover" onError={onImgError} />
                </div>
                <div className="flex justify-between items-start gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center justify-center h-4 w-4 border border-emerald-500 rounded-sm p-0.5 bg-white w-fit">
                      <span className={cn("h-1.5 w-1.5 rounded-full", item.isVeg ? "bg-emerald-500" : "bg-red-500")} />
                    </span>
                    <h3 className="font-serif text-xl font-extrabold text-[#2D1810] tracking-tight leading-tight">
                      {item.name}
                    </h3>
                  </div>
                  <span className="text-xl font-extrabold text-[#7A3F15] shrink-0 mt-4">
                    {formatPrice(item.price)}
                  </span>
                </div>

                <div className="mt-2.5 flex items-center gap-2 text-xs font-semibold text-[#6B4F3A]">
                  <span className="flex items-center gap-0.5 text-[#E8981A]">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    {item.rating}
                  </span>
                  <span className="text-[#9B8577]">({item.reviewCount})</span>
                  <span className="h-1 w-1 rounded-full bg-[#9B8577]" />
                  <span className="flex items-center gap-1 text-[#D4880F]">
                    <Clock className="h-3.5 w-3.5" />
                    {item.prepTime}
                  </span>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-[#6B4F3A]">
                  {item.description}
                </p>
              </div>

              {/* Badges Grid (Spice level + Portion serves) */}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center justify-center rounded-xl border border-[#F0E6DC]/50 bg-white/70 p-2.5 shadow-sm text-center">
                  <Flame className="h-4 w-4 text-[#E53E3E]" />
                  <span className="text-[9px] font-bold text-[#9B8577] uppercase tracking-wider mt-0.5">Spice Level</span>
                  <span className="text-xs font-extrabold text-[#2D1810]">{item.spiceLevel}</span>
                </div>
                <div className="flex flex-col items-center justify-center rounded-xl border border-[#F0E6DC]/50 bg-white/70 p-2.5 shadow-sm text-center">
                  <Users className="h-4 w-4 text-[#D4880F]" />
                  <span className="text-[9px] font-bold text-[#9B8577] uppercase tracking-wider mt-0.5">Portion</span>
                  <span className="text-xs font-extrabold text-[#2D1810]">Serves {item.servesCount}</span>
                </div>
              </div>

              {/* Key Ingredients */}
              {item.ingredients && item.ingredients.length > 0 && (
                <div className="mt-4 rounded-xl border border-[#F0E6DC]/50 bg-white/40 p-3.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#6B4F3A] mb-2.5">Key Ingredients</h4>
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {item.ingredients.map((ing, idx) => (
                      <span
                        key={idx}
                        className="shrink-0 rounded-full border border-[#F0E6DC] bg-white py-0.5 px-2.5 text-[9px] font-bold text-[#6B4F3A]"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Instructions */}
              <div className="mt-4 rounded-xl border border-[#F0E6DC]/50 bg-white/60 p-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#6B4F3A] mb-2.5">Special Instructions</h4>
                <textarea
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  placeholder="E.g., Make it extra spicy, less butter, no onions..."
                  rows={2}
                  className="w-full rounded-lg border border-[#F0E6DC] bg-white/80 p-2.5 text-xs font-medium text-[#2D1810] placeholder-[#9B8577] outline-none focus:border-[#D4880F] transition-colors resize-none"
                />
              </div>
            </div>

            {/* Bottom Action Footer Drawer */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-[#F0E6DC] bg-white py-3.5 px-6 shadow-2xl flex items-center justify-between gap-4">
              {/* Quantity Selector */}
              <div className="flex items-center justify-between rounded-full bg-[#FFF5EB] border border-[#F0E6DC] px-3.5 py-2 text-center font-bold text-[#D4880F] w-24">
                <button onClick={handleDecrease} className="text-[#9B8577] hover:text-[#7A3F15] p-0.5 active:scale-75">
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="text-sm font-extrabold text-[#2D1810]">{qty}</span>
                <button onClick={handleIncrease} className="text-[#9B8577] hover:text-[#7A3F15] p-0.5 active:scale-75">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Add/Update Button */}
              <button
                onClick={handleAdd}
                disabled={added}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 rounded-2xl py-3 px-4 font-bold text-white shadow-md transition-all active:scale-[0.98]",
                  added ? "bg-emerald-500 shadow-emerald-500/10" : "bg-[#E8981A] hover:bg-[#D4880F] shadow-[#E8981A]/20"
                )}
              >
                {added ? (
                  <>
                    <Check className="h-4.5 w-4.5" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    Add to Cart • {formatPrice(item.price * qty)}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
