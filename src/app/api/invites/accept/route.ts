import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/invites/accept
 * Body: { token, name, password }
 * Creates the auth user (via service_role), marks invite used, assigns role.
 * The invited person sets their OWN password here.
 */
export async function POST(req: Request) {
  let body: { token?: string; name?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { token, name, password } = body;
  if (!token || !name?.trim() || !password || password.length < 8) {
    return NextResponse.json(
      { error: "Naam aur kam-az-kam 8 harf ka password zaroori hai" },
      { status: 400 }
    );
  }

  // Validate invite (use anon client — RLS allows staff read, but this is public;
  // we validate via service client to avoid leaking invite list)
  let service;
  try {
    service = createServiceClient();
  } catch {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const { data: invite } = await service
    .from("invites")
    .select("id, email, role_name, expires_at, used_at")
    .eq("token", token)
    .single();

  if (!invite) {
    return NextResponse.json({ error: "Ghalat ya expired invite link" }, { status: 404 });
  }
  if (invite.used_at) {
    return NextResponse.json({ error: "Ye invite pehle use ho chuka hai" }, { status: 410 });
  }
  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: "Invite ki muddat khatam ho gayi" }, { status: 410 });
  }

  // Create auth user (email auto-confirmed — no SMTP needed)
  const { data: newUser, error: createErr } =
    await service.auth.admin.createUser({
      email: invite.email,
      password,
      email_confirm: true,
      user_metadata: { display_name: name.trim() },
    });

  if (createErr || !newUser.user) {
    const msg = createErr?.message || "User nahi ban saka";
    // If user already exists, give a clear message
    if (msg.toLowerCase().includes("already")) {
      return NextResponse.json(
        { error: "Ye email pehle se registered hai — login karein" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const userId = newUser.user.id;

  // Create profile
  await service.from("profiles").upsert({
    id: userId,
    email: invite.email,
    display_name: name.trim(),
  });

  // Assign role
  const { data: role } = await service
    .from("roles").select("id").eq("name", invite.role_name).single();
  if (role) {
    await service.from("user_roles").upsert({
      user_id: userId,
      role_id: role.id,
      granted_by: invite.created_by,
    });
  }

  // Mark invite used
  await service
    .from("invites")
    .update({ used_at: new Date().toISOString(), used_by: userId })
    .eq("id", invite.id);

  return NextResponse.json({ success: true, email: invite.email });
}

/**
 * GET /api/invites/accept?token=xxx
 * Validate an invite token (public — only returns safe fields).
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token missing" }, { status: 400 });
  }

  let service;
  try {
    service = createServiceClient();
  } catch {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const { data: invite } = await service
    .from("invites")
    .select("email, role_name, expires_at, used_at")
    .eq("token", token)
    .single();

  if (!invite) {
    return NextResponse.json({ error: "Ghalat invite link" }, { status: 404 });
  }
  if (invite.used_at || new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: "Invite expired ya use ho chuka" }, { status: 410 });
  }

  return NextResponse.json({
    email: invite.email,
    role: invite.role_name,
  });
}
