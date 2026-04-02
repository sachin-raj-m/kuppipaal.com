import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  let fullName: string, email: string, password: string, role: string;
  try {
    ({ fullName, email, password, role = "DELIVERY_PERSONNEL" } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!fullName?.trim() || !email?.trim() || !password?.trim()) {
    return NextResponse.json({ error: "Name, email and password are all required." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }
  if (!["ADMIN", "DELIVERY_PERSONNEL"].includes(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    console.error("[POST /api/personnel] SUPABASE_SERVICE_ROLE_KEY is not set in .env.local");
    return NextResponse.json(
      { error: "Server misconfiguration: service role key not set. Add SUPABASE_SERVICE_ROLE_KEY to .env.local" },
      { status: 500 }
    );
  }

  // Create auth user via Supabase admin REST API
  const authRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify({
      email: email.trim(),
      password: password.trim(),
      email_confirm: true,
      user_metadata: { full_name: fullName.trim() },
    }),
  });

  if (!authRes.ok) {
    const errBody = await authRes.json().catch(() => ({}));
    const msg =
      errBody?.msg ||
      errBody?.message ||
      errBody?.error_description ||
      errBody?.error ||
      `Supabase auth error (HTTP ${authRes.status})`;
    console.error("[POST /api/personnel] Supabase auth error:", errBody);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const authData = await authRes.json();
  const newUserId: string = authData.id;

  // Upsert profile with the requested role
  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { error: profileError } = await adminClient.from("profiles").upsert({
    id: newUserId,
    full_name: fullName.trim(),
    role,
    is_active: true,
  });

  if (profileError) {
    console.error("[POST /api/personnel] Profile upsert error:", profileError.message);
  }

  return NextResponse.json({
    id: newUserId,
    full_name: fullName.trim(),
    email: authData.email,
    role,
  });
}
