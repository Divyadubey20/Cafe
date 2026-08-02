"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Compass, ListCollapse, Utensils, Settings, LogOut, Coffee, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (pathname === "/manager/login") {
      setIsAuthorized(true);
      return;
    }

    const loggedIn = typeof window !== "undefined" && localStorage.getItem("isAdminLoggedIn") === "true";
    if (!loggedIn) {
      router.replace("/manager/login");
      return;
    }
    setIsAuthorized(true);
  }, [router, pathname]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("isAdminLoggedIn");
    }
    router.push("/manager/login");
  };

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/manager/dashboard" },
    { label: "Menu Items", icon: Utensils, path: "/manager/menu" },
    { label: "Categories", icon: ListCollapse, path: "/manager/categories" },
    { label: "Active Orders", icon: Compass, path: "/manager/orders" },
    { label: "Tables & QR", icon: QrCode, path: "/manager/tables" },
    { label: "Settings", icon: Settings, path: "/manager/settings" }
  ];

  if (isAuthorized === null) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-slate-200 bg-white p-6 shadow-sm md:flex md:flex-col justify-between">
        <div className="flex flex-col gap-6">
          {/* Dashboard Header Logo */}
          <div className="flex items-center gap-2 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF5EB] text-[#D4880F]">
              <Coffee className="h-6 w-6" />
            </div>
            <div>
                <h2 className="font-serif text-base font-bold text-[#2D1810]">Cafe</h2>
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all w-full text-left",
                    isActive
                      ? "bg-[#FFF5EB] text-[#D4880F]"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Back to Client Menu */}
        <div className="space-y-2 border-t border-slate-100 pt-4">
          <button
            onClick={() => router.push("/home")}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-[#9B8577] hover:bg-red-50 hover:text-red-600 transition-all w-full text-left"
          >
            <LogOut className="h-5 w-5" />
            Customer Mode
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-[#D4880F] hover:bg-[#FFF5EB] transition-all w-full text-left"
          >
            <LogOut className="h-5 w-5" />
            Admin Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Top Header */}
        <header className="flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFF5EB] text-[#D4880F]">
              <Coffee className="h-5 w-5" />
            </div>
            <h2 className="font-serif text-sm font-bold text-[#2D1810]">Sai Kripa</h2>
          </div>
          
          {/* Horizontal Scrolling Mobile Header Nav */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar max-w-[200px]">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={cn(
                    "p-2 rounded-lg shrink-0",
                    isActive ? "bg-[#FFF5EB] text-[#D4880F]" : "text-slate-400"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        </header>

        {/* Children Page Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {isAuthorized ? children : null}
        </main>
      </div>
    </div>
  );
}
