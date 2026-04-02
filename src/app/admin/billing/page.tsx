import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BillingManager from "./BillingManager";

export default async function BillingPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data: bills } = await supabase
    .from("bills")
    .select("*, customer:customers(name, route:routes(name))")
    .eq("bill_month", month)
    .eq("bill_year", year)
    .order("customer(name)");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Billing</h1>
        <p className="text-slate-500">Generate and manage monthly customer bills.</p>
      </div>
      <BillingManager initialBills={bills || []} defaultMonth={month} defaultYear={year} />
    </div>
  );
}
