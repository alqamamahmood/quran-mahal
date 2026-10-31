import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { signUp } from "../actions";
import { getDictionary } from "@/lib/i18n/server";

export const metadata = { title: "Create account" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const d = await getDictionary();
  return (
    <div className="mx-auto max-w-md pt-10">
      <Card>
        <CardBody>
          <h1 className="text-2xl font-extrabold text-brand-950 dark:text-white">{d.t("auth.registerTitle")}</h1>
          <p className="mt-1 text-sm text-neutral-500">{d.t("auth.registerSub")}</p>
          {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <form action={signUp} className="mt-5 space-y-4">
            <Input name="display_name" label={d.t("auth.name")} autoComplete="name" required />
            <Input name="email" type="email" required label={d.t("auth.email")} autoComplete="email" dir="ltr" />
            <Input name="password" type="password" required minLength={8} label={d.t("auth.passwordMin")} autoComplete="new-password" dir="ltr" />
            <Button type="submit" className="w-full">{d.t("auth.registerBtn")}</Button>
          </form>
          <p className="mt-4 text-sm text-center">
            {d.t("auth.hasAccount")} <Link href="/login" className="font-semibold text-brand-700 hover:underline">{d.t("auth.loginBtn")}</Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
