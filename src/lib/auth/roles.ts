import { redirect } from "next/navigation";
import { getUser, getUserRoles } from "@/lib/supabase/server";
import type { RoleName } from "@/lib/types";

export const STAFF_ROLES: RoleName[] = [
  "editor",
  "content_manager",
  "administrator",
  "super_administrator",
];
export const ADMIN_ROLES: RoleName[] = ["administrator", "super_administrator"];

export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/login?next=" + encodeURIComponent("/dashboard"));
  return user;
}

export async function requireRoles(allowed: RoleName[], redirectTo = "/") {
  const user = await getUser();
  if (!user) redirect("/login?next=" + encodeURIComponent("/admin"));
  const roles = await getUserRoles();
  const ok = roles.some((r) => (allowed as string[]).includes(r));
  if (!ok) redirect(redirectTo);
  return { user, roles };
}

export const requireAdmin = () => requireRoles(ADMIN_ROLES, "/");
export const requireStaff = () => requireRoles(STAFF_ROLES, "/");

/** Pure helper (unit-tested): does a role list grant access to `allowed`? */
export function rolesGrantAccess(roles: string[], allowed: string[]): boolean {
  return roles.some((r) => allowed.includes(r));
}
