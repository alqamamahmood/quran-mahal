import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { getDictionary } from "@/lib/i18n/server";

const TILES = [
  { href: "/dashboard/favorites", icon: "❤️", labelKey: "dash.library.fav", descKey: "dash.library.favDesc" },
  { href: "/dashboard/continue-watching", icon: "▶", labelKey: "dash.library.watch", descKey: "dash.library.watchDesc" },
  { href: "/dashboard/continue-listening", icon: "🎧", labelKey: "dash.library.listen", descKey: "dash.library.listenDesc" },
  { href: "/dashboard/reading-progress", icon: "📖", labelKey: "dash.library.reading", descKey: "dash.library.readingDesc" },
  { href: "/dashboard/membership", icon: "⭐", labelKey: "dash.library.membership", descKey: "dash.library.membershipDesc" },
  { href: "/dashboard/payments", icon: "🧾", labelKey: "dash.library.payments", descKey: "dash.library.paymentsDesc" },
];

export const metadata = { title: "My Library", robots: { index: false } };

export default async function LibraryPage() {
  const d = await getDictionary();
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-950 dark:text-white">{d.t("dash.library.title")}</h1>
      <div className="mt-4 grid sm:grid-cols-2 gap-4">
        {TILES.map((t) => (
          <Link key={t.href} href={t.href}>
            <Card className="hover:shadow-lift transition-shadow">
              <CardBody className="flex items-center gap-4">
                <span className="text-3xl" aria-hidden>{t.icon}</span>
                <span>
                  <span className="block font-bold">{d.t(t.labelKey)}</span>
                  <span className="block text-xs text-neutral-500">{d.t(t.descKey)}</span>
                </span>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
