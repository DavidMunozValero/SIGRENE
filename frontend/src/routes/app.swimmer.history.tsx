import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/dashboard/Cards";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/app/swimmer/history")({
  head: () => ({ meta: [{ title: "Mi historial — Nadador" }] }),
  component: HistoryPage,
});

const days = Array.from({ length: 14 }, (_, i) => ({
  d: `${14 - i} abr`,
  sleep: Math.round(6 + Math.random() * 3),
  mood: Math.round(6 + Math.random() * 4),
  fatigue: Math.round(3 + Math.random() * 5),
}));

function HistoryPage() {
  const { t } = useLanguage();
  return (
    <>
      <PageHeader
        title={t("swimmer.history.title_page")}
        description={t("swimmer.history.desc")}
      />
      <SectionCard title={t("swimmer.history.trend")}>
        <div className="flex items-end gap-2 h-40">
          {days.reverse().map((d) => (
            <div
              key={d.d}
              className="flex-1 flex flex-col items-center gap-1.5"
            >
              <div
                className="w-full flex flex-col gap-0.5 items-center"
                style={{ height: "100%" }}
              >
                <div
                  className="w-full rounded-t bg-gradient-water shadow-aqua"
                  style={{ height: `${d.sleep * 8}%` }}
                  title={`Sueño ${d.sleep}h`}
                />
              </div>
              <span className="text-[9px] text-muted-foreground">{d.d}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="mt-6">
        <SectionCard title="Registro detallado">
          <div className="-m-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground tracking-wider">
                <tr>
                  <th className="text-left px-5 py-3">
                    {t("swimmer.history.table.date")}
                  </th>
                  <th className="text-left px-5 py-3">
                    {t("swimmer.history.table.sleep")}
                  </th>
                  <th className="text-left px-5 py-3">
                    {t("swimmer.history.table.mood")}
                  </th>
                  <th className="text-left px-5 py-3">
                    {t("swimmer.history.table.fatigue")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {days.map((d) => (
                  <tr key={d.d} className="hover:bg-muted/30">
                    <td className="px-5 py-3 font-medium text-foreground">
                      {d.d}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {d.sleep} h
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {d.mood}/10
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {d.fatigue}/10
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </>
  );
}
