"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Lock, Smartphone, Landmark, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface PaymentBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onPaymentSuccess: (paymentMethod: string) => void;
}

type PaymentMethod = "upi" | "card" | "counter";

export default function PaymentBottomSheet({
  isOpen,
  onClose,
  totalAmount,
  onPaymentSuccess
}: PaymentBottomSheetProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("upi");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Card Form State
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");

  // UPI State
  const [selectedUpiApp, setSelectedUpiApp] = useState("gpay");

  const handlePay = () => {
    setProcessing(true);

    // Simulate payment gateway delay (2 seconds)
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);

      // Simulate a small transition after success check
      setTimeout(() => {
        setSuccess(false);
        onPaymentSuccess(
          selectedMethod === "upi"
            ? `UPI (${selectedUpiApp.toUpperCase()})`
            : selectedMethod === "card"
            ? "Credit Card"
            : "Pay at Counter"
        );
      }, 1000);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={processing ? undefined : onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Payment sheet container */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex max-h-[90vh] max-w-md flex-col rounded-t-3xl border-t border-[#F0E6DC]/60 bg-[#FFF8F0] shadow-2xl overflow-hidden"
          >
            {/* Grab Handle */}
            <div className="mx-auto my-3 h-1.5 w-12 shrink-0 rounded-full bg-neutral-300" />

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-28 no-scrollbar">
              
              {/* Processing Screen Overlay */}
              {processing && (
                <div className="absolute inset-0 bg-[#FFF8F0]/95 z-30 flex flex-col items-center justify-center text-center p-6">
                  <Loader2 className="h-12 w-12 animate-spin text-[#E8981A] mb-4" />
                  <h3 className="font-serif text-xl font-bold text-[#2D1810]">Processing Payment</h3>
                  <p className="text-xs font-semibold text-[#6B4F3A] mt-1 max-w-[200px] leading-relaxed">
                    Connecting to mock payment gateway... Please do not close or refresh.
                  </p>
                </div>
              )}

              {/* Success Screen Overlay */}
              {success && (
                <div className="absolute inset-0 bg-[#FFF8F0] z-30 flex flex-col items-center justify-center text-center p-6">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="h-16 w-16 bg-emerald-50 border-4 border-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mb-4 shadow-sm"
                  >
                    <CheckCircle2 className="h-10 w-10 stroke-[3px]" />
                  </motion.div>
                  <h3 className="font-serif text-xl font-bold text-[#2D1810]">Payment Authorized</h3>
                  <p className="text-xs font-semibold text-emerald-600 mt-1">
                    Order is being generated...
                  </p>
                </div>
              )}

              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#F0E6DC]/40">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#2D1810]">Payment Gateway</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cafe Checkout</p>
                </div>
                <button
                  onClick={onClose}
                  disabled={processing}
                  className="rounded-full bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200 active:scale-95 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Grand Total Bar */}
              <div className="my-5 rounded-2xl bg-[#FFF5EB] border border-[#F0E6DC]/60 p-4 flex justify-between items-center">
                <span className="text-xs font-extrabold text-[#6B4F3A]">Amount to Pay</span>
                <span className="text-lg font-black text-[#2D1810]">{formatPrice(totalAmount)}</span>
              </div>

              {/* Payment Methods Options */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Payment Method</span>
                
                {/* Method Option: UPI */}
                <button
                  onClick={() => setSelectedMethod("upi")}
                  className={`rounded-xl border p-3 flex items-center justify-between transition-all ${
                    selectedMethod === "upi"
                      ? "border-[#D4880F] bg-white ring-1 ring-[#D4880F]/20"
                      : "border-[#F0E6DC]/50 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${selectedMethod === "upi" ? "bg-[#FFF5EB] text-[#D4880F]" : "bg-slate-50 text-slate-500"}`}>
                      <Smartphone className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-extrabold text-[#2D1810] block">UPI / Instant Pay</span>
                      <span className="text-[10px] font-bold text-slate-400">Google Pay, PhonePe, Paytm</span>
                    </div>
                  </div>
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${selectedMethod === "upi" ? "border-[#D4880F]" : "border-slate-300"}`}>
                    {selectedMethod === "upi" && <span className="h-2 w-2 rounded-full bg-[#D4880F]" />}
                  </div>
                </button>

                {/* Method Option: Card */}
                <button
                  onClick={() => setSelectedMethod("card")}
                  className={`rounded-xl border p-3 flex items-center justify-between transition-all ${
                    selectedMethod === "card"
                      ? "border-[#D4880F] bg-white ring-1 ring-[#D4880F]/20"
                      : "border-[#F0E6DC]/50 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${selectedMethod === "card" ? "bg-[#FFF5EB] text-[#D4880F]" : "bg-slate-50 text-slate-500"}`}>
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-extrabold text-[#2D1810] block">Credit / Debit Card</span>
                      <span className="text-[10px] font-bold text-slate-400">Visa, MasterCard, RuPay</span>
                    </div>
                  </div>
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${selectedMethod === "card" ? "border-[#D4880F]" : "border-slate-300"}`}>
                    {selectedMethod === "card" && <span className="h-2 w-2 rounded-full bg-[#D4880F]" />}
                  </div>
                </button>

                {/* Method Option: Pay at Counter */}
                <button
                  onClick={() => setSelectedMethod("counter")}
                  className={`rounded-xl border p-3 flex items-center justify-between transition-all ${
                    selectedMethod === "counter"
                      ? "border-[#D4880F] bg-white ring-1 ring-[#D4880F]/20"
                      : "border-[#F0E6DC]/50 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${selectedMethod === "counter" ? "bg-[#FFF5EB] text-[#D4880F]" : "bg-slate-50 text-slate-500"}`}>
                      <Landmark className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-extrabold text-[#2D1810] block">Pay at Counter</span>
                      <span className="text-[10px] font-bold text-slate-400">Cash/Card after your meal</span>
                    </div>
                  </div>
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${selectedMethod === "counter" ? "border-[#D4880F]" : "border-slate-300"}`}>
                    {selectedMethod === "counter" && <span className="h-2 w-2 rounded-full bg-[#D4880F]" />}
                  </div>
                </button>
              </div>

              {/* Dynamic Sub-form rendering */}
              <div className="mt-5 pt-4 border-t border-[#F0E6DC]/40">
                {selectedMethod === "upi" && (
                  <div className="flex flex-col gap-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select UPI App</span>
                    <div className="grid grid-cols-3 gap-2">
                      {/* GPay */}
                      <button
                        type="button"
                        onClick={() => setSelectedUpiApp("gpay")}
                        className={`rounded-xl border py-2 px-3 text-xs font-bold transition-all ${
                          selectedUpiApp === "gpay"
                            ? "border-[#D4880F] bg-[#FFF5EB] text-[#D4880F]"
                            : "border-slate-100 bg-white text-slate-600"
                        }`}
                      >
                        Google Pay
                      </button>
                      {/* PhonePe */}
                      <button
                        type="button"
                        onClick={() => setSelectedUpiApp("phonepe")}
                        className={`rounded-xl border py-2 px-3 text-xs font-bold transition-all ${
                          selectedUpiApp === "phonepe"
                            ? "border-[#D4880F] bg-[#FFF5EB] text-[#D4880F]"
                            : "border-slate-100 bg-white text-slate-600"
                        }`}
                      >
                        PhonePe
                      </button>
                      {/* Paytm */}
                      <button
                        type="button"
                        onClick={() => setSelectedUpiApp("paytm")}
                        className={`rounded-xl border py-2 px-3 text-xs font-bold transition-all ${
                          selectedUpiApp === "paytm"
                            ? "border-[#D4880F] bg-[#FFF5EB] text-[#D4880F]"
                            : "border-slate-100 bg-white text-slate-600"
                        }`}
                      >
                        Paytm
                      </button>
                    </div>
                  </div>
                )}

                {selectedMethod === "card" && (
                  <div className="flex flex-col gap-3.5">
                    {/* Cardholder Name */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-extrabold text-[#6B4F3A] uppercase">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="John Doe"
                        className="rounded-xl border border-[#F0E6DC] bg-white px-3 py-2 text-xs outline-none focus:border-[#D4880F]"
                      />
                    </div>
                    {/* Card Number */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-extrabold text-[#6B4F3A] uppercase">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                        placeholder="•••• •••• •••• ••••"
                        className="rounded-xl border border-[#F0E6DC] bg-white px-3 py-2 text-xs outline-none focus:border-[#D4880F]"
                      />
                    </div>
                    {/* Expiry & CVV */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-extrabold text-[#6B4F3A] uppercase">Expiry Date</label>
                        <input
                          type="text"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value.slice(0, 5))}
                          placeholder="MM/YY"
                          className="rounded-xl border border-[#F0E6DC] bg-white px-3 py-2 text-xs outline-none focus:border-[#D4880F]"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-extrabold text-[#6B4F3A] uppercase">CVV</label>
                        <input
                          type="password"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                          placeholder="•••"
                          className="rounded-xl border border-[#F0E6DC] bg-white px-3 py-2 text-xs outline-none focus:border-[#D4880F]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedMethod === "counter" && (
                  <div className="rounded-xl border border-dashed border-[#F0E6DC] bg-white p-4 text-center">
                    <p className="text-[11px] font-semibold text-[#6B4F3A] leading-relaxed">
                      Confirm order and pay cash/card at the billing counter after you complete your meal.
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* Bottom Pay Button action bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-[#FFF8F0] border-t border-[#F0E6DC]/40 p-4 flex flex-col gap-3 z-10 shadow-lg">
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-400">
                <Lock className="h-3 w-3" />
                SECURE 256-BIT SSL ENCRYPTED TRANSACTION
              </div>
              <button
                onClick={handlePay}
                disabled={processing}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#E8981A] hover:bg-[#D4880F] py-3.5 text-center font-bold text-sm text-white shadow-lg shadow-[#E8981A]/35 transition-all active:scale-[0.98]"
              >
                Pay {formatPrice(totalAmount)}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
