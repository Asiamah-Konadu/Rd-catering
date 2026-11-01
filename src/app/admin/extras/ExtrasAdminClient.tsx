'use client';

import { useState } from "react";
import { Plus, Edit2, Trash2, Check, X, Sparkles, RefreshCw } from "lucide-react";

interface AdminExtraItem {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
  ordersCount: number;
}

export function ExtrasAdminClient({
  initialExtras,
}: {
  initialExtras: AdminExtraItem[];
}) {
  const [extras, setExtras] = useState<AdminExtraItem[]>(initialExtras);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal / Form state for Add or Edit
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [activeItem, setActiveItem] = useState<AdminExtraItem | null>(null);
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formActive, setFormActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const showToast = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const reloadExtras = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/extras");
      if (res.ok) {
        const data = await res.json();
        setExtras(data);
      }
    } catch {
      showToast("error", "Failed to refresh extras.");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setActiveItem(null);
    setFormName("");
    setFormPrice("");
    setFormActive(true);
    setModalMode("create");
  };

  const openEditModal = (item: AdminExtraItem) => {
    setActiveItem(item);
    setFormName(item.name);
    setFormPrice(item.price.toString());
    setFormActive(item.isActive);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setActiveItem(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = formName.trim();
    const price = parseFloat(formPrice);

    if (!name || name.length < 2) {
      showToast("error", "Name must be at least 2 characters.");
      return;
    }

    if (isNaN(price) || price < 0) {
      showToast("error", "Please enter a valid price.");
      return;
    }

    setSubmitting(true);
    try {
      if (modalMode === "create") {
        const res = await fetch("/api/admin/extras", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, price, isActive: formActive }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create extra.");

        setExtras((prev) => [
          { ...data, ordersCount: 0 },
          ...prev,
        ]);
        showToast("success", `Extra '${name}' added successfully!`);
        closeModal();
      } else if (modalMode === "edit" && activeItem) {
        const res = await fetch(`/api/admin/extras/${activeItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, price, isActive: formActive }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update extra.");

        setExtras((prev) =>
          prev.map((item) =>
            item.id === activeItem.id ? { ...item, ...data } : item
          )
        );
        showToast("success", `Updated '${name}'!`);
        closeModal();
      }
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (item: AdminExtraItem) => {
    const nextActive = !item.isActive;
    try {
      const res = await fetch(`/api/admin/extras/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextActive }),
      });
      if (!res.ok) throw new Error("Failed to update status.");

      setExtras((prev) =>
        prev.map((x) => (x.id === item.id ? { ...x, isActive: nextActive } : x))
      );
      showToast(
        "success",
        `'${item.name}' is now ${nextActive ? "Available" : "Hidden"}`
      );
    } catch {
      showToast("error", "Failed to update availability.");
    }
  };

  const handleDelete = async (item: AdminExtraItem) => {
    if (
      !confirm(
        `Are you sure you want to remove '${item.name}'? If it was previously ordered, it will be deactivated safely.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/extras/${item.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete.");

      if (data.deactivated) {
        setExtras((prev) =>
          prev.map((x) => (x.id === item.id ? { ...x, isActive: false } : x))
        );
        showToast("success", data.message);
      } else {
        setExtras((prev) => prev.filter((x) => x.id !== item.id));
        showToast("success", `Deleted '${item.name}'!`);
      }
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Delete failed.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm font-semibold flex items-center justify-between shadow-md transition ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-500 hover:text-slate-800"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-700">
            Total Extras: {extras.length}
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            {extras.filter((e) => e.isActive).length} Active
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={reloadExtras}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title="Refresh extras"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl text-sm flex items-center gap-2 shadow-sm transition active:scale-[0.99]"
          >
            <Plus size={16} />
            <span>Add New Extra</span>
          </button>
        </div>
      </div>

      {/* Extras Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4 sm:px-6">Extra Name</th>
                <th className="py-3.5 px-4">Price (GH₵)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Orders Count</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {extras.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-50/70 transition ${
                    !item.isActive ? "opacity-60 bg-slate-50/30" : ""
                  }`}
                >
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs shrink-0">
                        <Sparkles size={14} className="text-amber-700" />
                      </div>
                      <span className="font-bold text-slate-900">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-black text-slate-900">
                    GH₵ {item.price.toFixed(2)}
                  </td>
                  <td className="py-4 px-4">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(item)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold transition cursor-pointer ${
                        item.isActive
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                      }`}
                    >
                      {item.isActive ? (
                        <>
                          <Check size={12} strokeWidth={3} /> Available
                        </>
                      ) : (
                        <>
                          <X size={12} strokeWidth={3} /> Hidden
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-4 px-4 text-center text-xs font-semibold text-slate-500">
                    {item.ordersCount}
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="p-2 rounded-lg text-slate-600 hover:text-amber-700 hover:bg-amber-50 transition"
                        title="Edit extra"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete extra"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {extras.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-sm">
            No extras defined yet. Click &quot;Add New Extra&quot; to create one.
          </div>
        )}
      </div>

      {/* Modal Dialog for Add / Edit */}
      {modalMode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-lg">
                {modalMode === "create" ? "Add New Combo Extra" : "Edit Combo Extra"}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Extra Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Charcoal Grilled Chicken, Crispy Yam Balls"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Price (GH₵)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  required
                  placeholder="e.g. 20.00"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-medium"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="formActiveCheck"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <label
                  htmlFor="formActiveCheck"
                  className="text-sm font-semibold text-slate-700 cursor-pointer"
                >
                  Active &amp; available for customers to order
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm shadow-sm transition disabled:opacity-50"
                >
                  {submitting ? "Saving..." : modalMode === "create" ? "Create Extra" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
