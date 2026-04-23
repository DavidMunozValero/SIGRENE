import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard, StatCard } from "@/components/dashboard/Cards";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/app/director/")({
  head: () => ({ meta: [{ title: "Dashboard — Director Técnico" }] }),
  component: DirectorHome,
});

function DirectorHome() {
  const { t } = useLanguage();
  return (
    <>
      <PageHeader
        title={t("director.index.title_page")}
        description={t("director.index.desc")}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("director.index.active_swimmers")} value="312" delta="↑ 6%" />
        <StatCard label={t("director.index.acwr_avg")} value="1.18" delta="zona óptima" />
        <StatCard label={t("director.index.training_attendance")} value="87%" delta="últimos 7d" />
        <StatCard label={t("director.index.competitions")} value="14" delta="3 nacionales" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3 mt-6">
        <div className="lg:col-span-2">
          <SectionCard title={t("director.index.load_trend")} description={t("director.index.load_trend_desc")}>
            <FakeChart />
          </SectionCard>
        </div>
        <SectionCard title={t("director.index.distribution")}>
          <ul className="space-y-3 text-sm">
            {[
              { l: t("director.index.benjamin"), v: 18, c: "oklch(0.85 0.1 190)" },
              { l: t("director.index.alevin"), v: 32, c: "oklch(0.78 0.14 195)" },
              { l: t("director.index.infantil"), v: 28, c: "oklch(0.55 0.13 210)" },
              { l: t("director.index.junior"), v: 14, c: "oklch(0.42 0.13 220)" },
              { l: t("director.index.senior"), v: 8, c: "oklch(0.32 0.1 235)" },
            ].map((c) => (
              <li key={c.l}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-foreground">{c.l}</span>
                  <span className="text-muted-foreground">{c.v}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${c.v}%`, background: c.c }} />
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </>
  );
}

function FakeChart() {
  const bars = [40, 55, 48, 62, 70, 58, 75, 82];
  return (
    <div className="flex items-end gap-3 h-48">
      {bars.map((b, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2">
          <div
            className="w-full rounded-t-lg bg-gradient-water shadow-aqua transition-all hover:scale-105"
            style={{ height: `${b}%` }}
          />
          <span className="text-[10px] text-muted-foreground">S{i + 1}</span>
        </div>
      ))}
    </div>
  );
}
