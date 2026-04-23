import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Términos y Condiciones — SIGRENE" },
      { name: "description", content: "Términos y condiciones de uso de la plataforma SIGRENE." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t("terms.h1")}</h1>
        <p className="text-muted-foreground mt-2 text-sm">{t("terms.last_update")}</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/80">
            <p>
              <strong>{t("terms.important")}</strong> {t("terms.important_text")}
            </p>

            <h2 className="text-xl font-semibold mt-8">{t("terms.section1.title")}</h2>
            <p>{t("terms.section1.text")}</p>

            <h2 className="text-xl font-semibold mt-8">{t("terms.section2.title")}</h2>
            <p>{t("terms.section2.text")}</p>

            <h2 className="text-xl font-semibold mt-8">{t("terms.section3.title")}</h2>
            <p>{t("terms.section3.text")}</p>

            <h2 className="text-xl font-semibold mt-8">{t("terms.section4.title")}</h2>
            <p>{t("terms.section4.text")}</p>

            <h2 className="text-xl font-semibold mt-8">{t("terms.section5.title")}</h2>
            <p>{t("terms.section5.text")}</p>

            <h2 className="text-xl font-semibold mt-8">{t("terms.section6.title")}</h2>
            <p>{t("terms.section6.text")}</p>

            <h2 className="text-xl font-semibold mt-8">{t("terms.section7.title")}</h2>
            <p>{t("terms.section7.text")}</p>

            <h2 className="text-xl font-semibold mt-8">{t("terms.section8.title")}</h2>
            <p>{t("terms.section8.text")}</p>
          </div>

        <div className="mt-12 pt-6 border-t border-border/60">
          <Link to="/register" className="text-sm text-primary hover:underline">
            ← {t("terms.back")}
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}