"use client";

import { useState, useCallback } from "react";
import {
  Building2,
  Plus,
  Edit3,
  Trash2,
  X,
  Check,
  ExternalLink,
  Copy,
  RefreshCw,
  Package,
  Tag,
  Clock,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Users,
} from "lucide-react";

type Company = {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  region: string | null;
  dropoffLocation: string | null;
  contactPersonName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  cutoffTime: string;
  batchDeliveryTime: string;
  discountPercent: number;
  freeDelivery: boolean;
  customPackaging: boolean;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  totalOrdersCount: number;
  todayOrdersCount: number;
  totalRevenue: number;
};

const EMPTY_FORM = {
  name: "",
  slug: "",
  address: "",
  city: "Accra",
  region: "Greater Accra",
  dropoffLocation: "",
  contactPersonName: "",
  contactPhone: "",
  contactEmail: "",
  cutoffTime: "10:30 AM",
  batchDeliveryTime: "12:00 PM - 1:00 PM",
  discountPercent: 0,
  freeDelivery: true,
  customPackaging: true,
  isActive: true,
  notes: "",
};

function generateSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function PerksRow({ company }: { company: Company }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {company.freeDelivery && (
        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide">
          <Package className="w-2.5 h-2.5" /> Free Delivery
        </span>
      )}
      {company.discountPercent > 0 && (
        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide">
          <Tag className="w-2.5 h-2.5" /> {company.discountPercent}% Off
        </span>
      )}
      {company.customPackaging && (
        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide">
          <Package className="w-2.5 h-2.5" /> Custom Box
        </span>
      )}
    </div>
  );
}

