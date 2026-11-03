import { NextResponse } from "next/server";
import { createServiceClient, getUser, getUserRoles } from "@/lib/supabase/server";

/**
 * POST /api/admin/users/reset-password
 * Body: { userId, newPassword }
 * Super-admin resets another user's password.
 */
export async function POST(req: Request) {
  const me = await getUser();
  if (!me) return NextResponse.json({ error: "Login zaroori hai" }, { status: 401 });

  const roles = await getUserRoles();
  if (!roles.includes("super_administrator")) {
    return NextResponse.json({ error: "Sirf super admin" }, { status: 403 });
  }

  let body: { userId?: string; newPassword?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { userId, newPassword } = body;
  if (!userId || !newPassword || newPassword.length < 8) {
    return NextResponse.json(
      { error: "User ID aur 8+ harf ka password zaroori" },
      { status: 400 }
    );
  }

  let service;
  try {
    service = createServiceClient();
  } catch {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const { error } = await service.auth.admin.updateUserById(userId, {
    password: newPassword,
  });
  if (error) {
    return NextResponse.json({ error: "Reset nahi hua" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
