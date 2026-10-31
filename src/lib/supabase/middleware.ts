import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Refreshes the Supabase auth session on every request. */
export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Without credentials the middleware is a pass-through (sample-data mode).
  if (!url || !key) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setAll: (toSet: any) => {
        toSet.forEach(({ name, value }: any) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }: any) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });
  await supabase.auth.getUser();
  return response;
}