function CompanyCard({
  company,
  onEdit,
  onToggle,
  onDelete,
}: {
  company: Company;
  onEdit: (c: Company) => void;
  onToggle: (c: Company) => void;
  onDelete: (c: Company) => void;
}) {
  const [copied, setCopied] = useState(false);
  const portalUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/corporate/${company.slug}`;

  function copyLink() {
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
        company.isActive
          ? "border-slate-200 hover:border-amber-200 hover:shadow-md"
          : "border-slate-200 opacity-60"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
              company.isActive
                ? "bg-amber-500 text-slate-950"
                : "bg-slate-200 text-slate-500"
            }`}
          >
            {company.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm leading-tight">
              {company.name}
            </h3>
            <p className="text-xs text-slate-400 font-mono">/corporate/{company.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span
            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
              company.isActive
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {company.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 bg-slate-50 text-center">
        <div className="px-3 py-2">
          <p className="text-[10px] text-slate-500 uppercase font-bold">Today</p>
          <p className="text-lg font-black text-amber-600">{company.todayOrdersCount}</p>
        </div>
        <div className="px-3 py-2">
          <p className="text-[10px] text-slate-500 uppercase font-bold">Total</p>
          <p className="text-lg font-black text-slate-800">{company.totalOrdersCount}</p>
        </div>
        <div className="px-3 py-2">
          <p className="text-[10px] text-slate-500 uppercase font-bold">Revenue</p>
          <p className="text-sm font-black text-slate-800">
            GH₵{company.totalRevenue.toFixed(0)}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 space-y-2">
        <div className="flex items-start gap-1.5 text-xs text-slate-600">
          <MapPin className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
          <span>
            {company.dropoffLocation ? `${company.address} · ${company.dropoffLocation}` : company.address}
            {company.city ? `, ${company.city}` : ""}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Cutoff: <strong>{company.cutoffTime}</strong> · Delivery: <strong>{company.batchDeliveryTime}</strong></span>
        </div>
        {company.contactPersonName && (
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{company.contactPersonName}</span>
            {company.contactPhone && <span className="text-slate-400">· {company.contactPhone}</span>}
          </div>
        )}
        <PerksRow company={company} />
      </div>

      {/* Portal Link */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          <p className="text-[10px] font-mono text-slate-500 truncate flex-1">/corporate/{company.slug}</p>
          <button
            onClick={copyLink}
            className="shrink-0 text-slate-400 hover:text-amber-600 transition"
            title="Copy portal link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <a
            href={`/corporate/${company.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-slate-400 hover:text-amber-600 transition"
            title="Open portal"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
        <button
          onClick={() => onToggle(company)}
          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
            company.isActive
              ? "bg-slate-200 text-slate-600 hover:bg-rose-100 hover:text-rose-700"
              : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
          }`}
        >
          {company.isActive ? "Deactivate" : "Activate"}
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(company)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-amber-50 hover:text-amber-700 transition"
            title="Edit company"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(company)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-700 transition"
            title="Delete company"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CompanyFormModal({
  initial,
  onClose,
  onSaved,
}: {
  initial?: Company;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(
    initial
      ? {
          name: initial.name,
          slug: initial.slug,
          address: initial.address,
          city: initial.city,
          region: initial.region || "Greater Accra",
          dropoffLocation: initial.dropoffLocation || "",
          contactPersonName: initial.contactPersonName || "",
          contactPhone: initial.contactPhone || "",
          contactEmail: initial.contactEmail || "",
          cutoffTime: initial.cutoffTime,
          batchDeliveryTime: initial.batchDeliveryTime,
          discountPercent: initial.discountPercent,
          freeDelivery: initial.freeDelivery,
          customPackaging: initial.customPackaging,
          isActive: initial.isActive,
          notes: initial.notes || "",
        }
      : { ...EMPTY_FORM }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleNameChange(val: string) {
    setForm((f) => ({
      ...f,
      name: val,
      slug: initial ? f.slug : generateSlug(val),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const url = initial
        ? `/api/admin/companies/${initial.id}`
        : "/api/admin/companies";
      const method = initial ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save company");
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save company");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              {initial ? "Edit Company" : "Register New Company"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {initial
                ? "Update corporate portal settings"
                : "Add a corporate client for synchronized batch delivery"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Company name + slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Company Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                placeholder="e.g. Stanbic Bank Ghana"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                URL Slug
              </label>
              <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-amber-400">
                <span className="px-2 text-xs text-slate-400 bg-slate-50 border-r border-slate-300 py-2 font-mono whitespace-nowrap">
                  /corporate/
                </span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, slug: generateSlug(e.target.value) }))
                  }
                  placeholder="stanbic-bank"
                  className="flex-1 px-2 py-2 text-sm font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Office Delivery Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              required
              placeholder="e.g. Stanbic Heights, 215 Airport City, Accra"
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Region</label>
              <input
                type="text"
                value={form.region}
                onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Specific Drop-off Point
              </label>
              <input
                type="text"
                value={form.dropoffLocation}
                onChange={(e) => setForm((f) => ({ ...f, dropoffLocation: e.target.value }))}
                placeholder="e.g. Reception Lobby, 3rd Floor"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                value={form.contactPersonName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contactPersonName: e.target.value }))
                }
                placeholder="e.g. Ama Asante (HR)"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={form.contactPhone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contactPhone: e.target.value }))
                }
                placeholder="0244000000"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contactEmail: e.target.value }))
                }
                placeholder="hr@company.com"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          {/* Timing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Order Cut-off Time
              </label>
              <input
                type="text"
                value={form.cutoffTime}
                onChange={(e) => setForm((f) => ({ ...f, cutoffTime: e.target.value }))}
                placeholder="10:30 AM"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Deadline for staff to submit individual orders
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Batch Delivery Window
              </label>
              <input
                type="text"
                value={form.batchDeliveryTime}
                onChange={(e) =>
                  setForm((f) => ({ ...f, batchDeliveryTime: e.target.value }))
                }
                placeholder="12:00 PM - 1:00 PM"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Synchronized delivery window for the entire office
              </p>
            </div>
          </div>

          {/* Perks */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Corporate Perks
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Group Discount (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={form.discountPercent}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, discountPercent: Number(e.target.value) }))
                  }
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer mt-4 sm:mt-0">
                <input
                  type="checkbox"
                  checked={form.freeDelivery}
                  onChange={(e) => setForm((f) => ({ ...f, freeDelivery: e.target.checked }))}
                  className="w-4 h-4 rounded accent-amber-500"
                />
                <span className="text-sm font-semibold text-slate-700">Free Delivery</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer mt-0 sm:mt-4">
                <input
                  type="checkbox"
                  checked={form.customPackaging}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, customPackaging: e.target.checked }))
                  }
                  className="w-4 h-4 rounded accent-amber-500"
                />
                <span className="text-sm font-semibold text-slate-700">Custom Packaging</span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Internal Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              placeholder="Any special instructions for the kitchen or delivery team..."
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            />
          </div>

          {/* Status */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="w-4 h-4 rounded accent-amber-500"
            />
            <span className="text-sm font-semibold text-slate-700">
              Portal is Active (staff can place orders)
            </span>
          </label>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-extrabold py-2.5 rounded-xl transition text-sm"
            >
              {saving
                ? initial
                  ? "Saving..."
                  : "Registering..."
                : initial
                ? "Save Changes"
                : "Register Company"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-sm font-semibold hover:bg-slate-100 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CompaniesAdminClient({
  initialCompanies,
}: {
  initialCompanies: Company[];
}) {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Company | undefined>(undefined);
  const [confirmDelete, setConfirmDelete] = useState<Company | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/companies");
      const data = await res.json();
      if (res.ok) setCompanies(data);
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleToggle(company: Company) {
    try {
      const res = await fetch(`/api/admin/companies/${company.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !company.isActive }),
      });
      if (res.ok) {
        setCompanies((prev) =>
          prev.map((c) => (c.id === company.id ? { ...c, isActive: !c.isActive } : c))
        );
      }
    } catch {
      // ignore
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    setDeleting(true);
    setDeleteMsg("");
    try {
      const res = await fetch(`/api/admin/companies/${confirmDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setDeleteMsg(data.message || "Done.");
        await reload();
        setTimeout(() => {
          setConfirmDelete(null);
          setDeleteMsg("");
        }, 1500);
      } else {
        setDeleteMsg(data.error || "Failed to delete.");
      }
    } finally {
      setDeleting(false);
    }
  }

  const activeCount = companies.filter((c) => c.isActive).length;
  const totalOrders = companies.reduce((s, c) => s + c.todayOrdersCount, 0);
  const totalRevenue = companies.reduce((s, c) => s + c.totalRevenue, 0);

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Registered", value: companies.length, icon: Building2, color: "text-slate-700" },
          { label: "Active Portals", value: activeCount, icon: Check, color: "text-emerald-600" },
          { label: "Orders Today", value: totalOrders, icon: TrendingUp, color: "text-amber-600" },
          { label: "Total Revenue", value: `GH₵${totalRevenue.toFixed(0)}`, icon: Tag, color: "text-blue-600" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">{s.label}</p>
              <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {companies.length} compan{companies.length === 1 ? "y" : "ies"} registered
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={reload}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => {
              setEditTarget(undefined);
              setShowForm(true);
            }}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-sm transition"
          >
            <Plus className="w-4 h-4" />
            Register Company
          </button>
        </div>
      </div>

      {/* Empty state */}
      {companies.length === 0 && !loading && (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-extrabold text-slate-700 mb-1">
            No Companies Registered Yet
          </h3>
          <p className="text-sm text-slate-500 mb-4 max-w-sm mx-auto">
            Register corporate clients so their staff can order individually through a
            dedicated portal with synchronized batch delivery.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-5 py-2.5 rounded-xl text-sm transition"
          >
            Register First Company
          </button>
        </div>
      )}

      {/* Company Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {companies.map((company) => (
          <CompanyCard
            key={company.id}
            company={company}
            onEdit={(c) => {
              setEditTarget(c);
              setShowForm(true);
            }}
            onToggle={handleToggle}
            onDelete={(c) => setConfirmDelete(c)}
          />
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <CompanyFormModal
          initial={editTarget}
          onClose={() => {
            setShowForm(false);
            setEditTarget(undefined);
          }}
          onSaved={reload}
        />
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900">Delete Company?</h3>
                <p className="text-sm text-slate-500">{confirmDelete.name}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              If this company has past orders, it will be <strong>deactivated</strong> instead of
              permanently deleted to preserve order history.
            </p>
            {deleteMsg && (
              <div className="bg-slate-50 text-slate-700 text-sm px-3 py-2 rounded-xl border border-slate-200">
                {deleteMsg}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-extrabold py-2.5 rounded-xl text-sm transition"
              >
                {deleting ? "Deleting..." : "Yes, Delete / Deactivate"}
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
