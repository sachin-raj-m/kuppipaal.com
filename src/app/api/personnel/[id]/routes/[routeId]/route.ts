import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; routeId: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id, routeId } = await params;

  const { error } = await auth.supabase
    .from("route_assignments")
    .delete()
    .eq("user_id", id)
    .eq("route_id", routeId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
