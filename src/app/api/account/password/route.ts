import { NextResponse } from "next/server";
import { createClient, getUser } from "@/lib/supabase/server";

/**
 * POST /api/account/password
 * Body: { currentPassword?, newPassword }
 * Logged-in user changes their OWN password.
 * (currentPassword optional — we verify via re-auth when provided)
 */
export async function POST(req: Request) {
  const user = await getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Login zaroori hai" }, { status: 401 });
  }

  let body: { newPassword?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { newPassword } = body;
  if (!newPassword || newPassword.length < 8) {
    return NextResponse.json(
      { error: "Naya password kam-az-kam 8 harf ka ho" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    return NextResponse.json({ error: "Password change nahi hua" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

/**
 * POST /api/admin/users/[id]/reset-password  →  handled in route below
 * (Super admin resets someone else's password — see [id]/route.ts)
 */
