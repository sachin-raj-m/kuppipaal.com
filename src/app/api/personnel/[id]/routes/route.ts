import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;

  let routeId: string;
  try {
    ({ routeId } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!routeId) return NextResponse.json({ error: "routeId is required." }, { status: 400 });

  const { error } = await auth.supabase.from("route_assignments").insert({
    user_id: id,
    route_id: routeId,
    is_active: true,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
