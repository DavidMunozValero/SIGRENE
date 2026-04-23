import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "features.page.title" },
      { name: "description", content: "features.page.desc" },
    ],
  }),
  component: FeaturesPage,
});

function FeaturesPage() {
  const { t } = useLanguage();
  const blocks = [
    {
      title: t("features.org"),
      body: t("features.org.desc"),
    },
    {
      title: t("features.perms"),
      body: t("features.perms.desc"),
    },
    {
      title: t("features.daily"),
      body: t("features.daily.desc"),
    },
    {
      title: t("features.load"),
      body: t("features.load.desc"),
    },
    {
      title: t("features.competition"),
      body: t("features.competition.desc"),
    },
    {
      title: t("features.reports"),
      body: t("features.reports.desc"),
    },
    {
      title: t("features.management"),
      body: t("features.management.desc"),
    },
    {
      title: t("features.privacy"),
      body: t("features.privacy.desc"),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Funcionalidades</p>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight">
            {t("features.title")}
          </h1>
          <p className="mt-4 text-muted-foreground text-lg">
            {t("features.subtitle")}
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {blocks.map((b, i) => (
            <div key={b.title} className="rounded-2xl bg-card border border-border/60 p-6 shadow-glass">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-water grid place-items-center text-white text-sm font-bold shadow-aqua">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="font-semibold text-foreground">{b.title}</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{b.body}</p>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
