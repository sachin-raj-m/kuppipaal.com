import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import RouteManager from "./RouteManager";

// Supabase returns customers as an array of count objects when using customers(count)
interface SupabaseRouteRow {
  id: string;
  name: string;
  customers: { count: number }[];
}

export default async function RoutesPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: routes } = await supabase
    .from("routes")
    .select("*, customers(count)")
    .order("name");

  const mappedRoutes = ((routes ?? []) as SupabaseRouteRow[]).map((r) => ({
    id: r.id,
    name: r.name,
    _count: { customers: r.customers[0]?.count ?? 0 },
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Route Management</h1>
        <p className="text-slate-500">Manage delivery areas.</p>
      </div>
      <RouteManager initialRoutes={mappedRoutes} />
    </div>
  );
}
