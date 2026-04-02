"use client";

import { useState, useRef } from "react";
import { Plus, Search, Edit2, Trash2, MapPin, CheckCheck, AlertCircle, Users } from "lucide-react";
import { useRouter } from "next/navigation";

type Route = { id: string; name: string; _count: { customers: number } };
type Notif = { type: "success" | "error"; msg: string };

export default function RouteManager({ initialRoutes }: { initialRoutes: Route[] }) {
  const router = useRouter();
  const [routes, setRoutes] = useState<Route[]>(initialRoutes);
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newRouteName, setNewRouteName] = useState("");
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [notif, setNotif] = useState<Notif | null>(null);

  const notifTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = (type: "success" | "error", msg: string) => {
    if (notifTimer.current) clearTimeout(notifTimer.current);
    setNotif({ type, msg });
    notifTimer.current = setTimeout(() => setNotif(null), 4000);
  };

  const filteredRoutes = routes.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRouteName.trim()) return;
    try {
      const res = await fetch("/api/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRouteName }),
      });
      if (res.ok) {
        const created = await res.json();
        setRoutes((prev) => [...prev, { ...created, _count: { customers: 0 } }]);
        setNewRouteName("");
        setIsAdding(false);
        notify("success", `Route "${created.name}" created.`);
        router.refresh();
      } else {
        const err = await res.json();
        notify("error", err.error || "Failed to create route.");
      }
    } catch {
      notify("error", "Network error.");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoute?.name.trim()) return;
    try {
      const res = await fetch(`/api/routes/${editingRoute.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingRoute.name }),
      });
      if (res.ok) {
        setRoutes((prev) => prev.map((r) => (r.id === editingRoute.id ? { ...r, name: editingRoute.name } : r)));
        notify("success", "Route updated.");
        setEditingRoute(null);
        router.refresh();
      } else {
        const err = await res.json();
        notify("error", err.error || "Failed to update.");
      }
    } catch {
      notify("error", "Network error.");
    }
  };

  const handleDelete = async (id: string) => {
    const route = routes.find((r) => r.id === id);
    if (route && route._count.customers > 0) {
      notify("error", "Cannot delete a route that has customers assigned.");
      setConfirmDeleteId(null);
      return;
    }
    try {
      const res = await fetch(`/api/routes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setRoutes((prev) => prev.filter((r) => r.id !== id));
        setConfirmDeleteId(null);
        notify("success", "Route deleted.");
        router.refresh();
      } else {
        const err = await res.json();
        notify("error", err.error || "Failed to delete.");
        setConfirmDeleteId(null);
      }
    } catch {
      notify("error", "Network error.");
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      {notif && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border ${notif.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          {notif.type === "success" ? <CheckCheck className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {notif.msg}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 md:p-6 border-b border-slate-200 bg-slate-50/50 flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search routes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none w-full"
            />
          </div>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-1.5 bg-blue-600 text-white px-3 md:px-4 py-2 rounded-xl hover:bg-blue-700 font-medium text-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Route</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}
        </div>

        {/* Add form */}
        {isAdding && (
          <div className="p-4 md:p-6 border-b border-slate-200 bg-blue-50/30">
            <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="E.g. North Zone, MG Road..."
                value={newRouteName}
                onChange={(e) => setNewRouteName(e.target.value)}
                className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                autoFocus
              />
              <div className="flex gap-2 shrink-0">
                <button type="submit" disabled={!newRouteName.trim()} className="flex-1 sm:flex-none bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700 disabled:opacity-50">
                  Save
                </button>
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 sm:flex-none bg-slate-100 text-slate-600 px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-slate-200">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Route list */}
        {filteredRoutes.length === 0 ? (
          <div className="py-14 text-center flex flex-col items-center gap-2 text-slate-400">
            <MapPin className="w-10 h-10 text-slate-200" />
            <p className="text-sm">No routes found.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredRoutes.map((route) => (
              <div key={route.id} className="px-4 py-3.5 hover:bg-slate-50/50 transition-colors flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  {editingRoute?.id === route.id ? (
                    <form onSubmit={handleUpdate} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingRoute.name}
                        onChange={(e) => setEditingRoute({ ...editingRoute, name: e.target.value })}
                        className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none min-w-0"
                        autoFocus
                      />
                      <button type="submit" className="text-blue-600 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-blue-50 shrink-0">Save</button>
                      <button type="button" onClick={() => setEditingRoute(null)} className="text-slate-400 text-xs shrink-0">✕</button>
                    </form>
                  ) : (
                    <>
                      <p className="font-semibold text-slate-800 text-sm">{route.name}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Users className="w-3 h-3" /> {route._count.customers} customer{route._count.customers !== 1 ? "s" : ""}
                      </p>
                    </>
                  )}
                </div>

                {!editingRoute && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setEditingRoute(route)} className="p-2 text-slate-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {confirmDeleteId === route.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(route.id)}
                          className="text-xs font-semibold text-red-600 px-2 py-1 rounded-lg bg-red-50 border border-red-200"
                        >
                          Delete?
                        </button>
                        <button onClick={() => setConfirmDeleteId(null)} className="text-xs text-slate-400 px-1">✕</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          if (route._count.customers > 0) { notify("error", "Remove all customers first."); return; }
                          setConfirmDeleteId(route.id);
                        }}
                        className={`p-2 rounded-lg transition-colors ${route._count.customers > 0 ? "text-slate-200 cursor-not-allowed" : "text-slate-400 hover:text-red-500 hover:bg-red-50"}`}
                        title={route._count.customers > 0 ? "Has customers assigned" : "Delete"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
