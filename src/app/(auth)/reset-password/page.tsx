import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { updatePassword } from "../actions";
import { getDictionary } from "@/lib/i18n/server";

export const metadata = { title: "Reset password", robots: { index: false } };

export default async function ResetPasswordPage({
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
          <h1 className="text-2xl font-extrabold text-brand-950 dark:text-white">{d.t("auth.newPasswordTitle")}</h1>
          {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <form action={updatePassword} className="mt-5 space-y-4">
            <Input name="password" type="password" required minLength={8} label={d.t("auth.newPasswordMin")} autoComplete="new-password" dir="ltr" />
            <Button type="submit" className="w-full">{d.t("auth.updatePasswordBtn")}</Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
