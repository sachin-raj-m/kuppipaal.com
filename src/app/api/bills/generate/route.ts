import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import type { PricingRow } from "@/lib/types";

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const month = Number(searchParams.get("month"));
  const year = Number(searchParams.get("year"));

  let query = auth.supabase
    .from("bills")
    .select("*, customer:customers(name, route:routes(name))")
    .order("customer(name)");

  if (!isNaN(month) && month > 0) query = query.eq("bill_month", month);
  if (!isNaN(year) && year > 0) query = query.eq("bill_year", year);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  let month: number, year: number;
  try {
    ({ month, year } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  month = Number(month);
  year = Number(year);
  if (isNaN(month) || month < 1 || month > 12 || isNaN(year) || year < 2000) {
    return NextResponse.json({ error: "Valid month (1–12) and year are required." }, { status: 400 });
  }

  // Get active pricing
  const { data: pricing, error: pricingError } = await auth.supabase
    .from("pricing")
    .select("*")
    .eq("is_active", true);

  if (pricingError) return NextResponse.json({ error: pricingError.message }, { status: 500 });

  const milkPrice = (pricing as PricingRow[]).find((p) => p.product_type === "milk")?.price_per_liter ?? 0;
  const curdPrice = (pricing as PricingRow[]).find((p) => p.product_type === "curd")?.price_per_liter ?? 0;

  if (!milkPrice && !curdPrice) {
    return NextResponse.json({ error: "Configure pricing first in Settings." }, { status: 400 });
  }

  // Date range for the month
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = new Date(year, month, 0).toISOString().split("T")[0];

  const { data: deliveries, error: dErr } = await auth.supabase
    .from("deliveries")
    .select("customer_id, milk_quantity, extra_milk_quantity, curd_quantity, extra_curd_quantity")
    .eq("status", "delivered")
    .gte("delivery_date", startDate)
    .lte("delivery_date", endDate);

  if (dErr) return NextResponse.json({ error: dErr.message }, { status: 500 });
  if (!deliveries?.length) {
    return NextResponse.json({ error: "No delivered entries found for this month." }, { status: 400 });
  }

  // Aggregate by customer (regular + extra quantities)
  const agg: Record<string, { milk: number; curd: number }> = {};
  for (const d of deliveries) {
    if (!agg[d.customer_id]) agg[d.customer_id] = { milk: 0, curd: 0 };
    agg[d.customer_id].milk += Number(d.milk_quantity) + Number(d.extra_milk_quantity ?? 0);
    agg[d.customer_id].curd += Number(d.curd_quantity) + Number(d.extra_curd_quantity ?? 0);
  }

  const billRows = Object.entries(agg).map(([customerId, qty]) => {
    const milkAmount = qty.milk * Number(milkPrice);
    const curdAmount = qty.curd * Number(curdPrice);
    const total = milkAmount + curdAmount;
    return {
      customer_id: customerId,
      bill_month: month,
      bill_year: year,
      total_milk_quantity: qty.milk,
      total_curd_quantity: qty.curd,
      milk_amount: milkAmount,
      curd_amount: curdAmount,
      total_amount: total,
      outstanding_balance: total,
      payment_status: "unpaid",
    };
  });

  const { error: upsertError } = await auth.supabase
    .from("bills")
    .upsert(billRows, { onConflict: "customer_id,bill_month,bill_year" });

  if (upsertError) return NextResponse.json({ error: upsertError.message }, { status: 500 });
  return NextResponse.json({ success: true, count: billRows.length });
}
