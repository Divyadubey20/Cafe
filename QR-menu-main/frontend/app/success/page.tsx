"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Clock, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { getOrder } from "@/lib/api";
import type { Order } from "@/types";
import { cn } from "@/lib/utils";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const table = searchParams.get("table") || "12";
  const orderNum = searchParams.get("order") || "1";
  const prepTime = searchParams.get("prep") || "25";
  const payMethod = searchParams.get("payMethod") || "Pay at Counter";

  const [showDetails, setShowDetails] = useState(false);
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleContinue = () => {
    router.push(`/home?table=${table}`);
  };

  const handleToggleDetails = async () => {
    if (showDetails) {
      setShowDetails(false);
      return;
    }
    
    setShowDetails(true);
    if (!orderDetails) {
      setLoadingDetails(true);
      try {
        const orderId = parseInt(orderNum, 10);
        if (!isNaN(orderId)) {
          const data = await getOrder(orderId);
          setOrderDetails(data);
        }
      } catch (err) {
        console.error("Failed to load order details:", err);
      } finally {
        setLoadingDetails(false);
      }
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#FFF8F0] px-6 text-center">
      {/* Outer Card Wrapper */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm rounded-3xl border border-[#F0E6DC]/40 bg-white p-8 shadow-lg"
      >
        {/* Animated Checkmark Circle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 border-4 border-emerald-100 text-emerald-500 shadow-md mb-6"
        >
          <Check className="h-10 w-10 stroke-[3px]" />
        </motion.div>

        {/* Title */}
        <h2 className="font-serif text-3xl font-bold tracking-tight text-[#2D1810]">
          Order Placed Successfully!
        </h2>

        {/* Message */}
        <p className="mt-3 text-xs font-semibold text-[#6B4F3A] leading-relaxed max-w-[240px] mx-auto">
          Thank you for your order. We're getting it ready in the kitchen.
        </p>

        {/* Info Grid Card (Order number + Prep time + Payment Method) */}
        <div className="mt-8 rounded-2xl bg-[#FFF5EB] border border-[#F0E6DC]/50 p-5 text-left flex flex-col gap-3">
          {/* Order Num row */}
          <div className="flex items-center justify-between border-b border-[#F0E6DC]/40 pb-3">
            <span className="text-[10px] font-bold text-[#9B8577] uppercase tracking-wider">Order ID</span>
            <span className="text-sm font-extrabold text-[#2D1810]">#SK-{orderNum}</span>
          </div>

          {/* Payment Method row */}
          <div className="flex items-center justify-between border-b border-[#F0E6DC]/40 pb-3">
            <span className="text-[10px] font-bold text-[#9B8577] uppercase tracking-wider">Payment Status</span>
            <span className={cn(
              "text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg border uppercase tracking-wider",
              payMethod === "Pay at Counter"
                ? "bg-slate-100 border-slate-300 text-slate-600"
                : "bg-emerald-50 border-emerald-300 text-emerald-600"
            )}>
              {payMethod === "Pay at Counter" ? "Counter (Unpaid)" : `Paid via ${payMethod}`}
            </span>
          </div>

          {/* Prep Time row */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#9B8577] uppercase tracking-wider">Prep Time</span>
            <span className="text-sm font-extrabold text-emerald-600 flex items-center gap-1">
              <Clock className="h-4 w-4 text-emerald-500" />
              {prepTime} mins
            </span>
          </div>
        </div>

        {/* Show items details section */}
        {showDetails && (
          <div className="mt-4 border-t border-[#F0E6DC]/40 pt-4 text-left">
            <h4 className="text-xs font-bold text-[#2D1810] uppercase tracking-wider mb-2">Order Items</h4>
            {loadingDetails ? (
              <div className="flex justify-center py-4">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#D4880F]/20 border-t-[#D4880F]" />
              </div>
            ) : orderDetails ? (
              <div className="flex flex-col gap-2 max-h-40 overflow-y-auto no-scrollbar">
                {orderDetails.items.map((item) => (
                  <div key={item.id} className="text-xs">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5 text-[#2D1810] font-semibold">
                        <span className="text-[#E8981A] font-bold">x{item.quantity}</span>
                        <span>{item.menuItemName}</span>
                      </div>
                      <span className="font-bold text-[#6B4F3A]">₹{item.price * item.quantity}</span>
                    </div>
                    {item.specialInstruction && item.specialInstruction.trim().length > 0 && (
                      <div className="mt-1 text-[11px] text-[#6B4F3A]">
                        <span className="font-bold text-[10px] text-[#9B8577] mr-2 uppercase">Note:</span>
                        <span className="italic">{item.specialInstruction}</span>
                      </div>
                    )}
                  </div>
                ))}
                {/* Total amount summary inside details */}
                <div className="flex justify-between items-center text-xs font-extrabold border-t border-[#F0E6DC]/20 pt-2 mt-1">
                  <span>Grand Total</span>
                  <span className="text-[#2D1810]">₹{orderDetails.totalAmount}</span>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-red-500 font-bold">Failed to load items</p>
            )}
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E8981A] py-4 text-center font-bold text-white shadow-lg shadow-[#E8981A]/35 transition-all hover:bg-[#D4880F] active:scale-[0.98]"
        >
          <ShoppingBag className="h-5 w-5" />
          Continue Browsing
        </button>

        {/* Order Details Link */}
        <button
          onClick={handleToggleDetails}
          className="mt-4 text-xs font-bold text-[#6B4F3A] hover:text-[#D4880F] flex items-center justify-center gap-0.5 w-full active:scale-95"
        >
          {showDetails ? "Hide Order Details" : "View Order Details"} <span className="text-lg">→</span>
        </button>
      </motion.div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#FFF8F0]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#D4880F]/20 border-t-[#D4880F]" />
      </div>
    }>
      <WelcomeContentLoader />
    </Suspense>
  );
}

// Rename helper so Suspense works perfectly
function WelcomeContentLoader() {
  return <SuccessContent />;
}
