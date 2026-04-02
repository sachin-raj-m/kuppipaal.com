"use client";

import { useState, useRef } from "react";
import { Plus, Search, Edit2, Trash2, MapPin, CheckCheck, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

type Route = {
  id: string;
  name: string;
  _count: { customers: number };
};

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
        const createdRoute = await res.json();
        setRoutes((prev) => [...prev, { ...createdRoute, _count: { customers: 0 } }]);
        setNewRouteName("");
        setIsAdding(false);
        notify("success", `Route "${createdRoute.name}" created.`);
        router.refresh();
      } else {
        const err = await res.json();
        notify("error", err.error || "Failed to create route.");
      }
    } catch {
      notify("error", "Network error. Failed to create route.");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoute || !editingRoute.name.trim()) return;

    try {
      const res = await fetch(`/api/routes/${editingRoute.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingRoute.name }),
      });
      if (res.ok) {
        setRoutes((prev) =>
          prev.map((r) => (r.id === editingRoute.id ? { ...r, name: editingRoute.name } : r))
        );
        notify("success", "Route name updated.");
        setEditingRoute(null);
        router.refresh();
      } else {
        const err = await res.json();
        notify("error", err.error || "Failed to update route.");
      }
    } catch {
      notify("error", "Network error. Failed to update route.");
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
        notify("error", err.error || "Failed to delete route.");
        setConfirmDeleteId(null);
      }
    } catch {
      notify("error", "Network error. Failed to delete route.");
      setConfirmDeleteId(null);
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
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search routes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full sm:w-64"
            />
          </div>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Route
            </button>
          )}
        </div>

        {isAdding && (
          <div className="p-6 border-b border-slate-200 bg-blue-50/30">
            <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="E.g., North Zone, MG Road"
                value={newRouteName}
                onChange={(e) => setNewRouteName(e.target.value)}
                className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  disabled={!newRouteName.trim()}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Route Name</th>
                <th className="px-6 py-4 font-medium text-right">Customers</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRoutes.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <MapPin className="w-8 h-8 text-slate-300" />
                      <p>No routes found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRoutes.map((route) => (
                  <tr key={route.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      {editingRoute?.id === route.id ? (
                        <form onSubmit={handleUpdate} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingRoute.name}
                            onChange={(e) => setEditingRoute({ ...editingRoute, name: e.target.value })}
                            className="border border-slate-300 rounded-md px-3 py-1 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                            autoFocus
                          />
                          <button type="submit" className="text-blue-600 text-sm font-medium hover:underline">
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingRoute(null)}
                            className="text-slate-500 text-sm hover:underline"
                          >
                            Cancel
                          </button>
                        </form>
                      ) : (
                        <div className="font-medium text-slate-800 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          {route.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center justify-center bg-slate-100 px-3 py-1 rounded-full text-slate-600 font-medium text-sm">
                        {route._count.customers}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingRoute(route)}
                          className="text-slate-400 hover:text-blue-500 transition-colors p-1"
                          aria-label="Edit route"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {confirmDeleteId === route.id ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleDelete(route.id)}
                              className="text-xs font-semibold text-red-600 hover:text-red-700 px-2 py-1 rounded bg-red-50 border border-red-200"
                            >
                              Confirm?
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs text-slate-400 hover:text-slate-600"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              if (route._count.customers > 0) {
                                notify("error", "Cannot delete a route that has customers assigned.");
                                return;
                              }
                              setConfirmDeleteId(route.id);
                            }}
                            className={`p-1 transition-colors ${
                              route._count.customers > 0
                                ? "text-slate-300 cursor-not-allowed"
                                : "text-slate-400 hover:text-red-500"
                            }`}
                            title={
                              route._count.customers > 0
                                ? "Cannot delete route with assigned customers"
                                : "Delete route"
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
