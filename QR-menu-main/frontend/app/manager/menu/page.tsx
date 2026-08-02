"use client";

import { useEffect, useState } from "react";
import { getMenu, getCategories, createMenuItem, updateMenuItem, deleteMenuItem } from "@/lib/api";
import type { MenuItem, Category } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Plus, Edit2, Trash2, Check, X, ToggleLeft, ToggleRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Inline Editing State
  const [editingPriceId, setEditingPriceId] = useState<number | null>(null);
  const [tempPrice, setTempPrice] = useState("");

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isVeg, setIsVeg] = useState(true);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isChefSpecial, setIsChefSpecial] = useState(false);

  const fetchData = async () => {
    try {
      const [mList, cList] = await Promise.all([getMenu(), getCategories()]);
      setMenuItems(mList);
      setCategories(cList);
    } catch (err) {
      console.error("Error loading menu data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSavePriceInline = async (id: number) => {
    const parsed = parseFloat(tempPrice);
    if (!isNaN(parsed) && parsed > 0) {
      try {
        await updateMenuItem(id, { price: parsed });
        await fetchData();
      } catch (err: any) {
        alert(err.message || "Failed to update price.");
      }
    }
    setEditingPriceId(null);
  };

  const handleToggleAvailable = async (id: number) => {
    const item = menuItems.find((m) => m.id === id);
    if (!item) return;
    try {
      await updateMenuItem(id, { isAvailable: !item.isAvailable });
      await fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to toggle availability.");
    }
  };

  const handleToggleBestSeller = async (id: number) => {
    const item = menuItems.find((m) => m.id === id);
    if (!item) return;
    try {
      await updateMenuItem(id, { isBestSeller: !item.isBestSeller });
      await fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to toggle bestseller status.");
    }
  };

  const handleToggleChefSpecial = async (id: number) => {
    const item = menuItems.find((m) => m.id === id);
    if (!item) return;
    try {
      await updateMenuItem(id, { isChefSpecial: !item.isChefSpecial });
      await fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to toggle chef special status.");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      try {
        await deleteMenuItem(id);
        await fetchData();
      } catch (err: any) {
        alert(err.message || "Failed to delete menu item.");
      }
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !categoryId) return;

    try {
      await createMenuItem({
        categoryId: parseInt(categoryId, 10),
        name,
        description,
        price: parseFloat(price),
        image: `https://placehold.co/300x200?text=${encodeURIComponent(name)}`,
        isAvailable: true,
        isBestSeller,
        isChefSpecial
      });
      await fetchData();
      resetForm();
      setShowAddForm(false);
    } catch (err: any) {
      alert(err.message || "Failed to add menu item.");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !name || !price) return;

    try {
      await updateMenuItem(editingItem.id, {
        categoryId: parseInt(categoryId, 10),
        name,
        description,
        price: parseFloat(price),
        isBestSeller,
        isChefSpecial
      });
      await fetchData();
      setEditingItem(null);
      resetForm();
    } catch (err: any) {
      alert(err.message || "Failed to update menu item.");
    }
  };

  const startEdit = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description);
    setPrice(item.price.toString());
    setCategoryId(item.categoryId.toString());
    setIsVeg(item.isVeg);
    setIsBestSeller(item.isBestSeller);
    setIsChefSpecial(item.isChefSpecial);
    setShowAddForm(false);
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setCategoryId("");
    setIsVeg(true);
    setIsBestSeller(false);
    setIsChefSpecial(false);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#2D1810]">Menu Items</h1>
          <p className="text-sm font-semibold text-slate-400">Add, edit, delete, and adjust pricing.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingItem(null);
            setShowAddForm(!showAddForm);
          }}
          className="flex items-center gap-1.5 rounded-xl bg-[#E8981A] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#D4880F]"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </button>
      </div>

      {/* Add / Edit Form Modal Box */}
      {(showAddForm || editingItem) && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-[#2D1810] mb-4">
            {editingItem ? `Edit Menu Item: ${editingItem.name}` : "Add New Menu Item"}
          </h3>
          <form onSubmit={editingItem ? handleEditSubmit : handleAddSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Item Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Paneer Butter Masala"
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#D4880F]"
                required
              />
            </div>

            {/* Price */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Price (₹)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 249"
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#D4880F]"
                required
              />
            </div>

            {/* Category selection */}
            {!editingItem && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#D4880F]"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Veg / Non Veg */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Dietary Type</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsVeg(true)}
                  className={cn(
                    "flex-1 py-2 text-xs font-bold rounded-xl border transition-all",
                    isVeg ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-white border-slate-200"
                  )}
                >
                  Vegetarian
                </button>
                <button
                  type="button"
                  onClick={() => setIsVeg(false)}
                  className={cn(
                    "flex-1 py-2 text-xs font-bold rounded-xl border transition-all",
                    !isVeg ? "bg-red-50 border-red-500 text-red-700" : "bg-white border-slate-200"
                  )}
                >
                  Non-Vegetarian
                </button>
              </div>
            </div>

            {/* Flags */}
            <div className="flex items-center gap-6 mt-4 md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600">
                <input
                  type="checkbox"
                  checked={isBestSeller}
                  onChange={(e) => setIsBestSeller(e.target.checked)}
                  className="rounded border-slate-200 text-[#D4880F] focus:ring-[#D4880F] h-4 w-4"
                />
                Mark as Best Seller
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600">
                <input
                  type="checkbox"
                  checked={isChefSpecial}
                  onChange={(e) => setIsChefSpecial(e.target.checked)}
                  className="rounded border-slate-200 text-[#D4880F] focus:ring-[#D4880F] h-4 w-4"
                />
                Mark as Chef's Special
              </label>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief details about ingredients, preparation, style..."
                rows={3}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-[#D4880F] resize-none"
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 justify-end md:col-span-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingItem(null);
                  resetForm();
                }}
                className="rounded-xl bg-slate-200 hover:bg-slate-300 px-4 py-2.5 text-xs font-extrabold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#E8981A] hover:bg-[#D4880F] px-5 py-2.5 text-xs font-extrabold text-white"
              >
                Save Item
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Menu List Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Price</th>
                <th className="py-4 px-4 text-center">Available</th>
                <th className="py-4 px-4 text-center">Badges</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-600">
              {menuItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Name + Veg icon */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center h-3.5 w-3.5 border border-emerald-500 rounded-sm p-0.5 bg-white">
                        <span className={cn("h-1.5 w-1.5 rounded-full", item.isVeg ? "bg-emerald-500" : "bg-red-500")} />
                      </span>
                      <span className="font-extrabold text-slate-800">{item.name}</span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-4 px-4">{item.categoryName}</td>

                  {/* Price */}
                  <td className="py-4 px-4 font-bold text-[#7A3F15]">
                    {editingPriceId === item.id ? (
                      <input
                        type="number"
                        value={tempPrice}
                        onChange={(e) => setTempPrice(e.target.value)}
                        onBlur={() => handleSavePriceInline(item.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSavePriceInline(item.id);
                          } else if (e.key === "Escape") {
                            setEditingPriceId(null);
                          }
                        }}
                        className="w-16 rounded border border-[#D4880F] bg-slate-50 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-[#D4880F]"
                        autoFocus
                      />
                    ) : (
                      <span
                        onClick={() => {
                          setEditingPriceId(item.id);
                          setTempPrice(item.price.toString());
                        }}
                        className="cursor-pointer hover:bg-slate-100 rounded px-1 py-0.5"
                        title="Click to edit price"
                      >
                        {formatPrice(item.price)}
                      </span>
                    )}
                  </td>

                  {/* Availability Toggle */}
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => handleToggleAvailable(item.id)}
                      className={cn(
                        "transition-colors p-1",
                        item.isAvailable ? "text-[#E8981A]" : "text-slate-300"
                      )}
                    >
                      {item.isAvailable ? (
                        <ToggleRight className="h-7 w-7" />
                      ) : (
                        <ToggleLeft className="h-7 w-7" />
                      )}
                    </button>
                  </td>

                  {/* Badges toggles */}
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleToggleBestSeller(item.id)}
                        className={cn(
                          "rounded py-0.5 px-2 text-[9px] font-extrabold uppercase tracking-wide transition-all border",
                          item.isBestSeller 
                            ? "bg-amber-50 border-amber-500 text-amber-700" 
                            : "bg-white border-slate-200 text-slate-400"
                        )}
                      >
                        Best
                      </button>
                      <button
                        onClick={() => handleToggleChefSpecial(item.id)}
                        className={cn(
                          "rounded py-0.5 px-2 text-[9px] font-extrabold uppercase tracking-wide transition-all border",
                          item.isChefSpecial 
                            ? "bg-orange-50 border-orange-500 text-orange-700" 
                            : "bg-white border-slate-200 text-slate-400"
                        )}
                      >
                        Chef
                      </button>
                    </div>
                  </td>

                  {/* Edit/Delete Actions */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => startEdit(item)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
