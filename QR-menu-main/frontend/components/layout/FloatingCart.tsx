"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";

export default function FloatingCart() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const table = searchParams.get("table") || "12";
  const { getItemCount, getTotal, items } = useCart();

  const count = getItemCount();
  const total = getTotal(5); // Calculate total including 5% GST and ₹40 delivery fee

  const handleCheckout = () => {
    router.push(`/cart?table=${table}`);
  };

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-20 left-4 right-4 z-30 max-w-md mx-auto"
        >
          <div className="flex items-center justify-between rounded-2xl bg-[#7A3F15] p-4 text-white shadow-xl shadow-[#7A3F15]/25">
            {/* Cart Info */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <ShoppingCart className="h-5 w-5 text-[#E8981A]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                  {count} {count === 1 ? "Item" : "Items"}
                </span>
                <span className="text-lg font-extrabold tracking-tight">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleCheckout}
              className="flex items-center gap-1.5 rounded-xl bg-white py-2.5 px-4 font-bold text-[#7A3F15] transition-all hover:bg-neutral-100 active:scale-[0.98]"
            >
              View Cart
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
