"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Sparkles,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
} from "lucide-react";

interface DishItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
  categoryName: string;
}

interface WeeklyMenuItemData extends DishItem {
  menuItemId: string;
  sortOrder: number;
}

interface WeeklyMenuData {
  id: string;
  title: string;
  isPublished: boolean;
  items: WeeklyMenuItemData[];
}

interface Props {
  initialWeeklyMenu: WeeklyMenuData;
  allDishes: DishItem[];
}

export function WeeklyMenuAdminClient({ initialWeeklyMenu, allDishes }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialWeeklyMenu.title);
  const [isPublished, setIsPublished] = useState(initialWeeklyMenu.isPublished);
  // selectedIds is an array of menuItem IDs in sort order
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialWeeklyMenu.items.map((it) => it.menuItemId)
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Map of all dishes for fast lookup
  const dishMap = new Map<string, DishItem>(allDishes.map((d) => [d.id, d]));

  // Selected dishes in exact ordered list
  const selectedDishes = selectedIds
    .map((id) => dishMap.get(id))
    .filter((d): d is DishItem => !!d);

  // Unselected dishes matching search query
  const availableDishes = allDishes.filter((d) => {
    const isSelected = selectedIds.includes(d.id);
    if (isSelected) return false;
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      d.name.toLowerCase().includes(query) ||
      d.categoryName.toLowerCase().includes(query)
    );
  });

  const handleAddDish = (dishId: string) => {
    if (!selectedIds.includes(dishId)) {
      setSelectedIds([...selectedIds, dishId]);
      setStatusMessage(null);
    }
  };

  const handleRemoveDish = (dishId: string) => {
    setSelectedIds(selectedIds.filter((id) => id !== dishId));
    setStatusMessage(null);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const newIds = [...selectedIds];
    const temp = newIds[index - 1];
    newIds[index - 1] = newIds[index];
    newIds[index] = temp;
    setSelectedIds(newIds);
    setStatusMessage(null);
  };

  const handleMoveDown = (index: number) => {
    if (index >= selectedIds.length - 1) return;
    const newIds = [...selectedIds];
    const temp = newIds[index + 1];
    newIds[index + 1] = newIds[index];
    newIds[index] = temp;
    setSelectedIds(newIds);
    setStatusMessage(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/weekly-menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: initialWeeklyMenu.id,
          title,
          isPublished,
          itemIds: selectedIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update weekly dishes");
      }

      setStatusMessage({
        type: "success",
        text: "Weekly Carousel dishes updated and published successfully!",
      });
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Sparkles className="w-6 h-6 text-amber-500" />
              &quot;This Week&apos;s Dishes&quot; Carousel Manager
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Select and order the exact dishes that appear in the rotating 3D food cylinder on the homepage.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-sm shadow-md transition disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Carousel Dishes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl flex items-start gap-3 border ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-red-50 text-red-900 border-red-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <span className="text-sm font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Control Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1 space-y-1">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
            Carousel Section Heading
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. This Week's Featured Dishes"
            className="w-full max-w-md px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-4 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
          <div>
            <span className="block text-sm font-bold text-slate-800">
              Carousel Active Status
            </span>
            <span className="block text-xs text-slate-500">
              {isPublished
                ? "Live: Custom dishes appear in cylinder"
                : "Inactive: Storefront uses general menu fallbacks"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsPublished(!isPublished)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              isPublished ? "bg-emerald-600" : "bg-slate-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isPublished ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Carousel Order List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Active Carousel Dishes</span>
                <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  {selectedDishes.length} selected
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Order matters. The first dish faces forward on initial page load. (Recommend 6–9 dishes for best 3D rotation).
              </p>
            </div>
          </div>

          {selectedDishes.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center space-y-2">
              <p className="text-sm font-bold text-slate-700">
                No dishes added to this week&apos;s carousel yet
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Select dishes from the menu catalog on the right to build your weekly rotation.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
              {selectedDishes.map((dish, index) => (
                <div
                  key={dish.id}
                  className="p-3.5 flex items-center gap-3 hover:bg-slate-50/80 transition group"
                >
                  <span className="w-6 text-center text-xs font-black text-slate-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    {dish.imageUrl ? (
                      <Image
                        src={dish.imageUrl}
                        alt={dish.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-bold">
                        RD
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {dish.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{dish.categoryName}</span>
                      <span>·</span>
                      <strong className="text-amber-600 font-bold">
                        GH₵ {dish.price.toFixed(2)}
                      </strong>
                    </div>
                  </div>

                  {/* Ordering & delete controls */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      title="Move Up"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === selectedDishes.length - 1}
                      title="Move Down"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveDish(dish.id)}
                      title="Remove from Carousel"
                      className="p-1.5 rounded-lg text-red-400 hover:text-red-700 hover:bg-red-50 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Catalog Picker */}
        <div className="lg:col-span-5 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Available Catalog Dishes
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click &quot;+ Add&quot; to include any available dish into the weekly rotation.
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes or categories..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {availableDishes.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                {searchQuery ? "No matching dishes found." : "All available dishes are currently in the carousel."}
              </div>
            ) : (
              availableDishes.map((dish) => (
                <div
                  key={dish.id}
                  className="p-3 flex items-center gap-3 hover:bg-slate-50 transition"
                >
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    {dish.imageUrl ? (
                      <Image
                        src={dish.imageUrl}
                        alt={dish.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-bold">
                        RD
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-slate-900 truncate">
                      {dish.name}
                    </h5>
                    <span className="text-[11px] text-slate-500 block">
                      {dish.categoryName} · GH₵ {dish.price.toFixed(2)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddDish(dish.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs border border-amber-200 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
