import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;

  let name: string;
  try {
    ({ name } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!name?.trim()) return NextResponse.json({ error: "Route name is required." }, { status: 400 });

  const { data, error } = await auth.supabase
    .from("routes")
    .update({ name: name.trim() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;

  const { count } = await auth.supabase
    .from("customers")
    .select("*", { count: "exact", head: true })
    .eq("route_id", id)
    .eq("is_active", true);

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: "Cannot delete a route that has active customers assigned." },
      { status: 400 }
    );
  }

  const { error } = await auth.supabase.from("routes").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
