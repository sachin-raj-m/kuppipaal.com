import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DeliveryEntryList from "./DeliveryEntryList";
import type { DeliveryStatus, DeliveryRecord } from "@/lib/types";

interface CustomerRow {
  id: string;
  name: string;
  address: string;
  default_milk_quantity: number;
  default_curd_quantity: number;
  route: { name: string } | null;
}

interface RouteAssignment {
  route_id: string;
}

interface DeliveryRow {
  id: string;
  customer_id: string;
  status: string;
  milk_quantity: number;
  extra_milk_quantity: number;
  curd_quantity: number;
  extra_curd_quantity: number;
  notes: string | null;
}

// Static class maps to prevent Tailwind from purging dynamic class names
const statStyles: Record<string, { card: string; label: string; value: string }> = {
  blue:   { card: "bg-blue-50 border-blue-100",   label: "text-blue-800",   value: "text-blue-900" },
  green:  { card: "bg-green-50 border-green-100",  label: "text-green-800",  value: "text-green-900" },
  orange: { card: "bg-orange-50 border-orange-100", label: "text-orange-800", value: "text-orange-900" },
};

export default async function DeliveryPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date().toISOString().split("T")[0];

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  let customers: CustomerRow[] = [];

  if (profile?.role === "ADMIN") {
    const { data } = await supabase
      .from("customers")
      .select("*, route:routes(name)")
      .eq("is_active", true)
      .order("name");
    customers = (data as CustomerRow[]) || [];
  } else {
    const { data: assignments } = await supabase
      .from("route_assignments")
      .select("route_id")
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (assignments && assignments.length > 0) {
      const routeIds = (assignments as RouteAssignment[]).map((a) => a.route_id);
      const { data } = await supabase
        .from("customers")
        .select("*, route:routes(name)")
        .in("route_id", routeIds)
        .eq("is_active", true)
        .order("name");
      customers = (data as CustomerRow[]) || [];
    }
  }

  const { data: deliveriesData } = customers.length
    ? await supabase
        .from("deliveries")
        .select("*")
        .in("customer_id", customers.map((c) => c.id))
        .eq("delivery_date", today)
    : { data: [] };

  const deliveries = (deliveriesData as DeliveryRow[]) || [];
  const completed = deliveries.filter((d) => d.status === "delivered").length;

  const mappedCustomers = customers.map((c) => ({
    id: c.id,
    name: c.name,
    address: String(c.address ?? ""),
    defaultMilkQuantity: c.default_milk_quantity,
    defaultCurdQuantity: c.default_curd_quantity,
    route: c.route ?? { name: "" },
  }));

  const mappedDeliveries: DeliveryRecord[] = deliveries.map((d) => ({
    id: d.id,
    customerId: d.customer_id,
    milkQuantity: Number(d.milk_quantity ?? 0),
    extraMilkQuantity: Number(d.extra_milk_quantity ?? 0),
    curdQuantity: Number(d.curd_quantity ?? 0),
    extraCurdQuantity: Number(d.extra_curd_quantity ?? 0),
    status: d.status as DeliveryStatus,
    notes: d.notes ?? undefined,
  }));

  const stats = [
    { label: "Assigned",  value: customers.length,                    color: "blue" },
    { label: "Completed", value: completed,                            color: "green" },
    { label: "Pending",   value: customers.length - completed,          color: "orange" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">Today&apos;s Route</h1>
        <p className="text-slate-500 mt-1 pb-4 border-b border-slate-100">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <div className="flex gap-4 mt-4">
          {stats.map(({ label, value, color }) => {
            const s = statStyles[color];
            return (
              <div key={label} className={`flex-1 rounded-xl p-4 border ${s.card}`}>
                <div className={`text-sm font-medium mb-1 ${s.label}`}>{label}</div>
                <div className={`text-2xl font-bold ${s.value}`}>{value}</div>
              </div>
            );
          })}
        </div>
      </div>
      <DeliveryEntryList initialCustomers={mappedCustomers} initialDeliveries={mappedDeliveries} />
    </div>
  );
}
