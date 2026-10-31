import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { signIn } from "../actions";
import { getDictionary } from "@/lib/i18n/server";

export const metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string; next?: string }>;
}) {
  const { error, notice, next } = await searchParams;
  const d = await getDictionary();
  return (
    <div className="mx-auto max-w-md pt-10">
      <Card>
        <CardBody>
          <h1 className="text-2xl font-extrabold text-brand-950 dark:text-white">{d.t("auth.loginTitle")}</h1>
          <p className="mt-1 text-sm text-neutral-500">{d.t("auth.loginSub")}</p>
          {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {notice && <p className="mt-3 rounded-xl bg-brand-50 p-3 text-sm text-brand-800">{notice}</p>}
          <form action={signIn} className="mt-5 space-y-4">
            <input type="hidden" name="next" value={next ?? "/dashboard"} />
            <Input name="email" type="email" required label={d.t("auth.email")} autoComplete="email" dir="ltr" />
            <Input name="password" type="password" required label={d.t("auth.password")} autoComplete="current-password" dir="ltr" />
            <Button type="submit" className="w-full">{d.t("auth.loginBtn")}</Button>
          </form>
          <div className="mt-4 flex justify-between text-sm">
            <Link href="/forgot-password" className="font-semibold text-brand-700 hover:underline">{d.t("auth.forgotLink")}</Link>
            <Link href="/register" className="font-semibold text-brand-700 hover:underline">{d.t("auth.registerLink")}</Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
