import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PersonnelManager from "./PersonnelManager";

export default async function PersonnelPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: personnel }, { data: routes }, { data: assignments }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, is_active")
      .eq("role", "DELIVERY_PERSONNEL")
      .order("full_name"),
    supabase.from("routes").select("id, name").order("name"),
    supabase.from("route_assignments").select("user_id, route_id").eq("is_active", true),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Delivery Personnel</h1>
        <p className="text-slate-500">Manage delivery staff accounts and their route assignments.</p>
      </div>
      <PersonnelManager
        initialPersonnel={personnel || []}
        routes={routes || []}
        initialAssignments={assignments || []}
      />
    </div>
  );
}
