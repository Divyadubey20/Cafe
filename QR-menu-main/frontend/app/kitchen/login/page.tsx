"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, CheckCircle2, XCircle } from "lucide-react";

const KITCHEN_ID = "chef001";
const KITCHEN_PASSWORD = "tandoor123";

export default function KitchenLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (username.trim() === KITCHEN_ID && password === KITCHEN_PASSWORD) {
      router.push("/kitchen/dashboard");
      return;
    }

    setError("Invalid kitchen ID or password. Please try again.");
  };

  return (
    <div className="min-h-screen bg-[#F8F1E6] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md rounded-[28px] border border-[#E2D7CE] bg-white p-8 shadow-xl shadow-[#D4880F]/10">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D4880F] text-white shadow-md">
            <Lock className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2D1810]">Kitchen Login</h1>
            <p className="text-sm text-[#6B4F3A]">Enter chef credentials to view live orders and special instructions.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-[#7A3F15]">
            Kitchen ID
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="chef001"
              className="mt-2 w-full rounded-3xl border border-[#E2D7CE] bg-[#FFF7EE] px-4 py-3 text-sm font-medium text-[#2D1810] outline-none transition focus:border-[#D4880F] focus:ring-2 focus:ring-[#D4880F]/20"
            />
          </label>

          <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-[#7A3F15]">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="tandoor123"
              className="mt-2 w-full rounded-3xl border border-[#E2D7CE] bg-[#FFF7EE] px-4 py-3 text-sm font-medium text-[#2D1810] outline-none transition focus:border-[#D4880F] focus:ring-2 focus:ring-[#D4880F]/20"
            />
          </label>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="mt-2 rounded-3xl bg-[#D4880F] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-[#D4880F]/20 transition hover:bg-[#c27a0f]"
          >
            Login
          </button>
        </form>

        <div className="mt-6 rounded-3xl border border-[#F0E6DC] bg-[#FFF5EB] p-4 text-sm text-[#6B4F3A]">
          <p className="font-semibold">Chef credentials</p>
          <p>ID: <span className="font-bold">chef001</span></p>
          <p>Password: <span className="font-bold">tandoor123</span></p>
        </div>
      </div>
    </div>
  );
}
