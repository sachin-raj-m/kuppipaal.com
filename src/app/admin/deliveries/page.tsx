import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Truck } from "lucide-react";

interface DeliveryRow {
  id: string;
  delivery_date: string;
  milk_quantity: number;
  curd_quantity: number;
  status: string;
  customer: { name: string; route: { name: string } | null } | null;
  delivery_personnel: { full_name: string } | null;
}

export default async function AdminDeliveriesPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: deliveries } = await supabase
    .from("deliveries")
    .select("*, customer:customers(name, route:routes(name)), delivery_personnel:profiles(full_name)")
    .order("delivery_date", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Delivery History</h1>
        <p className="text-slate-500">View and audit all delivery logs across routes.</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
          <Truck className="w-5 h-5 text-slate-400" />
          <h2 className="font-semibold text-slate-700">Recent 50 Entries</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer &amp; Route</th>
                <th className="px-6 py-4 text-center">Milk</th>
                <th className="px-6 py-4 text-center">Curd</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Personnel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!deliveries?.length ? (
                <tr><td colSpan={6} className="py-12 text-center text-slate-400">No delivery history found.</td></tr>
              ) : (deliveries as DeliveryRow[]).map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-3 text-slate-600">{new Date(d.delivery_date).toLocaleDateString()}</td>
                  <td className="px-6 py-3">
                    <div className="font-semibold text-slate-800">{d.customer?.name}</div>
                    <div className="text-xs text-slate-500">{d.customer?.route?.name}</div>
                  </td>
                  <td className="px-6 py-3 text-center">{d.milk_quantity} L</td>
                  <td className="px-6 py-3 text-center">{d.curd_quantity} L</td>
                  <td className="px-6 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${d.status === "delivered" ? "bg-green-100 text-green-700" : d.status === "not_delivered" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
                      {d.status.replaceAll("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right text-slate-500 italic">{d.delivery_personnel?.full_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
