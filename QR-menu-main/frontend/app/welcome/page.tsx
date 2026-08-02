"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Clock, BookOpen, User, ChefHat, Lock } from "lucide-react";

function WelcomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const table = searchParams.get("table") || "12";

  const handleViewMenu = () => {
    // Navigate to home, preserving the table parameter
    router.push(`/home?table=${table}`);
  };

  const handleCallWaiter = () => {
    alert(`A waiter has been called to Table ${table}. They will be with you shortly!`);
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#FFF8F0] pb-8">
      {/* Upper Section: Hero Image */}
      <div className="relative h-[45vh] w-full overflow-hidden">
        <Image
          src="/images/hero.jpg"
          alt="Gourmet Food Spread"
          fill
          priority
          className="object-cover"
        />
        {/* Dark subtle overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Floating Logo Badge */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="absolute bottom-6 left-1/2 flex h-20 w-20 -translate-x-1/2 items-center justify-center rounded-2xl bg-white shadow-xl"
        >
          <Image 
            src="/images/logo.png" 
            alt="Cafe Logo" 
            width={60} 
            height={60}
            className="rounded-xl object-cover"
          />
        </motion.div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col items-center px-6 pt-4 text-center">
        {/* Table Number Pill */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-3 flex items-center gap-1.5 rounded-full bg-black/65 py-1 px-4 text-xs font-semibold text-white"
        >
          <span className="h-2 w-2 rounded-full bg-[#E8981A]" />
          Table {table}
        </motion.div>

        {/* Restaurant Name */}
        <motion.h2 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="font-serif text-4xl font-extrabold tracking-tight text-[#2D1810]"
        >
          Cafe
        </motion.h2>

        {/* Tagline */}
        <motion.p 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-2 text-sm font-medium text-[#6B4F3A]"
        >
          A symphony of authentic flavors.
        </motion.p>

        {/* Info Grid (Rating + Hours) */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 grid w-full grid-cols-2 gap-4 max-w-sm"
        >
          {/* Rating Card */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#F0E6DC] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-1 text-[#E8981A] font-bold text-lg">
              <Star className="h-5 w-5 fill-current" />
              4.8
            </div>
            <span className="mt-1 text-xs font-semibold text-[#9B8577]">2k+ Reviews</span>
          </div>

          {/* Opening Hours Card */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#F0E6DC] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-1 text-[#D4880F] font-bold text-lg">
              <Clock className="h-5 w-5" />
              Open
            </div>
            <span className="mt-1 text-xs font-semibold text-[#9B8577]">11 AM - 11 PM</span>
          </div>
        </motion.div>
      </div>

      {/* Sticky Bottom Actions */}
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-auto flex w-full flex-col items-center gap-4 px-6 max-w-sm mx-auto"
      >
        {/* Main CTA Button */}
        <button
          onClick={handleViewMenu}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E8981A] py-4 text-center font-bold text-white shadow-lg shadow-[#E8981A]/35 transition-all hover:bg-[#D4880F] active:scale-[0.98]"
        >
          <BookOpen className="h-5 w-5" />
          View Menu
        </button>

        <button
          onClick={() => router.push(`/kitchen/login`)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#D4880F] bg-white py-4 text-center font-bold text-[#D4880F] shadow-sm transition-all hover:bg-[#FFF5EB] active:scale-[0.98]"
        >
          <ChefHat className="h-5 w-5" />
          Kitchen Login
        </button>

        <button
          onClick={() => router.push(`/manager/login`)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 py-4 text-center font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-200 active:scale-[0.98]"
        >
          <Lock className="h-5 w-5" />
          Admin Login
        </button>

        {/* Waiter Assistance Link */}
        <button 
          onClick={handleCallWaiter}
          className="text-sm font-semibold text-[#6B4F3A] underline decoration-[#F0E6DC] underline-offset-4 hover:text-[#D4880F]"
        >
          Need assistance? <span className="text-[#D4880F]">Call Waiter</span>
        </button>
      </motion.div>
    </div>
  );
}

export default function WelcomePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#FFF8F0]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#D4880F]/20 border-t-[#D4880F]" />
      </div>
    }>
      <WelcomeContent />
    </Suspense>
  );
}
