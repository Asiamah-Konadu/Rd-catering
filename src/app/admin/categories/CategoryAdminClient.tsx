"use client";

import { useState } from "react";

type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  menuItemsCount: number;
};

type CategoryFormData = {
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  sortOrder: string;
};

const emptyForm: CategoryFormData = {
  name: "",
  description: "",
  imageUrl: "",
  isActive: true,
  sortOrder: "0",
};

export function CategoryAdminClient({
  initialCategories,
}: {
  initialCategories: AdminCategory[];
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const startCreate = () => {
    setEditingCategory(null);
    setFormData(emptyForm);
  };

  const startEdit = (category: AdminCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      imageUrl: category.imageUrl || "",
      isActive: category.isActive,
      sortOrder: String(category.sortOrder),
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.name.trim()) {
      alert("Please enter a category name");
      return;
    }

    setLoading(true);
    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : "/api/admin/categories";
      const res = await fetch(url, {
        method: editingCategory ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to save category");

      const saved: AdminCategory = {
        ...payload,
        menuItemsCount: payload._count?.menuItems ?? payload.menuItemsCount ?? 0,
      };

      setCategories((prev) => {
        const next = editingCategory
          ? prev.map((category) => (category.id === saved.id ? saved : category))
          : [...prev, saved];
        return next.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
      });

      showToast(editingCategory ? `Updated "${saved.name}"` : `Created "${saved.name}"`);
      setEditingCategory(null);
      setFormData(emptyForm);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (category: AdminCategory) => {
    if (
      !confirm(
        `Delete "${category.name}"? Categories with dishes cannot be deleted.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: "DELETE",
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to delete category");

      setCategories((prev) => prev.filter((item) => item.id !== category.id));
      if (editingCategory?.id === category.id) startCreate();
      showToast(`Deleted "${category.name}"`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete category");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-amber-600 text-white px-4 py-3 rounded-lg shadow-lg border border-amber-500 transition-all font-medium text-sm">
          {toast}
        </div>
      )}

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-900">Current Categories</h2>
            <p className="text-xs text-slate-500">
              These appear in the dish form and public menu sections.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
            {categories.length} total
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {categories.length ? (
            categories.map((category) => (
              <div
                key={category.id}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-900">{category.name}</h3>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                        category.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}
                    >
                      {category.isActive ? "Active" : "Hidden"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    /{category.slug} | Sort {category.sortOrder} | {category.menuItemsCount} dishes
                  </p>
                  {category.description && (
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => startEdit(category)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(category)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={category.menuItemsCount > 0}
                    title={
                      category.menuItemsCount > 0
                        ? "Move or delete dishes in this category first"
                        : "Delete category"
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <h3 className="font-bold text-slate-900">No categories yet</h3>
              <p className="text-sm text-slate-500 mt-1">
                Create your first category, then add dishes to it from the menu catalog.
              </p>
            </div>
          )}
        </div>
      </section>

      <aside className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 h-fit">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="font-bold text-slate-900">
            {editingCategory ? "Edit Category" : "New Category"}
          </h2>
          {editingCategory && (
            <button
              type="button"
              onClick={startCreate}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800"
            >
              New
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(event) =>
                setFormData({ ...formData, name: event.target.value })
              }
              placeholder="e.g. Rice Dishes"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(event) =>
                setFormData({ ...formData, description: event.target.value })
              }
              placeholder="Short note shown internally and available for menu pages."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Image URL
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(event) =>
                setFormData({ ...formData, imageUrl: event.target.value })
              }
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Sort Order
              </label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(event) =>
                  setFormData({ ...formData, sortOrder: event.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <label className="flex items-end gap-2 pb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(event) =>
                  setFormData({ ...formData, isActive: event.target.checked })
                }
                className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
              />
              <span className="text-slate-700 font-medium">Active</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-5 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-bold disabled:opacity-60"
          >
            {loading ? "Saving..." : editingCategory ? "Update Category" : "Create Category"}
          </button>
        </form>
      </aside>
    </div>
  );
}
