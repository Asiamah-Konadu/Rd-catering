"use client";

import { useState } from "react";
import {
  Star,
  Trash2,
  Eye,
  EyeOff,
  Search,
  MessageSquare,
  CheckCircle2,
  RefreshCw,
  ThumbsUp,
} from "lucide-react";

export type AdminReview = {
  id: string;
  orderId: string;
  rating: number;
  comment: string | null;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  order: {
    orderNumber: string;
    customerName: string;
  };
  user: {
    name: string;
    email: string;
  } | null;
};

interface Props {
  initialReviews: AdminReview[];
}

export function ReviewsAdminClient({ initialReviews }: Props) {
  const [reviews, setReviews] = useState<AdminReview[]>(initialReviews);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "VISIBLE" | "HIDDEN">("ALL");
  const [ratingFilter, setRatingFilter] = useState<number | "ALL">("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const reloadReviews = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
        showToast("Reviews refreshed");
      }
    } catch {
      showToast("Failed to refresh reviews");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleToggleVisibility = async (id: string, current: boolean) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !current }),
      });

      if (!res.ok) throw new Error("Failed to update visibility");

      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isVisible: !current } : r))
      );
      showToast(!current ? "Review is now visible on website" : "Review hidden from website");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to toggle visibility";
      alert(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string, orderNumber: string) => {
    if (!window.confirm(`Are you sure you want to delete the review for order #${orderNumber}?`)) {
      return;
    }

    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete review");

      setReviews((prev) => prev.filter((r) => r.id !== id));
      showToast("Review deleted successfully");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete review";
      alert(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  // Metrics
  const totalCount = reviews.length;
  const visibleCount = reviews.filter((r) => r.isVisible).length;
  const hiddenCount = reviews.filter((r) => !r.isVisible).length;
  const avgRating = totalCount > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(1)
    : "0.0";
  const positiveCount = reviews.filter((r) => r.rating >= 4).length;
  const satisfactionRate = totalCount > 0 ? Math.round((positiveCount / totalCount) * 100) : 0;

  // Filtered reviews
  const filteredReviews = reviews.filter((r) => {
    if (statusFilter === "VISIBLE" && !r.isVisible) return false;
    if (statusFilter === "HIDDEN" && r.isVisible) return false;
    if (ratingFilter !== "ALL" && r.rating !== ratingFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchOrder = r.order.orderNumber.toLowerCase().includes(q);
      const matchCustomer = r.order.customerName.toLowerCase().includes(q);
      const matchUser = r.user?.name.toLowerCase().includes(q) || r.user?.email.toLowerCase().includes(q);
      const matchComment = r.comment ? r.comment.toLowerCase().includes(q) : false;
      return matchOrder || matchCustomer || matchUser || matchComment;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-amber-300 px-4 py-3 rounded-xl shadow-2xl border border-slate-700 font-medium text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Reviews
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalCount}</div>
            <span className="text-xs text-slate-400 mt-0.5 block">Customer submissions</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Average Rating
            </span>
            <div className="text-2xl font-black text-amber-500 mt-1 flex items-center gap-1.5">
              <span>{avgRating}</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= Math.round(Number(avgRating))
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-200"
                    }`}
                  />
                ))}
              </div>
            </div>
            <span className="text-xs text-slate-400 mt-0.5 block">Across all ratings</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Satisfaction
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{satisfactionRate}%</div>
            <span className="text-xs text-slate-400 mt-0.5 block">{positiveCount} ratings (4★ - 5★)</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ThumbsUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Live Visibility
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              <span className="text-emerald-600">{visibleCount}</span>
              <span className="text-slate-300 text-lg font-normal"> / </span>
              <span className="text-slate-500 text-lg font-normal">{hiddenCount} hid</span>
            </div>
            <span className="text-xs text-slate-400 mt-0.5 block">Shown on homepage</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {/* Status tabs */}
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                statusFilter === "ALL"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter("VISIBLE")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                statusFilter === "VISIBLE"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              }`}
            >
              Visible ({visibleCount})
            </button>
            <button
              onClick={() => setStatusFilter("HIDDEN")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                statusFilter === "HIDDEN"
                  ? "bg-slate-700 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Hidden ({hiddenCount})
            </button>

            <span className="text-slate-300">|</span>

            {/* Rating sub-filter */}
            <select
              value={ratingFilter}
              onChange={(e) =>
                setRatingFilter(e.target.value === "ALL" ? "ALL" : Number(e.target.value))
              }
              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="ALL">All Star Ratings</option>
              <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
              <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
              <option value={3}>⭐⭐⭐ (3 Stars)</option>
              <option value={2}>⭐⭐ (2 Stars)</option>
              <option value={1}>⭐ (1 Star)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search order #, customer, words..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              onClick={reloadReviews}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 transition"
              title="Refresh list"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-amber-600" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredReviews.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-700">No reviews found</h3>
            <p className="text-xs text-slate-400 mt-1">
              {reviews.length === 0
                ? "Reviews submitted by customers upon completing orders will appear here."
                : "No reviews match your current filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-4">Customer & Order</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Comment</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{review.order.customerName}</div>
                      <div className="text-amber-700 font-mono text-[11px] mt-0.5">
                        #{review.order.orderNumber}
                      </div>
                      {review.user?.email && (
                        <div className="text-[10px] text-slate-400">{review.user.email}</div>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-200"
                            }`}
                          />
                        ))}
                        <span className="font-bold text-slate-800 ml-1">
                          {review.rating}.0
                        </span>
                      </div>
                    </td>

                    <td className="p-4 max-w-xs md:max-w-md">
                      {review.comment ? (
                        <p className="text-slate-700 text-xs italic line-clamp-3">
                          &ldquo;{review.comment}&rdquo;
                        </p>
                      ) : (
                        <span className="text-slate-300 italic text-[11px]">No written feedback</span>
                      )}
                    </td>

                    <td className="p-4 text-slate-500 whitespace-nowrap">
                      {new Date(review.createdAt).toLocaleDateString("en-GH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => handleToggleVisibility(review.id, review.isVisible)}
                        disabled={updatingId === review.id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                          review.isVisible
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                        }`}
                        title="Click to toggle visibility"
                      >
                        {review.isVisible ? (
                          <>
                            <Eye className="w-3 h-3 text-emerald-600" />
                            <span>Live (Visible)</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 text-slate-400" />
                            <span>Hidden</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(review.id, review.order.orderNumber)}
                        disabled={updatingId === review.id}
                        className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition disabled:opacity-50"
                        title="Delete review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
