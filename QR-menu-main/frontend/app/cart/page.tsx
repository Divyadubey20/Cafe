"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import { placeOrder } from "@/lib/api";
import Navbar from "@/components/layout/Navbar";
import PaymentBottomSheet from "@/components/menu/PaymentBottomSheet";
import { Plus, Minus, ArrowRight, Trash2, ShoppingBag, PlusCircle } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

function CartContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const table = searchParams.get("table") || "12";

  const {
    items,
    updateQuantity,
    updateInstruction,
    removeFromCart,
    getSubtotal,
    getGST,
    getTotal,
    clearCart,
    getItemCount
  } = useCart();

  const [loadingCheckout, setLoadingCheckout] = useState(false);

  const subtotal = getSubtotal();
  const gst = getGST(5); // 5% GST
  const grandTotal = getTotal(5);
  const itemCount = getItemCount();

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const handleCheckout = () => {
    if (items.length === 0) return;
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = async (method: string) => {
    setIsPaymentOpen(false);
    setLoadingCheckout(true);
    
    try {
      // Parse table number as integer
      const tableNum = parseInt(table, 10);
      
      // Submit order to API
      const order = await placeOrder(tableNum, items);
      
      // Clear client cart state
      clearCart();
      
      // Redirect to order success page, passing the actual prep time
      router.push(`/success?table=${table}&order=${order.id}&prep=${encodeURIComponent(order.prepTime)}&payMethod=${encodeURIComponent(method)}`);
    } catch (e: any) {
      alert(e.message || "Failed to place order. Please try again.");
    } finally {
      setLoadingCheckout(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] pb-36">
      {/* Top Navbar */}
      <Navbar />

      <div className="px-6 py-4">
        <h2 className="font-serif text-2xl font-extrabold text-[#2D1810] tracking-tight mb-4">
          Your Cart
        </h2>

        {items.length === 0 ? (
          /* Empty Cart State */
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-[#F0E6DC]/40 bg-white p-8 shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF5EB] text-[#D4880F] mb-4">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <h4 className="text-lg font-extrabold text-[#2D1810]">Your cart is empty</h4>
            <p className="mt-1 text-xs text-[#9B8577] max-w-[200px] mb-6">
              Add some delicious items from our menu to place an order.
            </p>
            <button
              onClick={() => router.push(`/home?table=${table}`)}
              className="rounded-xl bg-[#E8981A] px-6 py-3 font-bold text-white shadow-md hover:bg-[#D4880F]"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          /* Cart Items List */
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div
                  key={item.menuItem.id}
                  className="flex items-center gap-4 rounded-2xl border border-[#F0E6DC]/40 bg-white p-4 shadow-sm"
                >


                  {/* Thumbnail */}
                  <div className="shrink-0 w-20 h-16 rounded-md overflow-hidden bg-[#F8F5F2]">
                    <Image
                      src={item.menuItem.image || "/images/logo.png"}
                      alt={item.menuItem.name}
                      width={160}
                      height={120}
                      className="object-cover"
                      onError={(e: any) => { e.currentTarget.src = "/images/logo.png"; }}
                    />
                  </div>

                  {/* Dish Details */}
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="flex items-center justify-center h-3.5 w-3.5 border border-emerald-500 rounded-sm p-0.5 bg-white">
                        <span className={cn("h-1.5 w-1.5 rounded-full", item.menuItem.isVeg ? "bg-emerald-500" : "bg-red-500")} />
                      </span>
                      <h4 className="text-sm font-extrabold text-[#2D1810] tracking-tight line-clamp-1">
                        {item.menuItem.name}
                      </h4>
                    </div>
                    {item.specialInstruction && (
                      <p className="text-[10px] italic text-[#9B8577] line-clamp-1 font-medium">
                        "{item.specialInstruction}"
                      </p>
                    )}
                    <span className="text-sm font-extrabold text-[#7A3F15]">
                      {formatPrice(item.menuItem.price * item.quantity)}
                    </span>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 rounded-full bg-[#FFF5EB] border border-[#F0E6DC]/60 px-3 py-1.5 text-center font-bold text-[#D4880F]">
                    <button
                      onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                      className="text-[#9B8577] hover:text-[#7A3F15] p-0.5 active:scale-75"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-xs font-extrabold text-[#2D1810]">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                      className="text-[#9B8577] hover:text-[#7A3F15] p-0.5 active:scale-75"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {/* Special instruction input per item */}
                  <div className="mt-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#9B8577] mb-1 block">Special instructions</label>
                    <textarea
                      value={item.specialInstruction}
                      onChange={(e) => updateInstruction(item.menuItem.id, e.target.value)}
                      placeholder="e.g., Less spicy, no onions, extra cheese..."
                      rows={2}
                      className="w-full rounded-md border border-[#F0E6DC] p-2 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Add More Items Button */}
            <button
              onClick={() => router.push(`/home?table=${table}`)}
              className="flex items-center gap-1.5 text-sm font-extrabold text-[#D4880F] mt-2 w-fit active:scale-95 transition-all hover:text-[#E8981A]"
            >
              <PlusCircle className="h-5 w-5" />
              Add more items
            </button>

            {/* Bill Details Summary Card */}
            <div className="mt-4 rounded-2xl border border-[#F0E6DC]/40 bg-white p-5 shadow-sm">
              <h3 className="font-serif text-lg font-extrabold text-[#2D1810] border-b border-[#F0E6DC] pb-3 mb-4">
                Bill Details
              </h3>
              
              <div className="flex flex-col gap-3 text-xs font-semibold text-[#6B4F3A]">
                <div className="flex justify-between">
                  <span className="text-[#9B8577]">Item Total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#9B8577]">GST (5%)</span>
                  <span>{formatPrice(gst)}</span>
                </div>
                
                <div className="flex justify-between border-t border-[#F0E6DC]/60 pt-4 mt-1 text-sm font-extrabold text-[#2D1810]">
                  <span>To Pay</span>
                  <span className="text-base text-[#7A3F15]">{formatPrice(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Actions / Checkout drawer */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#F0E6DC] bg-white py-4 px-6 shadow-2xl flex items-center justify-between gap-6 max-w-md mx-auto rounded-t-3xl">
          {/* Checkout pricing sum summary */}
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B8577]">
              {itemCount} {itemCount === 1 ? "Item" : "Items"}
            </span>
            <span className="text-xl font-extrabold text-[#7A3F15] tracking-tight">
              {formatPrice(grandTotal)}
            </span>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={loadingCheckout}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#7A3F15] py-4 font-bold text-white shadow-lg shadow-[#7A3F15]/20 hover:bg-[#5E2F0F] active:scale-[0.98] transition-all disabled:opacity-85"
          >
            {loadingCheckout ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            ) : (
              <>
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Mock Payment Gateway Bottom Sheet */}
      <PaymentBottomSheet
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        totalAmount={grandTotal}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#FFF8F0]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#D4880F]/20 border-t-[#D4880F]" />
      </div>
    }>
      <CartContent />
    </Suspense>
  );
}
