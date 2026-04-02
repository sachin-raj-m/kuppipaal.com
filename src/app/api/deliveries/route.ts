import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

interface DeliveryInput {
  customerId: string;
  deliveryDate?: string;
  milkQuantity: number;
  extraMilkQuantity?: number;
  curdQuantity: number;
  extraCurdQuantity?: number;
  status: string;
  notes?: string;
}

export async function GET(req: Request) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  // Check role to filter results
  const { data: profile } = await auth.supabase
    .from("profiles")
    .select("role")
    .eq("id", auth.userId)
    .single();

  let query = auth.supabase
    .from("deliveries")
    .select("*, customer:customers(name, route:routes(name)), delivery_personnel:profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (date) query = query.eq("delivery_date", date);
  if (profile?.role === "DELIVERY_PERSONNEL") {
    query = query.eq("delivery_personnel_id", auth.userId);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  let deliveries: DeliveryInput[];
  try {
    const body = await req.json();
    if (!Array.isArray(body?.deliveries)) {
      return NextResponse.json({ error: "deliveries array expected." }, { status: 400 });
    }
    deliveries = body.deliveries as DeliveryInput[];
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const today = new Date().toISOString().split("T")[0];

  const records = deliveries
    .filter((d) => d.customerId && d.status)
    .map((d) => ({
      customer_id: d.customerId,
      delivery_personnel_id: auth.userId,
      delivery_date: d.deliveryDate ? d.deliveryDate.split("T")[0] : today,
      milk_quantity: Number(d.milkQuantity) || 0,
      extra_milk_quantity: Number(d.extraMilkQuantity) || 0,
      curd_quantity: Number(d.curdQuantity) || 0,
      extra_curd_quantity: Number(d.extraCurdQuantity) || 0,
      status: d.status.toLowerCase(),
      notes: d.notes?.trim() || null,
    }));

  if (!records.length) {
    return NextResponse.json({ error: "No valid delivery entries provided." }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from("deliveries")
    .upsert(records, { onConflict: "customer_id,delivery_date" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, count: records.length }, { status: 201 });
}
