import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { requestPasswordReset } from "../actions";
import { getDictionary } from "@/lib/i18n/server";

export const metadata = { title: "Forgot password" };

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const { error, notice } = await searchParams;
  const d = await getDictionary();
  return (
    <div className="mx-auto max-w-md pt-10">
      <Card>
        <CardBody>
          <h1 className="text-2xl font-extrabold text-brand-950 dark:text-white">{d.t("auth.forgotTitle")}</h1>
          {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {notice && <p className="mt-3 rounded-xl bg-brand-50 p-3 text-sm text-brand-800">{notice}</p>}
          <form action={requestPasswordReset} className="mt-5 space-y-4">
            <Input name="email" type="email" required label={d.t("auth.email")} autoComplete="email" dir="ltr" />
            <Button type="submit" className="w-full">{d.t("auth.resetSendBtn")}</Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
