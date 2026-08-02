"use client";

import { Suspense, useEffect, useState, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { getCategories, getMenu, getOffers } from "@/lib/api";
import type { Category, MenuItem, Offer } from "@/types";
import Navbar from "@/components/layout/Navbar";
import BottomNavigation from "@/components/layout/BottomNavigation";
import FloatingCart from "@/components/layout/FloatingCart";
import SearchBar from "@/components/menu/SearchBar";
import HeroBanner from "@/components/menu/HeroBanner";
import OfferCard from "@/components/menu/OfferCard";
import FoodCard from "@/components/menu/FoodCard";
import DishBottomSheet from "@/components/menu/DishBottomSheet";
import { Compass, Flame, Sparkles, Star, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

function HomeContent() {
  const searchParams = useSearchParams();
  const table = searchParams.get("table") || "12";

  // Data State
  const [categories, setCategories] = useState<Category[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [allMenu, setAllMenu] = useState<MenuItem[]>([]);

  // Filter State
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [vegOnly, setVegOnly] = useState(false);

  // Bottom Sheet State
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Preserve scroll ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const focus = searchParams.get("focus");

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [cats, menuItems] = await Promise.all([
          getCategories(),
          getMenu()
        ]);
        setCategories(cats);
        setAllMenu(menuItems);
        setOffers(getOffers());
      } catch (err) {
        console.error("Failed to load home page data:", err);
      }
    };
    loadHomeData();
  }, []);

  useEffect(() => {
    if (focus === "search") {
      const searchInput = document.querySelector("input[placeholder*='Search']");
      if (searchInput) {
        (searchInput as HTMLInputElement).focus();
        searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else if (focus === "menu") {
      setSearchQuery("");
      setActiveCategorySlug("all");
      const categoryBar = document.querySelector(".sticky.top-16");
      if (categoryBar) {
        categoryBar.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [focus]);

  const handleCategorySelect = (slug: string) => {
    setActiveCategorySlug(slug);
  };

  // Special tag-based filters (emoji + slug)
  const specialFilters = [
    { id: "f-romantic", name: "Romantic", slug: "filter-romantic", emoji: "🌹" },
    { id: "f-comfort", name: "Comfort", slug: "filter-comfort", emoji: "🍲" },
    { id: "f-healthy", name: "Healthy", slug: "filter-healthy", emoji: "🥗" },
    { id: "f-kids", name: "Kids", slug: "filter-kids", emoji: "🧒" },
    { id: "f-sweets", name: "Sweets", slug: "filter-sweets", emoji: "🍰" }
  ];

  // Open Bottom Sheet Details
  const handleOpenDetails = (dish: MenuItem) => {
    setSelectedDish(dish);
    setIsSheetOpen(true);
  };

  const sortPriority = (items: MenuItem[]) => {
    return [...items].sort((a, b) => {
      if (a.isChefSpecial !== b.isChefSpecial) {
        return a.isChefSpecial ? -1 : 1;
      }
      if (a.isBestSeller !== b.isBestSeller) {
        return a.isBestSeller ? -1 : 1;
      }
      return a.displayOrder - b.displayOrder;
    });
  };

  // Instant real-time search & category filter computation
  const filteredMenu = useMemo(() => {
    let result = [...allMenu];

    // 1. Category or Special Tag Filter
    if (activeCategorySlug !== "all") {
      // Special tag filters (prefix: filter-)
      if (activeCategorySlug.startsWith("filter-")) {
        const tag = activeCategorySlug.replace("filter-", "");
        const keywordsMap: Record<string, string[]> = {
          romantic: ["chef", "special", "romantic", "date", "candle", "paneer", "steak"],
          comfort: ["dal", "curry", "naan", "biryani", "rice", "comfort", "masala", "butter"],
          healthy: ["salad", "raita", "grill", "healthy", "sprout", "kebab", "brown"],
          kids: ["kids", "cheese", "fries", "burger", "nugget", "maggie", "mini"],
          sweets: ["sugar", "sweet", "gulab", "jamun", "jalebi", "kheer", "rasgulla", "barfi", "laddu", "peda", "cake", "dessert", "ice", "kulfi", "pudding", "rasmalai", "sweetened"]
        };

        const kws = keywordsMap[tag] || [];
        result = result.filter((item) => {
          const text = (item.name + " " + item.description + " " + item.categoryName).toLowerCase();
          return kws.some((kw) => text.includes(kw));
        });
      } else {
        const category = categories.find((c) => c.slug === activeCategorySlug);
        if (category) {
          result = result.filter((item) => item.categoryId === category.id);
        }
      }
    }

    // 2. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.categoryName.toLowerCase().includes(q)
      );
    }

    // 3. Veg Only Filter
    if (vegOnly) {
      result = result.filter((item) => item.isVeg);
    }

    return sortPriority(result);
  }, [allMenu, activeCategorySlug, searchQuery, vegOnly, categories]);

  // Group filtered results by category for nice sections when showing "All"
  const groupedMenu = useMemo(() => {
    if (activeCategorySlug !== "all" || searchQuery.trim() !== "") {
      return null; // Don't group if filtering
    }

    const groups: { [key: string]: MenuItem[] } = {};
    filteredMenu.forEach((item) => {
      if (!groups[item.categoryName]) {
        groups[item.categoryName] = [];
      }
      groups[item.categoryName].push(item);
    });

    return groups;
  }, [filteredMenu, activeCategorySlug, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FFF8F0] pb-36">
      {/* Top Navbar */}
      <Navbar />

      {/* Hero Table Info */}
      <HeroBanner />

      {/* Inline Real-time Search Input */}
      <SearchBar
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search for butter naan, paneer, Chinese..."
        readonly={false}
      />

      {/* Horizontal Offers/Promos Section */}
      {searchQuery.trim() === "" && (
        <div className="flex gap-4 overflow-x-auto px-6 py-2 no-scrollbar snap-x">
          {offers.map((offer) => (
            <div key={offer.id} className="snap-start shrink-0 w-[280px]">
              <OfferCard offer={offer} />
            </div>
          ))}
        </div>
      )}

      {/* Horizontal Categories Filter Chips */}
      <div className="sticky top-16 z-20 border-b border-[#F0E6DC] bg-white px-6 py-3.5 shadow-sm overflow-x-auto no-scrollbar flex gap-2.5 snap-x">
        {/* "All" Chip */}
        <button
          onClick={() => handleCategorySelect("all")}
          className={cn(
            "snap-start shrink-0 rounded-full py-1.5 px-4 text-xs font-bold transition-all border",
            activeCategorySlug === "all"
              ? "bg-[#D4880F] border-[#D4880F] text-white shadow-sm"
              : "bg-white border-[#F0E6DC] text-[#6B4F3A] hover:bg-[#FFF5EB]"
          )}
        >
          All Items
        </button>

        {/* Dynamic Category Chips */}
        {categories.map((cat) => {
          const isActive = cat.slug === activeCategorySlug;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.slug)}
              className={cn(
                "snap-start shrink-0 rounded-full py-1.5 px-4 text-xs font-bold transition-all border",
                isActive
                  ? "bg-[#D4880F] border-[#D4880F] text-white shadow-sm"
                  : "bg-white border-[#F0E6DC] text-[#6B4F3A] hover:bg-[#FFF5EB]"
              )}
            >
              {cat.name}
            </button>
          );
        })}
        {specialFilters.map((f) => {
          const isActive = f.slug === activeCategorySlug;
          return (
            <button
              key={f.id}
              onClick={() => handleCategorySelect(f.slug)}
              className={cn(
                "snap-start shrink-0 rounded-full py-1.5 px-4 text-xs font-bold transition-all border",
                isActive
                  ? "bg-[#D4880F] border-[#D4880F] text-white shadow-sm"
                  : "bg-white border-[#F0E6DC] text-[#6B4F3A] hover:bg-[#FFF5EB]"
              )}
            >
              <span className="mr-1">{f.emoji}</span>
              {f.name}
            </button>
          );
        })}
      </div>

      {/* Mid Action bar: Veg Only Switch */}
      <div className="px-6 pt-4 flex items-center justify-between">
        <button
          onClick={() => setVegOnly(!vegOnly)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div
            className={cn(
              "relative h-5 w-9 rounded-full transition-colors duration-300 border border-neutral-200",
              vegOnly ? "bg-emerald-500" : "bg-neutral-200"
            )}
          >
            <div
              className={cn(
                "absolute top-0.5 left-0.5 h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-300",
                vegOnly ? "translate-x-4.5" : ""
              )}
            />
          </div>
          <span className="text-xs font-extrabold text-[#6B4F3A] uppercase tracking-wider flex items-center gap-1.5">
            <span className="flex h-3.5 w-3.5 items-center justify-center border border-emerald-500 rounded-sm p-0.5 bg-white">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            Veg Only
          </span>
        </button>
      </div>

      {/* Main Dishes Lists Container */}
      <div ref={scrollContainerRef} className="mt-4 flex flex-col gap-6 px-6">
        {/* Render search results or single category selection */}
        {groupedMenu === null ? (
          <div className="flex flex-col gap-3.5">
            {filteredMenu.length > 0 ? (
              filteredMenu.map((item) => (
                <div key={item.id} onClick={() => handleOpenDetails(item)}>
                  <FoodCard item={item} />
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="text-4xl">🥘</span>
                <h4 className="mt-3 text-base font-bold text-[#2D1810]">No dishes found</h4>
                <p className="mt-1 text-xs text-[#9B8577] max-w-[200px]">
                  Try adjusting your search query or filters.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Render grouped menu (Zomato/Swiggy scroll style) */
          Object.entries(groupedMenu).map(([categoryName, items]) => (
            <div key={categoryName} className="flex flex-col gap-3">
              <h3 className="font-serif text-lg font-extrabold text-[#2D1810] border-b border-[#F0E6DC]/40 pb-1 mb-1">
                {categoryName}
              </h3>
              <div className="flex flex-col gap-3.5">
                {items.map((item) => (
                  <div key={item.id} onClick={() => handleOpenDetails(item)}>
                    <FoodCard item={item} />
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reusable Bottom Sheet for Dish Details */}
      <DishBottomSheet
        item={selectedDish}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />

      {/* Sticky Floating Cart Indicator Panel */}
      <FloatingCart />

      {/* Bottom Sticky Tab Navigation */}
      <BottomNavigation activeTab="home" />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFF8F0]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#D4880F]/20 border-t-[#D4880F]" />
        <span className="mt-4 text-sm font-semibold text-[#6B4F3A]">Loading menu...</span>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
