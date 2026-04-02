"use client";

import { useState, useRef } from "react";
import { Plus, MapPin, UserCheck, UserX, Users, CheckCheck, AlertCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";

type Personnel = {
  id: string;
  full_name: string;
  is_active: boolean;
};

type Route = { id: string; name: string };
type Assignment = { user_id: string; route_id: string };
type Notif = { type: "success" | "error"; msg: string };

export default function PersonnelManager({
  initialPersonnel,
  routes,
  initialAssignments,
}: {
  initialPersonnel: Personnel[];
  routes: Route[];
  initialAssignments: Assignment[];
}) {
  const router = useRouter();
  const [personnel, setPersonnel] = useState<Personnel[]>(initialPersonnel);
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [notif, setNotif] = useState<Notif | null>(null);
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);

  const notifTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = (type: "success" | "error", msg: string) => {
    if (notifTimer.current) clearTimeout(notifTimer.current);
    setNotif({ type, msg });
    notifTimer.current = setTimeout(() => setNotif(null), 4000);
  };

  const getPersonnelRoutes = (userId: string) =>
    assignments
      .filter((a) => a.user_id === userId)
      .map((a) => routes.find((r) => r.id === a.route_id))
      .filter(Boolean) as Route[];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/personnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const newUser = await res.json();
        setPersonnel((prev) => [...prev, { id: newUser.id, full_name: newUser.full_name, is_active: true }]);
        setFormData({ fullName: "", email: "", password: "" });
        setIsFormOpen(false);
        notify("success", `${newUser.full_name} added successfully.`);
        router.refresh();
      } else {
        const err = await res.json();
        notify("error", err.error || "Failed to create personnel.");
      }
    } catch {
      notify("error", "Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/personnel/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentActive }),
      });
      if (res.ok) {
        setPersonnel((prev) =>
          prev.map((p) => (p.id === id ? { ...p, is_active: !currentActive } : p))
        );
        notify("success", `Personnel ${!currentActive ? "activated" : "deactivated"}.`);
      } else {
        notify("error", "Failed to update status.");
      }
    } catch {
      notify("error", "Network error.");
    }
  };

  const handleAssignRoute = async (userId: string, routeId: string) => {
    if (!routeId) return;
    setEditingAssignmentId(null);
    try {
      const res = await fetch(`/api/personnel/${userId}/routes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routeId }),
      });
      if (res.ok) {
        setAssignments((prev) => [...prev, { user_id: userId, route_id: routeId }]);
        notify("success", "Route assigned successfully.");
      } else {
        const err = await res.json();
        notify("error", err.error || "Failed to assign route.");
      }
    } catch {
      notify("error", "Network error.");
    }
  };

  const handleUnassignRoute = async (userId: string, routeId: string) => {
    try {
      const res = await fetch(`/api/personnel/${userId}/routes/${routeId}`, { method: "DELETE" });
      if (res.ok) {
        setAssignments((prev) => prev.filter((a) => !(a.user_id === userId && a.route_id === routeId)));
        notify("success", "Route removed.");
      } else {
        notify("error", "Failed to remove route.");
      }
    } catch {
      notify("error", "Network error.");
    }
  };

  return (
    <div className="space-y-4">
      {notif && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium border ${
            notif.type === "success"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {notif.type === "success" ? (
            <CheckCheck className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          {notif.msg}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2 text-slate-700">
            <Users className="w-5 h-5 text-slate-400" />
            <span className="font-semibold text-sm md:text-base">{personnel.length} Personnel</span>
          </div>
          {!isFormOpen && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-1.5 bg-blue-600 text-white px-3 md:px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Personnel</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}
        </div>

        {isFormOpen && (
          <div className="p-4 md:p-6 border-b border-slate-200 bg-blue-50/30">
            <h3 className="font-semibold text-slate-800 mb-4 text-sm md:text-base">New Delivery Personnel</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">Full Name *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="border border-slate-300 rounded-xl p-2.5 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                    placeholder="e.g. Ravi Kumar"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="border border-slate-300 rounded-xl p-2.5 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                    placeholder="ravi@example.com"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="border border-slate-300 rounded-xl p-2.5 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                    minLength={6}
                    placeholder="Min. 6 characters"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setIsFormOpen(false)} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                  {isSubmitting ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        )}

        {personnel.length === 0 ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-2">
            <Users className="w-12 h-12 text-slate-200" />
            <p className="font-medium text-slate-500">No delivery personnel yet.</p>
            <p className="text-sm">Add your first delivery person above.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {personnel.map((person) => {
              const assignedRoutes = getPersonnelRoutes(person.id);
              const unassignedRoutes = routes.filter(
                (r) => !assignments.some((a) => a.user_id === person.id && a.route_id === r.id)
              );

              return (
                <div key={person.id} className={`p-5 transition-colors ${person.is_active ? "hover:bg-slate-50/50" : "bg-slate-50/30 opacity-70"}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                          person.is_active ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {person.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-800">{person.full_name}</span>
                          {!person.is_active && (
                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
                              Inactive
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {assignedRoutes.length === 0 ? (
                            <span className="text-xs text-slate-400 italic">No routes assigned</span>
                          ) : (
                            assignedRoutes.map((r) => (
                              <span
                                key={r.id}
                                className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 text-xs px-2 py-0.5 rounded-full font-medium"
                              >
                                <MapPin className="w-2.5 h-2.5" />
                                {r.name}
                                <button
                                  onClick={() => handleUnassignRoute(person.id, r.id)}
                                  className="ml-0.5 text-blue-400 hover:text-red-500 transition-colors"
                                  title="Remove route"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pl-13 sm:pl-0">
                      {editingAssignmentId === person.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            defaultValue=""
                            onChange={(e) => handleAssignRoute(person.id, e.target.value)}
                            className="border border-slate-300 rounded-md px-2 py-1.5 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                            autoFocus
                          >
                            <option value="" disabled>Select route…</option>
                            {unassignedRoutes.map((r) => (
                              <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => setEditingAssignmentId(null)}
                            className="text-slate-400 text-xs hover:text-slate-600 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingAssignmentId(person.id)}
                          disabled={unassignedRoutes.length === 0}
                          className="flex items-center gap-1.5 text-xs border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                          title={unassignedRoutes.length === 0 ? "All routes assigned" : "Assign a route"}
                        >
                          <MapPin className="w-3 h-3" />
                          Assign Route
                        </button>
                      )}

                      <button
                        onClick={() => handleToggleActive(person.id, person.is_active)}
                        className={`p-1.5 rounded-lg transition-colors border ${
                          person.is_active
                            ? "text-green-600 border-green-100 hover:bg-green-50"
                            : "text-slate-400 border-slate-200 hover:bg-slate-100"
                        }`}
                        title={person.is_active ? "Deactivate" : "Activate"}
                      >
                        {person.is_active ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
