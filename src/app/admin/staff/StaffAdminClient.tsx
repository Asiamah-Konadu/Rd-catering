"use client";

import { useState } from "react";
import type { UserRole } from "@prisma/client";

export type StaffUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
};

const ROLE_OPTIONS: { label: string; value: UserRole; desc: string; color: string }[] = [
  { label: "Admin", value: "ADMIN", desc: "Full access to all system modules and staff setup", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { label: "Menu Manager", value: "MENU_MANAGER", desc: "Manage food items, categories, and availability", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { label: "Order Handler", value: "ORDER_HANDLER", desc: "Kitchen order queue and status progression", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { label: "Delivery Agent", value: "DELIVERY_AGENT", desc: "Dispatch portal and order delivery updates", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
];

export function StaffAdminClient({
  initialStaff,
  currentUserId,
}: {
  initialStaff: StaffUser[];
  currentUserId?: string;
}) {
  const [staff, setStaff] = useState<StaffUser[]>(initialStaff);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "ORDER_HANDLER" as UserRole,
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create staff member");
      }

      setStaff((prev) => [data, ...prev]);
      showToast(`Staff account created for ${data.name} (${data.role})`);
      setIsModalOpen(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "ORDER_HANDLER",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create staff member";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userToToggle: StaffUser) => {
    if (userToToggle.id === currentUserId) {
      alert("You cannot deactivate your own logged-in admin account.");
      return;
    }

    const newStatus = !userToToggle.isActive;
    try {
      const res = await fetch(`/api/admin/staff/${userToToggle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });

      const updated = await res.json();
      if (!res.ok) throw new Error(updated.error);

      setStaff((prev) =>
        prev.map((s) => (s.id === userToToggle.id ? { ...s, isActive: updated.isActive } : s))
      );
      showToast(`Account ${updated.name} ${updated.isActive ? "activated" : "deactivated"}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update account status";
      alert(message);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const res = await fetch(`/api/admin/staff/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const updated = await res.json();
      if (!res.ok) throw new Error(updated.error);

      setStaff((prev) =>
        prev.map((s) => (s.id === userId ? { ...s, role: updated.role } : s))
      );
      showToast(`Role updated to ${updated.role} for ${updated.name}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update role";
      alert(message);
    }
  };

  const filteredStaff = staff.filter((s) => {
    const matchesRole = selectedRoleFilter === "ALL" ? true : s.role === selectedRoleFilter;
    const matchesSearch =
      searchQuery.trim() === "" ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.phone && s.phone.includes(searchQuery));
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in">
          <span className="text-amber-400 font-bold">✓</span>
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Header controls & Provision Button */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <button
            onClick={() => setSelectedRoleFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              selectedRoleFilter === "ALL"
                ? "bg-purple-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All Roles ({staff.length})
          </button>
          {ROLE_OPTIONS.map((opt) => {
            const count = staff.filter((s) => s.role === opt.value).length;
            return (
              <button
                key={opt.value}
                onClick={() => setSelectedRoleFilter(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedRoleFilter === opt.value
                    ? "bg-purple-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {opt.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-48"
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm whitespace-nowrap transition"
          >
            + Provision Staff
          </button>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredStaff.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="font-medium">No staff members match the criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-xs">
                  <th className="p-4">Staff Name & Contact</th>
                  <th className="p-4">Role Permission</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.map((member) => {
                  const roleObj = ROLE_OPTIONS.find((r) => r.value === member.role);
                  const isSelf = member.id === currentUserId;
                  return (
                    <tr key={member.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          {member.name}
                          {isSelf && (
                            <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">{member.email}</div>
                        {member.phone && (
                          <div className="text-xs text-slate-400">{member.phone}</div>
                        )}
                      </td>

                      <td className="p-4">
                        <select
                          value={member.role}
                          onChange={(e) =>
                            handleRoleChange(member.id, e.target.value as UserRole)
                          }
                          disabled={isSelf}
                          className={`text-xs font-extrabold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${
                            roleObj?.color || "bg-slate-100"
                          }`}
                        >
                          {ROLE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                            member.isActive
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              member.isActive ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                          {member.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="p-4 text-xs text-slate-500">
                        {new Date(member.createdAt).toLocaleDateString("en-GH", {
                          dateStyle: "medium",
                        })}
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleToggleActive(member)}
                          disabled={isSelf}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                            member.isActive
                              ? "border-rose-200 text-rose-700 hover:bg-rose-50"
                              : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          } ${isSelf ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {member.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Provision Staff Member */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold text-slate-900">
                Provision New Staff Member
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ama Serwaa"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Staff Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="staff@rdcatering.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+233 24 123 4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Initial Password * (Min 8 chars)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Assign Staff Role *
                </label>
                <div className="space-y-2">
                  {ROLE_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        formData.role === opt.value
                          ? "border-purple-600 bg-purple-50/50"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="staffRole"
                        value={opt.value}
                        checked={formData.role === opt.value}
                        onChange={() => setFormData({ ...formData, role: opt.value })}
                        className="mt-0.5 accent-purple-600"
                      />
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{opt.label}</span>
                        <p className="text-xs text-slate-500">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white text-sm font-bold rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
