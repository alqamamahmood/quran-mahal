import { Card, CardBody } from "@/components/ui/card";
import type { Dictionary } from "@/lib/i18n/server";

function Page({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pt-6 mx-auto max-w-3xl">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-950 dark:text-white">{title}</h1>
      <Card className="mt-4"><CardBody className="article-body text-[15px]">{children}</CardBody></Card>
    </div>
  );
}

export function AboutPage({ d }: { d: Dictionary }) {
  const t = d.t;
  return (
    <Page title={t("static.about.title")}>
      <p>{t("static.about.p1")}</p>
      <p>{t("static.about.p2")}</p>
      <h2>{t("static.about.h2")}</h2>
      <ul>
        <li>{t("static.about.li1")}</li>
        <li>{t("static.about.li2")}</li>
        <li>{t("static.about.li3")}</li>
      </ul>
    </Page>
  );
}

export function ContactPage({ d }: { d: Dictionary }) {
  const t = d.t;
  return (
    <Page title={t("static.contact.title")}>
      <p>{t("static.contact.p1")}</p>
      <ul>
        <li>{t("static.contact.li1")} <a href="mailto:contact@quran-mahal.example">contact@quran-mahal.example</a> ({t("static.contact.li1b")})</li>
      </ul>
      <p>{t("static.contact.p2")} <a href="/copyright">{t("static.copyright.title")}</a>.</p>
    </Page>
  );
}

export function PrivacyPage({ d }: { d: Dictionary }) {
  const t = d.t;
  return (
    <Page title={t("static.privacy.title")}>
      <p><strong>{t("static.privacy.updated")}</strong> 2026-10-31</p>
      <h2>{t("static.privacy.h1")}</h2>
      <ul>
        <li>{t("static.privacy.li1")}</li>
        <li>{t("static.privacy.li2")}</li>
        <li>{t("static.privacy.li3")}</li>
      </ul>
      <h2>{t("static.privacy.h2")}</h2>
      <ul>
        <li>{t("static.privacy.li4")}</li>
        <li>{t("static.privacy.li5")}</li>
      </ul>
      <h2>{t("static.privacy.h3")}</h2>
      <p>{t("static.privacy.p1")} <a href="/contact">{t("static.contact.title").toLowerCase()}</a>.</p>
    </Page>
  );
}

export function TermsPage({ d }: { d: Dictionary }) {
  const t = d.t;
  return (
    <Page title={t("static.terms.title")}>
      <p><strong>{t("static.terms.updated")}</strong> 2026-10-31</p>
      <h2>{t("static.terms.h1")}</h2>
      <ul>
        <li>{t("static.terms.li1")}</li>
        <li>{t("static.terms.li2")}</li>
        <li>{t("static.terms.li3")}</li>
      </ul>
      <h2>{t("static.terms.h2")}</h2>
      <p>{t("static.terms.p1")}</p>
    </Page>
  );
}

export function CopyrightPage({ d }: { d: Dictionary }) {
  const t = d.t;
  return (
    <Page title={t("static.copyright.title")}>
      <p><strong>{t("static.copyright.updated")}</strong> 2026-10-31</p>
      <h2>{t("static.copyright.h1")}</h2>
      <ul>
        <li>{t("static.copyright.li1")}</li>
        <li>{t("static.copyright.li2")}</li>
        <li>{t("static.copyright.li3")}</li>
      </ul>
      <h2>{t("static.copyright.h2")}</h2>
      <p>{t("static.copyright.p1")} <a href="/contact">{t("static.contact.title").toLowerCase()}</a>{t("static.copyright.p2")}</p>
    </Page>
  );
}
