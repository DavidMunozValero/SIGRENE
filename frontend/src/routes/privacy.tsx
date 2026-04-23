import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Política de Privacidad — SIGRENE" },
      { name: "description", content: "Política de privacidad y protección de datos de SIGRENE." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t("privacy.h1")}</h1>
        <p className="text-muted-foreground mt-2 text-sm">{t("privacy.last_update")}</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/80">
            <p>
              <strong>{t("privacy.notice")}</strong> {t("privacy.notice_text")}
            </p>

            <h2 className="text-xl font-semibold mt-8">{t("privacy.section1.title")}</h2>
            <p>{t("privacy.section1.text")}</p>

            <h2 className="text-xl font-semibold mt-8">{t("privacy.section2.title")}</h2>
            <p>{t("privacy.section2.text")}</p>

            <h2 className="text-xl font-semibold mt-8">{t("privacy.section3.title")}</h2>
            <p>{t("privacy.section3.text")}</p>

            <h2 className="text-xl font-semibold mt-8">{t("privacy.section4.title")}</h2>
            <p>{t("privacy.section4.text")}</p>

            <h2 className="text-xl font-semibold mt-8">{t("privacy.section5.title")}</h2>
            <p>{t("privacy.section5.text")}</p>

            <h2 className="text-xl font-semibold mt-8">{t("privacy.section6.title")}</h2>
            <p>{t("privacy.section6.text")}</p>

            <h2 className="text-xl font-semibold mt-8">{t("privacy.section7.title")}</h2>
            <p>{t("privacy.section7.text")}</p>

            <h2 className="text-xl font-semibold mt-8">{t("privacy.section8.title")}</h2>
            <p>{t("privacy.section8.text")}</p>

            <h2 className="text-xl font-semibold mt-8">{t("privacy.section9.title")}</h2>
            <p>{t("privacy.section9.text")}</p>
          </div>

        <div className="mt-12 pt-6 border-t border-border/60">
          <Link to="/register" className="text-sm text-primary hover:underline">
            ← {t("privacy.back")}
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}