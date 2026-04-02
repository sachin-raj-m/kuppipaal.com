import { createServerClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Milk,
  CalendarDays,
  TrendingUp,
  Package,
  IndianRupee,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Plus,
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  if (status === "delivered")
    return (
      <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 text-xs px-2 py-0.5 rounded-full font-medium">
        <CheckCircle2 className="w-3 h-3" /> Delivered
      </span>
    );
  if (status === "skipped")
    return (
      <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 border border-orange-200 text-xs px-2 py-0.5 rounded-full font-medium">
        <MinusCircle className="w-3 h-3" /> Skipped
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 text-xs px-2 py-0.5 rounded-full font-medium">
      <XCircle className="w-3 h-3" /> Not Delivered
    </span>
  );
}

interface DeliveryRow {
  id: string;
  delivery_date: string;
  milk_quantity: number;
  extra_milk_quantity: number;
  curd_quantity: number;
  extra_curd_quantity: number;
  status: string;
  notes: string | null;
  profiles: { full_name: string } | null;
}

interface BillRow {
  id: string;
  bill_month: number;
  bill_year: number;
  total_milk_quantity: number;
  total_curd_quantity: number;
  total_amount: number;
  is_paid: boolean;
  paid_at: string | null;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n);
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch customer
  const { data: customer } = await supabase
    .from("customers")
    .select("*, route:routes(id, name)")
    .eq("id", id)
    .single();

  if (!customer) notFound();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  // Fetch last 30 deliveries + current month deliveries in one go
  const [{ data: recentDeliveries }, { data: bills }] = await Promise.all([
    supabase
      .from("deliveries")
      .select(
        "id, delivery_date, milk_quantity, extra_milk_quantity, curd_quantity, extra_curd_quantity, status, notes, profiles:delivery_personnel_id(full_name)"
      )
      .eq("customer_id", id)
      .order("delivery_date", { ascending: false })
      .limit(30),
    supabase
      .from("bills")
      .select(
        "id, bill_month, bill_year, total_milk_quantity, total_curd_quantity, total_amount, is_paid, paid_at"
      )
      .eq("customer_id", id)
      .order("bill_year", { ascending: false })
      .order("bill_month", { ascending: false })
      .limit(12),
  ]);

  // Current month stats from the same data
  const monthDeliveries = (recentDeliveries ?? []).filter(
    (d) => d.delivery_date >= monthStart && d.delivery_date <= monthEnd
  );
  const deliveredThisMonth = monthDeliveries.filter((d) => d.status === "delivered");

  const totalMilkMonth = deliveredThisMonth.reduce(
    (s, d) => s + Number(d.milk_quantity) + Number(d.extra_milk_quantity ?? 0),
    0
  );
  const totalCurdMonth = deliveredThisMonth.reduce(
    (s, d) => s + Number(d.curd_quantity) + Number(d.extra_curd_quantity ?? 0),
    0
  );

  const unpaidBills = (bills ?? []).filter((b) => !b.is_paid);
  const outstandingAmount = unpaidBills.reduce((s, b) => s + Number(b.total_amount), 0);

  const MONTHS = [
    "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back nav */}
      <Link
        href="/admin/customers"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Customers
      </Link>

      {/* Customer header card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shrink-0">
              <User className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{customer.name}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2">
                <span className="flex items-center gap-1.5 text-slate-500 text-sm">
                  <Phone className="w-4 h-4" />
                  {customer.phone || "—"}
                </span>
                <span className="flex items-center gap-1.5 text-slate-500 text-sm">
                  <MapPin className="w-4 h-4" />
                  {customer.address || "—"}
                </span>
                {customer.route && (
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-md text-sm font-medium">
                    <MapPin className="w-3 h-3" />
                    {customer.route.name}
                  </span>
                )}
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border ${
                    customer.is_active
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}
                >
                  {customer.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 text-sm shrink-0">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-2">
              Default Quantities
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-slate-700">
                <Milk className="w-4 h-4 text-blue-500" />
                <span className="font-semibold">{customer.default_milk_quantity} L</span>
                <span className="text-xs text-slate-400">milk</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <Package className="w-4 h-4 text-yellow-500" />
                <span className="font-semibold">{customer.default_curd_quantity} L</span>
                <span className="text-xs text-slate-400">curd</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid — current month */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          This Month ({MONTHS[now.getMonth()]} {now.getFullYear()})
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-medium text-slate-500">Deliveries</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{deliveredThisMonth.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">of {monthDeliveries.length} entries</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Milk className="w-4 h-4 text-sky-500" />
              <span className="text-xs font-medium text-slate-500">Total Milk</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{fmt(totalMilkMonth)}</p>
            <p className="text-xs text-slate-400 mt-0.5">litres</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-yellow-500" />
              <span className="text-xs font-medium text-slate-500">Total Curd</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{fmt(totalCurdMonth)}</p>
            <p className="text-xs text-slate-400 mt-0.5">litres</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <IndianRupee className="w-4 h-4 text-red-500" />
              <span className="text-xs font-medium text-slate-500">Outstanding</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">₹{fmt(outstandingAmount)}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {unpaidBills.length} unpaid bill{unpaidBills.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Recent deliveries table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-slate-500" />
          <h2 className="text-base font-bold text-slate-800">Recent Deliveries</h2>
          <span className="ml-auto text-xs text-slate-400">Last 30 entries</span>
        </div>

        {!recentDeliveries?.length ? (
          <div className="py-12 text-center text-slate-400">
            <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No delivery records yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Milk (L)
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Curd (L)
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    By
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(recentDeliveries as DeliveryRow[]).map((d) => {
                  const totalMilk =
                    Number(d.milk_quantity) + Number(d.extra_milk_quantity ?? 0);
                  const totalCurd =
                    Number(d.curd_quantity) + Number(d.extra_curd_quantity ?? 0);
                  const hasExtra =
                    Number(d.extra_milk_quantity) > 0 ||
                    Number(d.extra_curd_quantity) > 0;

                  return (
                    <tr key={d.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3 font-medium text-slate-700 whitespace-nowrap">
                        {new Date(d.delivery_date + "T00:00:00").toLocaleDateString("en-IN", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                      <td className="px-6 py-3 text-slate-700">
                        <span className="font-medium">{fmt(totalMilk)}</span>
                        {hasExtra && Number(d.extra_milk_quantity) > 0 && (
                          <span className="ml-1.5 text-xs text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5">
                            <Plus className="w-2.5 h-2.5" />
                            {fmt(Number(d.extra_milk_quantity))} extra
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-slate-700">
                        <span className="font-medium">{fmt(totalCurd)}</span>
                        {hasExtra && Number(d.extra_curd_quantity) > 0 && (
                          <span className="ml-1.5 text-xs text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5">
                            <Plus className="w-2.5 h-2.5" />
                            {fmt(Number(d.extra_curd_quantity))} extra
          
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <StatusBadge status={d.status} />
                      </td>
                      <td className="px-6 py-3 text-slate-500 text-xs">
                        {/* profiles can be null or an object */}
                        {(d.profiles as { full_name: string } | null)?.full_name ?? "—"}
                      </td>
                      <td className="px-6 py-3 text-slate-400 text-xs max-w-[180px] truncate">
                        {d.notes || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Billing history */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <IndianRupee className="w-5 h-5 text-slate-500" />
          <h2 className="text-base font-bold text-slate-800">Billing History</h2>
          <span className="ml-auto text-xs text-slate-400">Last 12 months</span>
        </div>

        {!bills?.length ? (
          <div className="py-12 text-center text-slate-400">
            <IndianRupee className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No bills generated yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Period
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Milk (L)
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Curd (L)
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Paid On
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(bills as BillRow[]).map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3 font-medium text-slate-700 whitespace-nowrap">
                      {MONTHS[b.bill_month - 1]} {b.bill_year}
                    </td>
                    <td className="px-6 py-3 text-slate-600">{fmt(b.total_milk_quantity)}</td>
                    <td className="px-6 py-3 text-slate-600">{fmt(b.total_curd_quantity)}</td>
                    <td className="px-6 py-3 font-semibold text-slate-800">
                      ₹{fmt(b.total_amount)}
                    </td>
                    <td className="px-6 py-3">
                      {b.is_paid ? (
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 text-xs px-2 py-0.5 rounded-full font-medium">
                          <CheckCircle2 className="w-3 h-3" /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 border border-orange-200 text-xs px-2 py-0.5 rounded-full font-medium">
                          <XCircle className="w-3 h-3" /> Unpaid
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-slate-400 text-xs">
                      {b.paid_at
                        ? new Date(b.paid_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
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
