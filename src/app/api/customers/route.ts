import { NextResponse } from "next/server";
import { requireAdmin, requireUser } from "@/lib/auth";

export async function GET(req: Request) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const routeId = searchParams.get("routeId");

  let query = auth.supabase
    .from("customers")
    .select("*, route:routes(id, name)")
    .eq("is_active", true)
    .order("name");

  if (routeId) query = query.eq("route_id", routeId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, address, phone, routeId, defaultMilkQuantity, defaultCurdQuantity } = body as {
    name: string;
    address: string;
    phone: string;
    routeId: string;
    defaultMilkQuantity?: number;
    defaultCurdQuantity?: number;
  };

  if (!name?.trim() || !address?.trim() || !phone?.trim() || !routeId) {
    return NextResponse.json({ error: "Name, address, phone and route are required." }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("customers")
    .insert({
      name: name.trim(),
      address: address.trim(),
      phone: phone.trim(),
      route_id: routeId,
      default_milk_quantity: Number(defaultMilkQuantity) || 0,
      default_curd_quantity: Number(defaultCurdQuantity) || 0,
    })
    .select("*, route:routes(id, name)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
