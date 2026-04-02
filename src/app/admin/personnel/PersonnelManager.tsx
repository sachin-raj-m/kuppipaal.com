"use client";

import { useState, useRef } from "react";
import {
  Plus, MapPin, UserCheck, UserX, Users, CheckCheck, AlertCircle,
  X, Trash2, ShieldCheck, Truck,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Personnel = { id: string; full_name: string; is_active: boolean };
type Route = { id: string; name: string };
type Assignment = { user_id: string; route_id: string };
type Notif = { type: "success" | "error"; msg: string };

const inputCls =
  "border border-slate-300 rounded-xl p-2.5 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none w-full";

function PersonCard({
  person,
  isCurrentUser,
  assignedRoutes,
  unassignedRoutes,
  isEditingRoute,
  onToggleActive,
  onDelete,
  onAssignRoute,
  onUnassignRoute,
  onStartAssign,
  onCancelAssign,
  confirmDeleteId,
  setConfirmDeleteId,
  showRoutes,
}: {
  person: Personnel;
  isCurrentUser: boolean;
  assignedRoutes: Route[];
  unassignedRoutes: Route[];
  isEditingRoute: boolean;
  onToggleActive: () => void;
  onDelete: () => void;
  onAssignRoute: (routeId: string) => void;
  onUnassignRoute: (routeId: string) => void;
  onStartAssign: () => void;
  onCancelAssign: () => void;
  confirmDeleteId: string | null;
  setConfirmDeleteId: (id: string | null) => void;
  showRoutes: boolean;
}) {
  return (
    <div className={`p-4 transition-colors ${person.is_active ? "hover:bg-slate-50/40" : "bg-slate-50/30 opacity-70"}`}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${person.is_active ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-400"}`}>
          {person.full_name.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-800 text-sm">{person.full_name}</span>
            {isCurrentUser && (
              <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-semibold">You</span>
            )}
            {!person.is_active && (
              <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full border border-slate-200">Inactive</span>
            )}
          </div>

          {showRoutes && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {assignedRoutes.length === 0 ? (
                <span className="text-xs text-slate-400 italic">No routes assigned</span>
              ) : (
                assignedRoutes.map((r) => (
                  <span key={r.id} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 text-xs px-2 py-0.5 rounded-full font-medium">
                    <MapPin className="w-2.5 h-2.5" />
                    {r.name}
                    <button onClick={() => onUnassignRoute(r.id)} className="ml-0.5 text-blue-400 hover:text-red-500 transition-colors" title="Remove">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
          {showRoutes && (
            isEditingRoute ? (
              <div className="flex items-center gap-1.5">
                <select
                  defaultValue=""
                  onChange={(e) => onAssignRoute(e.target.value)}
                  className="border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  autoFocus
                >
                  <option value="" disabled>Select route…</option>
                  {unassignedRoutes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <button onClick={onCancelAssign} className="text-slate-400 p-1 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onStartAssign}
                disabled={unassignedRoutes.length === 0}
                className="flex items-center gap-1 text-xs border border-slate-200 text-slate-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium"
              >
                <MapPin className="w-3 h-3" /> Route
              </button>
            )
          )}

          {/* Activate/deactivate */}
          <button
            onClick={onToggleActive}
            disabled={isCurrentUser}
            title={isCurrentUser ? "Cannot change your own status" : person.is_active ? "Deactivate" : "Activate"}
            className={`p-1.5 rounded-lg border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
              person.is_active ? "text-green-600 border-green-200 hover:bg-green-50" : "text-slate-400 border-slate-200 hover:bg-slate-100"
            }`}
          >
            {person.is_active ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
          </button>

          {/* Delete */}
          {confirmDeleteId === person.id ? (
            <div className="flex items-center gap-1">
              <button
                onClick={onDelete}
                className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-2.5 py-1.5 rounded-lg"
              >
                Delete?
              </button>
              <button onClick={() => setConfirmDeleteId(null)} className="text-xs text-slate-400 hover:text-slate-600 px-1">✕</button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDeleteId(person.id)}
              disabled={isCurrentUser}
              title={isCurrentUser ? "Cannot delete your own account" : "Delete permanently"}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PersonnelManager({
  initialDeliveryPersonnel,
  initialAdmins,
  routes,
  initialAssignments,
  currentUserId,
}: {
  initialDeliveryPersonnel: Personnel[];
  initialAdmins: Personnel[];
  routes: Route[];
  initialAssignments: Assignment[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [deliveryPersonnel, setDeliveryPersonnel] = useState<Personnel[]>(initialDeliveryPersonnel);
  const [admins, setAdmins] = useState<Personnel[]>(initialAdmins);
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [notif, setNotif] = useState<Notif | null>(null);
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "", role: "DELIVERY_PERSONNEL" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const notifTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = (type: "success" | "error", msg: string) => {
    if (notifTimer.current) clearTimeout(notifTimer.current);
    setNotif({ type, msg });
    notifTimer.current = setTimeout(() => setNotif(null), 4000);
  };

  const getRoutes = (userId: string) =>
    assignments.filter((a) => a.user_id === userId).map((a) => routes.find((r) => r.id === a.route_id)).filter(Boolean) as Route[];

  const getUnassignedRoutes = (userId: string) =>
    routes.filter((r) => !assignments.some((a) => a.user_id === userId && a.route_id === r.id));

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
        const person: Personnel = { id: newUser.id, full_name: newUser.full_name, is_active: true };
        if (newUser.role === "ADMIN") setAdmins((prev) => [...prev, person]);
        else setDeliveryPersonnel((prev) => [...prev, person]);
        setFormData({ fullName: "", email: "", password: "", role: "DELIVERY_PERSONNEL" });
        setIsFormOpen(false);
        notify("success", `${newUser.full_name} added as ${newUser.role === "ADMIN" ? "Admin" : "Delivery Personnel"}.`);
        router.refresh();
      } else {
        const err = await res.json();
        notify("error", err.error || "Failed to create account.");
      }
    } catch {
      notify("error", "Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, isAdmin: boolean) => {
    const list = isAdmin ? admins : deliveryPersonnel;
    const person = list.find((p) => p.id === id);
    if (!person) return;
    try {
      const res = await fetch(`/api/personnel/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !person.is_active }),
      });
      if (res.ok) {
        const update = (prev: Personnel[]) => prev.map((p) => p.id === id ? { ...p, is_active: !person.is_active } : p);
        if (isAdmin) setAdmins(update); else setDeliveryPersonnel(update);
        notify("success", `${person.full_name} ${!person.is_active ? "activated" : "deactivated"}.`);
      } else {
        notify("error", "Failed to update status.");
      }
    } catch {
      notify("error", "Network error.");
    }
  };

  const handleDelete = async (id: string, isAdmin: boolean) => {
    setConfirmDeleteId(null);
    try {
      const res = await fetch(`/api/personnel/${id}`, { method: "DELETE" });
      if (res.ok) {
        if (isAdmin) setAdmins((prev) => prev.filter((p) => p.id !== id));
        else setDeliveryPersonnel((prev) => prev.filter((p) => p.id !== id));
        notify("success", "Account deleted permanently.");
        router.refresh();
      } else {
        const err = await res.json();
        notify("error", err.error || "Failed to delete.");
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
        notify("success", "Route assigned.");
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

  const totalCount = admins.length + deliveryPersonnel.length;

  return (
    <div className="space-y-4">
      {notif && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border ${notif.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          {notif.type === "success" ? <CheckCheck className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {notif.msg}
        </div>
      )}

      {/* Header + Add button */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 md:p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2 text-slate-700">
            <Users className="w-5 h-5 text-slate-400" />
            <span className="font-semibold text-sm md:text-base">{totalCount} Total Accounts</span>
          </div>
          {!isFormOpen && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-1.5 bg-blue-600 text-white px-3 md:px-4 py-2 rounded-xl hover:bg-blue-700 font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Account</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}
        </div>

        {/* Create form */}
        {isFormOpen && (
          <div className="p-4 md:p-5 border-b border-slate-200 bg-blue-50/30">
            <h3 className="font-semibold text-slate-800 mb-4 text-sm">New Account</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">Full Name *</label>
                  <input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className={inputCls} required placeholder="e.g. Ravi Kumar" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">Email *</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputCls} required placeholder="ravi@example.com" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">Password *</label>
                  <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className={inputCls} required minLength={6} placeholder="Min. 6 characters" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className={inputCls}
                  >
                    <option value="DELIVERY_PERSONNEL">Delivery Personnel</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setIsFormOpen(false)} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                  {isSubmitting ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Admin section ─────────────────────────────────────── */}
        <div className="border-b border-slate-100">
          <div className="px-4 py-2.5 bg-slate-50 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Admins</span>
            <span className="ml-auto text-xs text-slate-400">{admins.length}</span>
          </div>
          {admins.length === 0 ? (
            <div className="px-4 py-5 text-sm text-slate-400 text-center italic">No admin accounts.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {admins.map((person) => (
                <PersonCard
                  key={person.id}
                  person={person}
                  isCurrentUser={person.id === currentUserId}
                  assignedRoutes={[]}
                  unassignedRoutes={[]}
                  isEditingRoute={false}
                  onToggleActive={() => handleToggleActive(person.id, true)}
                  onDelete={() => handleDelete(person.id, true)}
                  onAssignRoute={() => {}}
                  onUnassignRoute={() => {}}
                  onStartAssign={() => {}}
                  onCancelAssign={() => {}}
                  confirmDeleteId={confirmDeleteId}
                  setConfirmDeleteId={setConfirmDeleteId}
                  showRoutes={false}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Delivery Personnel section ─────────────────────────── */}
        <div>
          <div className="px-4 py-2.5 bg-slate-50 flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Delivery Personnel</span>
            <span className="ml-auto text-xs text-slate-400">{deliveryPersonnel.length}</span>
          </div>
          {deliveryPersonnel.length === 0 ? (
            <div className="px-4 py-8 text-center flex flex-col items-center gap-2 text-slate-400">
              <Truck className="w-10 h-10 text-slate-200" />
              <p className="text-sm font-medium text-slate-500">No delivery personnel yet.</p>
              <p className="text-xs">Add your first delivery person above.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {deliveryPersonnel.map((person) => (
                <PersonCard
                  key={person.id}
                  person={person}
                  isCurrentUser={person.id === currentUserId}
                  assignedRoutes={getRoutes(person.id)}
                  unassignedRoutes={getUnassignedRoutes(person.id)}
                  isEditingRoute={editingAssignmentId === person.id}
                  onToggleActive={() => handleToggleActive(person.id, false)}
                  onDelete={() => handleDelete(person.id, false)}
                  onAssignRoute={(routeId) => handleAssignRoute(person.id, routeId)}
                  onUnassignRoute={(routeId) => handleUnassignRoute(person.id, routeId)}
                  onStartAssign={() => setEditingAssignmentId(person.id)}
                  onCancelAssign={() => setEditingAssignmentId(null)}
                  confirmDeleteId={confirmDeleteId}
                  setConfirmDeleteId={setConfirmDeleteId}
                  showRoutes={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
