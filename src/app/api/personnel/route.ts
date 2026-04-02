import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  // 1. Auth check — must be a logged-in ADMIN
  const serverClient = await createServerClient();
  const { data: { user } } = await serverClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await serverClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden — admin only." }, { status: 403 });
  }

  // 2. Parse and validate body
  let fullName: string, email: string, password: string;
  try {
    ({ fullName, email, password } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!fullName?.trim() || !email?.trim() || !password?.trim()) {
    return NextResponse.json({ error: "Name, email and password are all required." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
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

  // 3. Create auth user via Supabase admin REST API
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

  // 4. Ensure profile row exists with DELIVERY_PERSONNEL role
  // (the on_auth_user_created trigger should do this, but upsert as safety net)
  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { error: profileError } = await adminClient.from("profiles").upsert({
    id: newUserId,
    full_name: fullName.trim(),
    role: "DELIVERY_PERSONNEL",
    is_active: true,
  });

  if (profileError) {
    console.error("[POST /api/personnel] Profile upsert error:", profileError.message);
    // User was created; just warn, don't block
  }

  return NextResponse.json({
    id: newUserId,
    full_name: fullName.trim(),
    email: authData.email,
  });
}
