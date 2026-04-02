import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;

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
    .update({
      name: name.trim(),
      address: address.trim(),
      phone: phone.trim(),
      route_id: routeId,
      default_milk_quantity: Number(defaultMilkQuantity) || 0,
      default_curd_quantity: Number(defaultCurdQuantity) || 0,
    })
    .eq("id", id)
    .select("*, route:routes(id, name)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;

  const { data, error } = await auth.supabase
    .from("customers")
    .update({ is_active: false })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
