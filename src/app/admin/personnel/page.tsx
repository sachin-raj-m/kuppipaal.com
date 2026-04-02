import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PersonnelManager from "./PersonnelManager";

export default async function PersonnelPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: allProfiles }, { data: routes }, { data: assignments }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, role, is_active")
      .in("role", ["DELIVERY_PERSONNEL", "ADMIN"])
      .order("full_name"),
    supabase.from("routes").select("id, name").order("name"),
    supabase.from("route_assignments").select("user_id, route_id").eq("is_active", true),
  ]);

  const admins = (allProfiles ?? []).filter((p) => p.role === "ADMIN");
  const deliveryPersonnel = (allProfiles ?? []).filter((p) => p.role === "DELIVERY_PERSONNEL");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-800">Personnel</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage admin and delivery staff accounts.</p>
      </div>
      <PersonnelManager
        initialDeliveryPersonnel={deliveryPersonnel}
        initialAdmins={admins}
        routes={routes || []}
        initialAssignments={assignments || []}
        currentUserId={user.id}
      />
    </div>
  );
}
