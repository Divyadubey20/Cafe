"use client";

import { useEffect, useState } from "react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/lib/api";
import type { Category } from "@/types";
import { Plus, Edit2, Trash2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [displayOrder, setDisplayOrder] = useState("");

  const fetchCategoriesData = async () => {
    try {
      const list = await getCategories();
      setCategories(list);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  useEffect(() => {
    fetchCategoriesData();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("Deleting this category will cascade delete all its menu items. Continue?")) {
      try {
        await deleteCategory(id);
        fetchCategoriesData();
      } catch (err: any) {
        alert(err.message || "Failed to delete category.");
      }
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      await createCategory(name, displayOrder ? parseInt(displayOrder) : categories.length + 1);
      fetchCategoriesData();
      resetForm();
      setShowAddForm(false);
    } catch (err: any) {
      alert(err.message || "Failed to create category.");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !name) return;

    try {
      await updateCategory(editingCategory.id, name, displayOrder ? parseInt(displayOrder) : editingCategory.displayOrder);
      fetchCategoriesData();
      setEditingCategory(null);
      resetForm();
    } catch (err: any) {
      alert(err.message || "Failed to update category.");
    }
  };

  const startEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDisplayOrder(cat.displayOrder.toString());
    setShowAddForm(false);
  };

  const resetForm = () => {
    setName("");
    setDisplayOrder("");
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#2D1810]">Menu Categories</h1>
          <p className="text-sm font-semibold text-slate-400">Manage categories and their display sequence.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingCategory(null);
            setShowAddForm(!showAddForm);
          }}
          className="flex items-center gap-1.5 rounded-xl bg-[#E8981A] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#D4880F]"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {/* Add / Edit Form Panel */}
      {(showAddForm || editingCategory) && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-[#2D1810] mb-4">
            {editingCategory ? `Rename Category: ${editingCategory.name}` : "Create New Category"}
          </h3>
          <form onSubmit={editingCategory ? handleEditSubmit : handleAddSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Category Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Main Course, Desserts..."
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#D4880F]"
                required
              />
            </div>

            {/* Display Order Sequence */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Display Order (Sorting)</label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                placeholder="e.g. 1, 2, 3..."
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#D4880F]"
              />
            </div>

            {/* Actions Buttons */}
            <div className="flex gap-3 justify-end md:col-span-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingCategory(null);
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
                Save Category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-6 w-20">Display No</th>
                <th className="py-4 px-6">Category Name</th>
                <th className="py-4 px-4">Slug Identifier</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-600">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Display Order */}
                  <td className="py-4 px-6 font-bold text-[#D4880F]">{cat.displayOrder}</td>

                  {/* Name */}
                  <td className="py-4 px-6">
                    <span className="font-extrabold text-slate-800">{cat.name}</span>
                  </td>

                  {/* Slug */}
                  <td className="py-4 px-4 text-xs font-mono text-slate-400">{cat.slug}</td>

                  {/* Actions buttons */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => startEdit(cat)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
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
