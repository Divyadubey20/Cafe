"use client";

import { useEffect, useState } from "react";
import { getRestaurant, updateSettings } from "@/lib/api";
import type { Restaurant } from "@/types";
import { Save, Check, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsManagement() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  
  // Form State
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [openingTime, setOpeningTime] = useState("");
  const [closingTime, setClosingTime] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [gstPercentage, setGstPercentage] = useState("5");
  const [deliveryFee, setDeliveryFee] = useState("40");

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getRestaurant();
        setRestaurant(data);
        setName(data.name);
        setTagline(data.tagline);
        setAddress(data.address);
        setPhone(data.phone);
        setOpeningTime(data.openingTime);
        setClosingTime(data.closingTime);
        setLogoUrl(data.logoUrl);
        setCurrency(data.currency);
        setGstPercentage(data.gstPercentage.toString());
        setDeliveryFee(data.deliveryFee.toString());
      } catch (err) {
        console.error("Failed to load restaurant settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateSettings({
        name,
        address,
        phone,
        openingTime,
        closingTime,
        logoUrl,
        currency,
        gstPercentage: parseFloat(gstPercentage) || 5.0
      });
      setRestaurant(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err: any) {
      alert(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (!restaurant) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#D4880F]/20 border-t-[#D4880F]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#2D1810]">Restaurant Settings</h1>
        <p className="text-sm font-semibold text-slate-400">Configure name, hours, billing currency, and service taxation.</p>
      </div>

      {/* Main Settings Form Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          
          {/* Section: Identity */}
          <div className="border-b border-slate-100 pb-4 mb-2">
            <h3 className="font-serif text-base font-bold text-[#2D1810]">Restaurant Profile</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Restaurant Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#D4880F]"
                required
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#D4880F]"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#D4880F]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Opening & Closing Hours</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={openingTime}
                  onChange={(e) => setOpeningTime(e.target.value)}
                  placeholder="e.g. 11 AM"
                  className="w-1/2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#D4880F]"
                  required
                />
                <input
                  type="text"
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                  placeholder="e.g. 11 PM"
                  className="w-1/2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#D4880F]"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-[#D4880F] resize-none"
              />
            </div>
          </div>

          {/* Section: Billing and Taxation */}
          <div className="border-b border-slate-100 pb-4 mb-2 mt-4">
            <h3 className="font-serif text-base font-bold text-[#2D1810]">Billing & Taxes</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Currency Code</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#D4880F]"
                required
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">GST Rate (%)</label>
              <input
                type="number"
                value={gstPercentage}
                onChange={(e) => setGstPercentage(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#D4880F]"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Delivery Fee (₹)</label>
              <input
                type="number"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#D4880F]"
                required
              />
            </div>
          </div>

          {/* Save Button & Actions */}
          <div className="flex gap-4 items-center justify-end mt-6 border-t border-slate-100 pt-4">
            {success && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg py-2 px-3 flex items-center gap-1">
                <Check className="h-4 w-4" />
                Settings saved successfully!
              </span>
            )}
            
            <button
              type="submit"
              disabled={saving}
              className={cn(
                "flex items-center gap-1.5 rounded-xl py-3 px-6 font-bold text-white shadow-md active:scale-95 transition-all w-full md:w-auto justify-center",
                success 
                  ? "bg-emerald-600 hover:bg-emerald-700" 
                  : "bg-[#E8981A] hover:bg-[#D4880F]"
              )}
            >
              {saving ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
