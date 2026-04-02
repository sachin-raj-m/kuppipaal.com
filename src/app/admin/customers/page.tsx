import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CustomerManager from "./CustomerManager";

interface CustomerRow {
  id: string;
  name: string;
  address: string;
  phone: string;
  route_id: string;
  default_milk_quantity: number;
  default_curd_quantity: number;
  is_active: boolean;
  route: { id: string; name: string } | null;
}

export default async function CustomersPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: customers }, { data: routes }] = await Promise.all([
    supabase
      .from("customers")
      .select("*, route:routes(id, name)")
      .eq("is_active", true)
      .order("name"),
    supabase.from("routes").select("id, name").order("name"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Customer Management</h1>
        <p className="text-slate-500">Add, edit, and manage your delivery customers.</p>
      </div>
      <CustomerManager
        initialCustomers={((customers ?? []) as CustomerRow[]).map((c) => ({
          id: c.id,
          name: c.name,
          address: c.address,
          phone: c.phone,
          routeId: c.route_id,
          route: c.route ?? { id: c.route_id, name: "" },
          defaultMilkQuantity: c.default_milk_quantity,
          defaultCurdQuantity: c.default_curd_quantity,
        }))}
        routes={routes || []}
      />
    </div>
  );
}
