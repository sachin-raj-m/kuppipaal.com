"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Plus, Search, Edit2, Trash2, MapPin, User, Phone, CheckCheck, AlertCircle, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

type Route = { id: string; name: string };
type Customer = {
  id: string;
  name: string;
  address: string;
  phone: string;
  routeId: string;
  route: Route;
  defaultMilkQuantity: number;
  defaultCurdQuantity: number;
};

interface CustomerApiResponse {
  id: string;
  name: string;
  address: string;
  phone: string;
  route_id: string;
  default_milk_quantity: number;
  default_curd_quantity: number;
  route?: Route;
}

type Notif = { type: "success" | "error"; msg: string };

function mapApiResponse(raw: CustomerApiResponse, routes: Route[]): Customer {
  return {
    id: raw.id,
    name: raw.name,
    address: raw.address,
    phone: raw.phone,
    routeId: raw.route_id,
    defaultMilkQuantity: Number(raw.default_milk_quantity),
    defaultCurdQuantity: Number(raw.default_curd_quantity),
    route: routes.find((r) => r.id === raw.route_id) ?? raw.route ?? { id: raw.route_id, name: "" },
  };
}

const inputCls = "border border-slate-300 rounded-xl p-2.5 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none w-full";

export default function CustomerManager({
  initialCustomers,
  routes,
}: {
  initialCustomers: Customer[];
  routes: Route[];
}) {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [filterRoute, setFilterRoute] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [notif, setNotif] = useState<Notif | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    routeId: "",
    defaultMilkQuantity: "0",
    defaultCurdQuantity: "0",
  });

  const notifTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = (type: "success" | "error", msg: string) => {
    if (notifTimer.current) clearTimeout(notifTimer.current);
    setNotif({ type, msg });
    notifTimer.current = setTimeout(() => setNotif(null), 4000);
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.address.toLowerCase().includes(search.toLowerCase());
    const matchesRoute = filterRoute ? c.routeId === filterRoute : true;
    return matchesSearch && matchesRoute;
  });

  const openForm = (customer?: Customer) => {
    if (customer) {
      setEditingId(customer.id);
      setFormData({
        name: customer.name,
        address: customer.address,
        phone: customer.phone,
        routeId: customer.routeId,
        defaultMilkQuantity: customer.defaultMilkQuantity.toString(),
        defaultCurdQuantity: customer.defaultCurdQuantity.toString(),
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", address: "", phone: "", routeId: routes[0]?.id || "", defaultMilkQuantity: "0", defaultCurdQuantity: "0" });
    }
    setIsFormOpen(true);
  };

  const closeForm = () => { setIsFormOpen(false); setEditingId(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      defaultMilkQuantity: parseFloat(formData.defaultMilkQuantity) || 0,
      defaultCurdQuantity: parseFloat(formData.defaultCurdQuantity) || 0,
    };
    try {
      const url = editingId ? `/api/customers/${editingId}` : "/api/customers";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) {
        const raw: CustomerApiResponse = await res.json();
        const mapped = mapApiResponse(raw, routes);
        if (editingId) {
          setCustomers((prev) => prev.map((c) => (c.id === editingId ? mapped : c)));
          notify("success", `${mapped.name} updated.`);
        } else {
          setCustomers((prev) => [...prev, mapped]);
          notify("success", `${mapped.name} added.`);
        }
        closeForm();
        router.refresh();
      } else {
        const { error } = await res.json();
        notify("error", error || "An error occurred.");
      }
    } catch {
      notify("error", "Failed to save. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCustomers((prev) => prev.filter((c) => c.id !== id));
        setConfirmDeleteId(null);
        notify("success", "Customer archived.");
        router.refresh();
      } else {
        const { error } = await res.json();
        notify("error", error || "Failed to archive.");
        setConfirmDeleteId(null);
      }
    } catch {
      notify("error", "Failed to archive. Please try again.");
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
        <div className="p-4 md:p-6 border-b border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none w-full"
              />
            </div>
            {!isFormOpen && (
              <button
                onClick={() => openForm()}
                className="flex items-center gap-1.5 bg-blue-600 text-white px-3 md:px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Customer</span>
                <span className="sm:hidden">Add</span>
              </button>
            )}
          </div>
          {routes.length > 1 && (
            <select
              value={filterRoute}
              onChange={(e) => setFilterRoute(e.target.value)}
              className="border border-slate-300 rounded-xl py-2 px-3 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-56"
            >
              <option value="">All Routes</option>
              {routes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          )}
        </div>

        {/* Add / Edit form */}
        {isFormOpen && (
          <div className="border-b border-slate-200 bg-blue-50/30 p-4 md:p-6">
            <h3 className="font-semibold text-slate-800 mb-4">{editingId ? "Edit Customer" : "New Customer"}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">Name *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputCls} required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">Phone *</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={inputCls} required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">Route *</label>
                  <select value={formData.routeId} onChange={(e) => setFormData({ ...formData, routeId: e.target.value })} className={inputCls} required>
                    {routes.length === 0 && <option value="" disabled>No routes — create one first</option>}
                    {routes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">Address *</label>
                  <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={inputCls} required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">Default Milk (L)</label>
                  <input type="number" step="0.5" min="0" value={formData.defaultMilkQuantity} onChange={(e) => setFormData({ ...formData, defaultMilkQuantity: e.target.value })} className={inputCls} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">Default Curd (L)</label>
                  <input type="number" step="0.5" min="0" value={formData.defaultCurdQuantity} onChange={(e) => setFormData({ ...formData, defaultCurdQuantity: e.target.value })} className={inputCls} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={closeForm} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 text-sm font-medium">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 text-sm font-medium">{editingId ? "Save Changes" : "Create"}</button>
              </div>
            </form>
          </div>
        )}

        {/* Customer list */}
        {filteredCustomers.length === 0 ? (
          <div className="py-14 text-center text-slate-400 flex flex-col items-center gap-2">
            <User className="w-10 h-10 text-slate-200" />
            <p className="text-sm">No customers found.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className="px-4 py-3.5 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="font-semibold text-blue-700 hover:underline text-sm leading-tight"
                      >
                        {customer.name}
                      </Link>
                      <span className="inline-flex items-center gap-0.5 bg-blue-50 text-blue-600 border border-blue-100 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                        <MapPin className="w-2.5 h-2.5" />{customer.route?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400 flex-wrap">
                      <span className="flex items-center gap-0.5"><Phone className="w-3 h-3" />{customer.phone}</span>
                      <span>Milk {customer.defaultMilkQuantity} L</span>
                      <span>Curd {customer.defaultCurdQuantity} L</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{customer.address}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openForm(customer)} className="p-2 text-slate-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-blue-50" title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {confirmDeleteId === customer.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(customer.id)} className="text-xs font-semibold text-red-600 px-2 py-1 rounded-lg bg-red-50 border border-red-200">
                          Delete?
                        </button>
                        <button onClick={() => setConfirmDeleteId(null)} className="text-xs text-slate-400 px-1">✕</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDeleteId(customer.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50" title="Archive">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <Link href={`/admin/customers/${customer.id}`} className="p-2 text-slate-300 hover:text-slate-500 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
