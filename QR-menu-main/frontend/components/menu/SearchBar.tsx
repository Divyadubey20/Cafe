"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  readonly?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SearchBar({ 
  placeholder = "Search delicious dishes...", 
  readonly = false, 
  value = "", 
  onChange 
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const table = searchParams.get("table") || "12";

  const handleClick = () => {
    if (readonly) {
      router.push(`/search?table=${table}`);
    }
  };

  return (
    <div className="px-6 py-2">
      <div 
        onClick={handleClick}
        className="flex items-center gap-3 rounded-2xl border border-[#F0E6DC] bg-white px-4 py-3 shadow-sm hover:border-[#D4880F]/45 transition-colors cursor-pointer"
      >
        <Search className="h-5 w-5 text-[#9B8577]" />
        {readonly ? (
          <span className="text-sm font-medium text-[#9B8577]">
            {placeholder}
          </span>
        ) : (
          <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-transparent text-sm font-medium text-[#2D1810] placeholder-[#9B8577] outline-none"
            autoFocus={!readonly}
          />
        )}
      </div>
    </div>
  );
}
