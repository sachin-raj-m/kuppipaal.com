import { IndianRupee, MapPin, Users, Truck } from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";
import type { DeliveryStatus } from "@/lib/types";

interface RecentDelivery {
  id: string;
  milk_quantity: number;
  curd_quantity: number;
  status: DeliveryStatus;
  customer: { name: string; route: { name: string } | null } | null;
  delivery_personnel: { full_name: string } | null;
}

// Static class maps to prevent Tailwind from purging dynamic class names
const statIconClass: Record<string, string> = {
  orange: "bg-orange-100 text-orange-600",
  blue:   "bg-blue-100 text-blue-600",
  purple: "bg-purple-100 text-purple-600",
  green:  "bg-green-100 text-green-600",
};

const statusBadgeClass: Record<string, string> = {
  delivered:     "bg-green-100 text-green-700",
  not_delivered: "bg-red-100 text-red-700",
  skipped:       "bg-orange-100 text-orange-700",
};

export default async function AdminDashboard() {
  const supabase = await createServerClient();

  const [{ count: customerCount }, { count: routeCount }, { count: deliveriesToday }, { data: recentDeliveries }] =
    await Promise.all([
      supabase.from("customers").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("routes").select("*", { count: "exact", head: true }),
      supabase
        .from("deliveries")
        .select("*", { count: "exact", head: true })
        .eq("delivery_date", new Date().toISOString().split("T")[0]),
      supabase
        .from("deliveries")
        .select("*, customer:customers(name, route:routes(name)), delivery_personnel:profiles(full_name)")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const stats = [
    { label: "Active Customers",  value: customerCount ?? 0, icon: Users,         color: "orange" },
    { label: "Deliveries Today",  value: deliveriesToday ?? 0, icon: Truck,        color: "blue" },
    { label: "Total Routes",      value: routeCount ?? 0,     icon: MapPin,        color: "purple" },
    { label: "Revenue (Month)",   value: "₹—",                icon: IndianRupee,   color: "green" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-slate-500">Welcome back. Here&apos;s what&apos;s happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
              <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${statIconClass[color]}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden border-t-4 border-t-blue-500">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Recent Deliveries</h2>
        </div>
        {!recentDeliveries?.length ? (
          <div className="py-10 text-center text-slate-400">No recent deliveries found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Route</th>
                  <th className="px-6 py-3 text-center">Milk</th>
                  <th className="px-6 py-3 text-center">Curd</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-right">By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(recentDeliveries as RecentDelivery[]).map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3 font-medium text-slate-800">{d.customer?.name}</td>
                    <td className="px-6 py-3 text-slate-500">{d.customer?.route?.name}</td>
                    <td className="px-6 py-3 text-center">{d.milk_quantity} L</td>
                    <td className="px-6 py-3 text-center">{d.curd_quantity} L</td>
                    <td className="px-6 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadgeClass[d.status] ?? "bg-slate-100 text-slate-600"}`}>
                        {d.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right text-slate-500 italic">{d.delivery_personnel?.full_name}</td>
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
