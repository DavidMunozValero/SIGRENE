import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/dashboard/Cards";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/app/director/reports")({
  head: () => ({ meta: [{ title: "Informes — Director" }] }),
  component: ReportsPage,
});

const reports = [
  { name_key: "director.reports.monthly", date: "Marzo 2026", size: "1.2 MB" },
  { name_key: "director.reports.competitions", date: "Q1 2026", size: "840 KB" },
  { name_key: "director.reports.acwr_trend", date: "Últimas 12 semanas", size: "620 KB" },
];

function ReportsPage() {
  const { t } = useLanguage();
  return (
    <>
      <PageHeader
        title={t("director.reports.title_page")}
        description={t("director.reports.desc")}
        action={<Button variant="hero">{t("director.reports.generate")}</Button>}
      />
      <SectionCard title={t("director.reports.available")}>
        <ul className="-m-5 divide-y divide-border/60">
          {reports.map((r) => (
            <li key={r.name_key} className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-water grid place-items-center text-white shadow-aqua">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div>
                  <p className="font-medium text-foreground">{t(r.name_key)}</p>
                  <p className="text-xs text-muted-foreground">{r.date} · {r.size}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Descargar</Button>
            </li>
          ))}
        </ul>
      </SectionCard>
    </>
  );
}
