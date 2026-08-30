"use client";

import { useState } from "react";

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
};

export type AdminMenuItem = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  price: number | string;
  isAvailable: boolean;
  isFeatured: boolean;
  category?: AdminCategory;
};

export function MenuAdminClient({
  initialCategories,
  initialItems,
}: {
  initialCategories: AdminCategory[];
  initialItems: AdminMenuItem[];
}) {
  const [categories] = useState<AdminCategory[]>(initialCategories);
  const [items, setItems] = useState<AdminMenuItem[]>(initialItems);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminMenuItem | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    categoryId: initialCategories[0]?.id || "",
    description: "",
    imageUrl: "",
    price: "",
    isAvailable: true,
    isFeatured: false,
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      categoryId: categories[0]?.id || "",
      description: "",
      imageUrl: "",
      price: "",
      isAvailable: true,
      isFeatured: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: AdminMenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      categoryId: item.categoryId,
      description: item.description || "",
      imageUrl: item.imageUrl || "",
      price: String(item.price),
      isAvailable: item.isAvailable,
      isFeatured: item.isFeatured,
    });
    setIsModalOpen(true);
  };

  const handleToggle = async (
    item: AdminMenuItem,
    field: "isAvailable" | "isFeatured"
  ) => {
    const newValue = !item[field];
    try {
      const res = await fetch(`/api/admin/menu/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: newValue }),
      });
      if (!res.ok) throw new Error("Failed to update item");
      const updated = await res.json();
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, [field]: updated[field] } : i))
      );
      showToast(
        `Updated "${item.name}" - ${field === "isAvailable" ? (newValue ? "Available" : "Out of Stock") : (newValue ? "Featured" : "Unfeatured")}`
      );
    } catch {
      alert("Error updating item state");
    }
  };

  const handleDelete = async (item: AdminMenuItem) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/menu/${item.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete item");
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      showToast(`Deleted "${item.name}" successfully`);
    } catch {
      alert("Failed to delete item");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.categoryId || !formData.price) {
      alert("Please fill in all required fields (Name, Category, Price)");
      return;
    }

    setLoading(true);
    try {
      if (editingItem) {
        // Edit mode
        const res = await fetch(`/api/admin/menu/${editingItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("Failed to update menu item");
        const updated = await res.json();
        setItems((prev) =>
          prev.map((i) => (i.id === editingItem.id ? updated : i))
        );
        showToast(`Updated "${updated.name}"`);
      } else {
        // Create mode
        const res = await fetch("/api/admin/menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("Failed to create menu item");
        const created = await res.json();
        setItems((prev) => [created, ...prev]);
        showToast(`Created dish "${created.name}"`);
      }
      setIsModalOpen(false);
    } catch {
      alert("Failed to save menu item");
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCat =
      selectedCategory === "ALL" ? true : item.categoryId === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === ""
        ? true
        : item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description &&
            item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-amber-600 text-white px-4 py-3 rounded-lg shadow-lg border border-amber-500 transition-all font-medium text-sm">
          {toast}
        </div>
      )}

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              selectedCategory === "ALL"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All Items ({items.length})
          </button>
          {categories.map((cat) => {
            const count = items.filter((i) => i.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search dish name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-60 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-lg shadow-xs transition whitespace-nowrap"
          >
            + Add Dish
          </button>
        </div>
      </div>

      {/* Grid of Dishes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition"
          >
            <div>
              {item.imageUrl ? (
                <div className="h-44 w-full overflow-hidden relative bg-slate-100">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  {item.isFeatured && (
                    <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-xs">
                      Featured
                    </span>
                  )}
                </div>
              ) : (
                <div className="h-28 w-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-medium">
                  No image provided
                </div>
              )}

              <div className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-900 text-lg">{item.name}</h3>
                  <span className="font-extrabold text-amber-700 text-base">
                    GH₵ {Number(item.price).toFixed(2)}
                  </span>
                </div>
                <div className="text-xs text-amber-800 font-semibold bg-amber-50 inline-block px-2 py-0.5 rounded">
                  {item.category?.name || "Uncategorized"}
                </div>
                {item.description && (
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(item, "isAvailable")}
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border transition ${
                    item.isAvailable
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200"
                      : "bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200"
                  }`}
                >
                  {item.isAvailable ? "In Stock" : "Out of Stock"}
                </button>
                <button
                  onClick={() => handleToggle(item, "isFeatured")}
                  className={`text-xs font-semibold px-2 py-1 rounded transition ${
                    item.isFeatured
                      ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                      : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                  }`}
                >
                  {item.isFeatured ? "★ Featured" : "☆ Feature"}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(item)}
                  className="text-xs font-semibold text-slate-700 hover:text-amber-700 underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-800 underline"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form for Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-xl font-bold text-slate-900">
                {editingItem ? "Edit Menu Dish" : "Add New Dish"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Dish Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Jollof Rice Special"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Price (GH₵) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="45.00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Ingredients, sides included, serving details..."
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
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) =>
                      setFormData({ ...formData, isAvailable: e.target.checked })
                    }
                    className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                  />
                  <span className="text-slate-700 font-medium">Available (In Stock)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      setFormData({ ...formData, isFeatured: e.target.checked })
                    }
                    className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                  />
                  <span className="text-slate-700 font-medium">Feature on Homepage</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-bold"
                >
                  {loading ? "Saving..." : editingItem ? "Update Dish" : "Create Dish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
