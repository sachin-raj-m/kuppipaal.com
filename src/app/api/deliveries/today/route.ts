import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

interface RouteAssignment {
  route_id: string;
}

interface CustomerRow {
  id: string;
  [key: string]: unknown;
}

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const today = new Date().toISOString().split("T")[0];

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  let customers: CustomerRow[] = [];

  if (profile?.role === "ADMIN") {
    const { data } = await supabase
      .from("customers")
      .select("*, route:routes(name)")
      .eq("is_active", true)
      .order("name");
    customers = (data as CustomerRow[]) || [];
  } else {
    // Get assigned routes for this user
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

  const customerIds = customers.map((c) => c.id);
  const { data: deliveries } = customerIds.length
    ? await supabase.from("deliveries").select("*").in("customer_id", customerIds).eq("delivery_date", today)
    : { data: [] };

  return NextResponse.json({ customers, deliveries: deliveries || [], date: today });
}
