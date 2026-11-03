import { createClient, getUser, isSupabaseConfigured } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { setUserSuspended, grantRole, createInvite, revokeInvite } from "../actions";
import { getDictionary } from "@/lib/i18n/server";
import { ChangeMyPassword, ResetUserPassword } from "./password-forms";

export const metadata = { title: "Users", robots: { index: false } };
export const dynamic = "force-dynamic";

interface Row {
  id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
  user_roles: Array<{ roles: { name: string } | null }>;
}

interface InviteRow {
  id: string;
  email: string;
  role_name: string;
  token: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const d = await getDictionary();
  const me = await getUser();
  let users: Row[] = [];
  let invites: InviteRow[] = [];
  let iAmSuper = false;
  let iAmAdmin = false;

  if (isSupabaseConfigured() && me) {
    try {
      const supabase = await createClient();
      let query = supabase
        .from("profiles")
        .select("id, email, display_name, created_at, user_roles(roles(name))")
        .order("created_at", { ascending: false })
        .limit(100);
      if (q) query = query.ilike("email", `%${q}%`);
      const { data } = await query;
      users = (data ?? []) as unknown as Row[];
      const myRolesRaw = (
        (await supabase.from("user_roles").select("roles(name)").eq("user_id", me.id)).data ?? []
      ) as unknown as Array<{ roles: { name: string } | null }>;
      const roleNames = myRolesRaw.map((r) => r.roles?.name);
      iAmSuper = roleNames.includes("super_administrator");
      iAmAdmin = iAmSuper || roleNames.includes("administrator");
      // Pending invites
      const { data: inv } = await supabase
        .from("invites")
        .select("id, email, role_name, token, expires_at, used_at, created_at")
        .is("used_at", null)
        .order("created_at", { ascending: false });
      invites = (inv ?? []) as unknown as InviteRow[];
    } catch { /* empty */ }
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-950 dark:text-white">{d.t("admin.users.title")}</h1>
      <form method="get" className="mt-4 flex gap-2">
        <input name="q" defaultValue={q ?? ""} placeholder={d.t("admin.users.searchPh")} dir="ltr"
          className="h-10 rounded-xl border border-brand-200 dark:border-white/15 bg-white dark:bg-neutral-900 px-3 text-sm" />
        <button type="submit" className="h-10 rounded-xl bg-brand-700 px-4 text-sm font-bold text-white">{d.t("common.search")}</button>
      </form>

      {/* Team invites — sirf admin/super_admin */}
      {iAmAdmin && (
        <div className="mt-6 rounded-2xl border border-brand-200 dark:border-white/10 bg-brand-50/50 dark:bg-white/5 p-5">
          <h2 className="text-lg font-bold text-brand-950 dark:text-white">
            👥 Team Invite
          </h2>
          <p className="text-sm text-neutral-500 mt-1 mb-4">
            Kisi ko unki Gmail par admin access dein — wo link khol kar <strong>apna password khud</strong> lagayenge. Link 7 din tak valid hai.
          </p>
          <form action={createInvite} className="flex gap-2 flex-wrap items-end">
            <div>
              <label className="block text-xs font-bold mb-1">Gmail *</label>
              <input name="email" type="email" required dir="ltr" placeholder="example@gmail.com"
                className="h-10 rounded-xl border border-brand-200 dark:border-white/15 bg-white dark:bg-neutral-900 px-3 text-sm w-64" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Role *</label>
              <select name="role" className="h-10 rounded-xl border border-brand-200 dark:border-white/15 bg-white dark:bg-neutral-900 px-3 text-sm">
                <option value="content_manager">content_manager — upload + manage</option>
                <option value="editor">editor — content edit</option>
                {iAmSuper && <option value="administrator">administrator — full admin</option>}
              </select>
            </div>
            <button type="submit" className="h-10 rounded-xl bg-brand-700 px-5 text-sm font-bold text-white">
              Invite Bhejein
            </button>
          </form>

          {invites.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-bold mb-2">Pending Invites ({invites.length})</h3>
              <div className="space-y-2">
                {invites.map((inv) => {
                  const link = `https://quran-mahal.netlify.app/invite/${inv.token}`;
                  const expired = new Date(inv.expires_at) < new Date();
                  return (
                    <div key={inv.id} className="flex items-center gap-3 flex-wrap bg-white dark:bg-neutral-900 rounded-xl p-3 text-sm">
                      <div className="flex-1 min-w-[200px]">
                        <p className="font-bold" dir="ltr">{inv.email}</p>
                        <p className="text-xs text-neutral-500">
                          <Badge tone="gold">{inv.role_name}</Badge>{" "}
                          {expired ? <span className="text-red-500">expired</span> : <>expires {new Date(inv.expires_at).toLocaleDateString()}</>}
                        </p>
                        <p className="text-xs text-brand-700 dark:text-brand-300 break-all mt-1" dir="ltr">{link}</p>
                      </div>
                      <form action={revokeInvite}>
                        <input type="hidden" name="id" value={inv.id} />
                        <button className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600">
                          Cancel
                        </button>
                      </form>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                💡 Upar wala link copy karke WhatsApp par bhej dein — wo khol kar apna password khud lagayenge.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 overflow-x-auto rounded-2xl border border-brand-100 dark:border-white/10">
        <table className="w-full text-sm min-w-[680px]">
          <thead><tr className="bg-brand-50 dark:bg-white/5 text-start">
            <th className="p-3 text-start">{d.t("admin.users.user")}</th><th className="p-3 text-start">{d.t("admin.users.roles")}</th><th className="p-3 text-start">{d.t("admin.users.joined")}</th><th className="p-3 text-start">{d.t("common.actions")}</th>
          </tr></thead>
          <tbody>
            {users.map((u) => {
              const roles = u.user_roles.map((r) => r.roles?.name).filter(Boolean) as string[];
              const isSelf = u.id === me?.id;
              return (
                <tr key={u.id} className="border-t border-brand-100 dark:border-white/10">
                  <td className="p-3">
                    <p className="font-bold" dir="ltr">{u.email}</p>
                    <p className="text-xs text-neutral-500">{u.display_name ?? "—"}</p>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1 flex-wrap">
                      {roles.length === 0 && <Badge tone="neutral">user</Badge>}
                      {roles.map((r) => <Badge key={r} tone={r === "user" ? "neutral" : "gold"}>{r}</Badge>)}
                    </div>
                  </td>
                  <td className="p-3 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    {!isSelf && (
                      <div className="flex gap-2 flex-wrap items-center">
                        <form action={setUserSuspended}>
                          <input type="hidden" name="user_id" value={u.id} />
                          <input type="hidden" name="suspend" value="1" />
                          <button className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-bold text-red-600">{d.t("admin.users.suspend")}</button>
                        </form>
                        {iAmSuper && (
                          <>
                            <ResetUserPassword userId={u.id} email={u.email ?? ""} />
                            <form action={grantRole} className="flex gap-1">
                              <input type="hidden" name="user_id" value={u.id} />
                              <select name="role" className="h-8 rounded-lg border text-xs px-1" defaultValue="">
                                <option value="" disabled>{d.t("admin.users.rolePh")}</option>
                                {["user", "editor", "content_manager", "administrator", "super_administrator"].map((r) => (
                                  <option key={r} value={r}>{r}</option>
                                ))}
                              </select>
                              <button className="rounded-lg border px-2.5 py-1.5 text-xs font-bold">{d.t("admin.users.grant")}</button>
                            </form>
                          </>
                        )}
                      </div>
                    )}
                    {isSelf && <span className="text-xs text-neutral-400">{d.t("admin.users.you")}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {users.length === 0 && <p className="p-6 text-center text-sm text-neutral-500">{d.t("admin.users.empty")}</p>}
      </div>
      <p className="mt-3 text-xs text-neutral-500">{d.t("admin.users.note")}</p>

      {/* Apna password change */}
      <ChangeMyPassword />
    </div>
  );
}
