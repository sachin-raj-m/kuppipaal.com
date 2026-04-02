import { NextResponse } from "next/server";
import { requireAdmin, requireUser } from "@/lib/auth";

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase
    .from("pricing")
    .select("*")
    .eq("is_active", true);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  let milkPrice: number, curdPrice: number;
  try {
    ({ milkPrice, curdPrice } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof milkPrice !== "number" || typeof curdPrice !== "number" || milkPrice < 0 || curdPrice < 0) {
    return NextResponse.json({ error: "Valid milk and curd prices are required." }, { status: 400 });
  }

  // Deactivate existing prices, then insert new ones atomically
  const { error: deactivateError } = await auth.supabase
    .from("pricing")
    .update({ is_active: false })
    .eq("is_active", true);

  if (deactivateError) return NextResponse.json({ error: deactivateError.message }, { status: 500 });

  const { error } = await auth.supabase.from("pricing").insert([
    { product_type: "milk", price_per_liter: milkPrice, effective_from: new Date().toISOString(), is_active: true },
    { product_type: "curd", price_per_liter: curdPrice, effective_from: new Date().toISOString(), is_active: true },
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
