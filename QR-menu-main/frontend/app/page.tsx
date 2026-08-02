"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/welcome");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#2D1810]">
      {/* Blurred background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 blur-md scale-105"
        style={{ backgroundImage: "url('/images/hero.jpg')" }}
      />
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Main Glassmorphic Card Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 flex w-[90%] max-w-sm flex-col items-center rounded-3xl border border-white/20 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-md"
      >
        {/* Logo Container */}
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#D4880F] shadow-lg shadow-[#D4880F]/30">
          <Image 
            src="/images/logo.png" 
            alt="Cafe Logo" 
            width={72} 
            height={72}
            className="rounded-full object-cover"
          />
        </div>

        {/* Restaurant Name */}
        <h1 className="mb-2 font-serif text-3xl font-bold tracking-tight text-white">
          Cafe
        </h1>

        {/* Tagline */}
        <p className="text-sm font-medium text-white/80">
          Delicious Food, Memorable Moments
        </p>
      </motion.div>

      {/* Bottom Loading Indicator */}
      <div className="absolute bottom-16 z-10 flex flex-col items-center gap-3">
        {/* Rotating Spinner */}
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-[#E8981A]" />
        
        <span className="text-xs font-semibold tracking-widest text-white/70 uppercase">
          Preparing Your Experience
        </span>
      </div>
    </div>
  );
}
