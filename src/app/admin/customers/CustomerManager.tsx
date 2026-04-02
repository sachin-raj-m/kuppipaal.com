"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Plus, Search, Edit2, Trash2, MapPin, User, Phone, CheckCheck, AlertCircle } from "lucide-react";
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
      setFormData({
        name: "",
        address: "",
        phone: "",
        routeId: routes[0]?.id || "",
        defaultMilkQuantity: "0",
        defaultCurdQuantity: "0",
      });
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

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
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const raw: CustomerApiResponse = await res.json();
        const mapped = mapApiResponse(raw, routes);
        if (editingId) {
          setCustomers((prev) => prev.map((c) => (c.id === editingId ? mapped : c)));
          notify("success", `${mapped.name} updated successfully.`);
        } else {
          setCustomers((prev) => [...prev, mapped]);
          notify("success", `${mapped.name} added successfully.`);
        }
        closeForm();
        router.refresh();
      } else {
        const { error } = await res.json();
        notify("error", error || "An error occurred.");
      }
    } catch {
      notify("error", "Failed to save customer. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCustomers((prev) => prev.filter((c) => c.id !== id));
        setConfirmDeleteId(null);
        notify("success", "Customer archived successfully.");
        router.refresh();
      } else {
        const { error } = await res.json();
        notify("error", error || "Failed to archive customer.");
        setConfirmDeleteId(null);
      }
    } catch {
      notify("error", "Failed to archive customer. Please try again.");
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
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, phone or address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full"
              />
            </div>
            <select
              value={filterRoute}
              onChange={(e) => setFilterRoute(e.target.value)}
              className="border border-slate-300 rounded-lg py-2 px-3 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none min-w-[200px]"
            >
              <option value="">All Routes</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {!isFormOpen && (
            <button
              onClick={() => openForm()}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm w-full sm:w-auto shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Customer
            </button>
          )}
        </div>

        {isFormOpen && (
          <div className="border-b border-slate-200 bg-blue-50/30 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">{editingId ? "Edit Customer" : "New Customer"}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="border border-slate-300 rounded-md p-2 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="border border-slate-300 rounded-md p-2 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Assigned Route *</label>
                <select
                  value={formData.routeId}
                  onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                  className="border border-slate-300 bg-white rounded-md p-2 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  {routes.length === 0 && (
                    <option value="" disabled>No routes available — create one first</option>
                  )}
                  {routes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1 md:col-span-2 lg:col-span-3">
                <label className="text-sm font-medium text-slate-700">Address *</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="border border-slate-300 rounded-md p-2 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Default Milk (Liters)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.defaultMilkQuantity}
                  onChange={(e) => setFormData({ ...formData, defaultMilkQuantity: e.target.value })}
                  className="border border-slate-300 rounded-md p-2 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Default Curd (Liters)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.defaultCurdQuantity}
                  onChange={(e) => setFormData({ ...formData, defaultCurdQuantity: e.target.value })}
                  className="border border-slate-300 rounded-md p-2 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="lg:col-span-1 flex items-end justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-50 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  {editingId ? "Save Changes" : "Create Customer"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Customer Details</th>
                <th className="px-6 py-4 font-medium">Route</th>
                <th className="px-6 py-4 font-medium">Default Orders</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <User className="w-8 h-8 text-slate-300" />
                      <p>No customers found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="font-semibold text-blue-700 hover:text-blue-900 hover:underline transition-colors"
                        >
                          {customer.name}
                        </Link>
                        <span className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                          <Phone className="w-3 h-3" /> {customer.phone}
                        </span>
                        <span
                          className="text-xs text-slate-400 mt-1 max-w-[200px] truncate"
                          title={customer.address}
                        >
                          {customer.address}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm font-medium border border-blue-100">
                        <MapPin className="w-3 h-3" />
                        {customer.route?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-sm">
                        <span className="text-slate-600">
                          Milk: <span className="font-semibold text-slate-800">{customer.defaultMilkQuantity} L</span>
                        </span>
                        <span className="text-slate-600">
                          Curd: <span className="font-semibold text-slate-800">{customer.defaultCurdQuantity} L</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openForm(customer)}
                          className="text-slate-400 hover:text-blue-500 transition-colors p-1"
                          title="Edit Customer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {confirmDeleteId === customer.id ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleDelete(customer.id)}
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
                            onClick={() => setConfirmDeleteId(customer.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                            title="Archive Customer"
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
