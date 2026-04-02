import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PricingConfig from "./PricingConfig";
import type { PricingRow } from "@/lib/types";

export default async function SettingsPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: pricing } = await supabase.from("pricing").select("*").eq("is_active", true);
  const milkPrice = (pricing as PricingRow[] | null)?.find((p) => p.product_type === "milk")?.price_per_liter ?? 0;
  const curdPrice = (pricing as PricingRow[] | null)?.find((p) => p.product_type === "curd")?.price_per_liter ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500">Configure pricing and system preferences.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PricingConfig currentMilkPrice={Number(milkPrice)} currentCurdPrice={Number(curdPrice)} />
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-3">Session Info</h2>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm space-y-2">
            <p className="text-slate-600">Email: <span className="font-mono text-slate-800">{user.email}</span></p>
            <p className="text-slate-600">User ID: <span className="font-mono text-xs text-slate-400">{user.id}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
