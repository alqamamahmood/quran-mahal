import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export { isSupabaseConfigured } from "./client";
import { isSupabaseConfigured as isConfigured } from "./client";

function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (see .env.example)."
    );
  }
  return { url, key };
}

export async function createClient() {
  const { url, key } = supabaseConfig();
  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setAll: (toSet: any) => {
        try {
          toSet.forEach(({ name, value, options }: any) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          /* called from a Server Component — middleware refreshes the session */
        }
      },
    },
  });
}

/** Service-role client for privileged server operations (webhooks, admin jobs).
 *  NEVER expose the service-role key to the browser. */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured. Privileged operation unavailable."
    );
  }
  // Lazy import to keep the service key out of edge bundles unless used.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require("@supabase/supabase-js");
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Current signed-in user (or null) for server components/actions.
 *  Returns null when Supabase is not configured (sample mode). */
export async function getUser() {
  if (!isConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Role names granted to the current user via public.user_roles. */
export async function getUserRoles(): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", user.id);
  const rows = (data ?? []) as unknown as Array<{ roles: { name: string } | null }>;
  return rows.map((r) => r.roles?.name).filter((n): n is string => Boolean(n));
}
