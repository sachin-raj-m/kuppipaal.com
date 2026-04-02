import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;

  let is_active: boolean;
  try {
    ({ is_active } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (typeof is_active !== "boolean") {
    return NextResponse.json({ error: "is_active must be a boolean." }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from("profiles")
    .update({ is_active })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;

  // Prevent self-deletion
  if (auth.userId === id) {
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return NextResponse.json(
      { error: "Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY not set." },
      { status: 500 }
    );
  }

  // Delete profile row first (safety — handles cases without cascade)
  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  await adminClient.from("profiles").delete().eq("id", id);

  // Delete from Supabase Auth
  const authRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${id}`, {
    method: "DELETE",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });

  if (!authRes.ok) {
    const errBody = await authRes.json().catch(() => ({}));
    const msg =
      errBody?.msg || errBody?.message || errBody?.error || `Auth error (HTTP ${authRes.status})`;
    console.error("[DELETE /api/personnel/[id]] Auth delete error:", errBody);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
