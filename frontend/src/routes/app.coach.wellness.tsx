import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/dashboard/Cards";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/app/coach/wellness")({
  head: () => ({ meta: [{ title: "Wellness — Entrenador" }] }),
  component: WellnessPage,
});

const rows = [
  { n: "Ana Martín", sleep: 8, mood: 9, soreness: 2, fatigue: 3 },
  { n: "Luis Pérez", sleep: 7, mood: 7, soreness: 4, fatigue: 5 },
  { n: "Sofía Romero", sleep: 9, mood: 9, soreness: 1, fatigue: 2 },
  { n: "Diego Castro", sleep: 6, mood: 6, soreness: 5, fatigue: 6 },
  { n: "Marcos Torres", sleep: 5, mood: 5, soreness: 7, fatigue: 8 },
];

function cell(v: number, max = 10) {
  const ratio = v / max;
  const color = v >= 7 ? "oklch(0.78 0.14 195)" : v >= 5 ? "oklch(0.78 0.14 165)" : "oklch(0.65 0.2 25)";
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-foreground w-5">{v}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden max-w-[80px]">
        <div className="h-full rounded-full" style={{ width: `${ratio * 100}%`, background: color }} />
      </div>
    </div>
  );
}

function WellnessPage() {
  const { t } = useLanguage();
  return (
    <>
      <PageHeader title={t("coach.wellness.title_page")} description={t("coach.wellness.desc")} />
      <SectionCard title={t("coach.wellness.table_title")}>
        <div className="-m-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground tracking-wider">
              <tr>
                <th className="text-left px-5 py-3">{t("coach.wellness.table.swimmer")}</th>
                <th className="text-left px-5 py-3">{t("coach.wellness.table.sleep")}</th>
                <th className="text-left px-5 py-3">{t("coach.wellness.table.mood")}</th>
                <th className="text-left px-5 py-3">{t("coach.wellness.table.muscle")}</th>
                <th className="text-left px-5 py-3">{t("coach.wellness.table.fatigue")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((r) => (
                <tr key={r.n} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4 font-medium text-foreground">{r.n}</td>
                  <td className="px-5 py-4">{cell(r.sleep, 10)}</td>
                  <td className="px-5 py-4">{cell(r.mood)}</td>
                  <td className="px-5 py-4">{cell(10 - r.soreness)}</td>
                  <td className="px-5 py-4">{cell(10 - r.fatigue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </>
  );
}
