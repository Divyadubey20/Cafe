"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Home, Compass, Search, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  activeTab?: "home" | "menu" | "search" | "cart";
}

export default function BottomNavigation({ activeTab }: BottomNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const table = searchParams.get("table") || "12";
  const { getItemCount } = useCart();
  const itemCount = getItemCount();

  // Determine active tab if not explicitly passed
  let currentTab = activeTab;
  if (!currentTab) {
    if (pathname.includes("/cart")) {
      currentTab = "cart";
    } else if (pathname.includes("/home")) {
      const focus = searchParams.get("focus");
      if (focus === "menu") currentTab = "menu";
      else if (focus === "search") currentTab = "search";
      else currentTab = "home";
    }
  }

  const navItems = [
    { id: "home", label: "Home", icon: Home, path: `/home?table=${table}` },
    { id: "menu", label: "Menu", icon: Compass, path: `/home?table=${table}&focus=menu` },
    { id: "search", label: "Search", icon: Search, path: `/home?table=${table}&focus=search` },
    { id: "cart", label: "Cart", icon: ShoppingCart, path: `/cart?table=${table}`, badge: true }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#F0E6DC] bg-white pb-safe shadow-lg">
      <div className="flex h-16 w-full items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className="relative flex flex-col items-center justify-center w-16 h-12 gap-0.5 rounded-xl transition-all"
            >
              <div
                className={cn(
                  "flex items-center justify-center w-12 h-7 rounded-full transition-all duration-300",
                  isActive ? "bg-[#FFF5EB] text-[#D4880F]" : "text-[#9B8577] hover:text-[#2D1810]"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold tracking-wide transition-all",
                  isActive ? "text-[#D4880F]" : "text-[#9B8577]"
                )}
              >
                {item.label}
              </span>
              
              {/* Badge for Cart */}
              {item.badge && itemCount > 0 && (
                <span className="absolute top-1 right-2.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#E8981A] text-[9px] font-bold text-white shadow-sm">
                  {itemCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
