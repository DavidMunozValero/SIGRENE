import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/dashboard/Cards";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/app/director/groups")({
  head: () => ({ meta: [{ title: "Grupos — Director" }] }),
  component: GroupsPage,
});

const groups = [
  { name: "Alevín A", coach: "Carlos Ruiz", swimmers: 18, acwr: 1.12, attendance: "91%" },
  { name: "Junior", coach: "Marina López", swimmers: 14, acwr: 1.34, attendance: "84%" },
  { name: "Senior", coach: "Pedro Sanz", swimmers: 22, acwr: 1.21, attendance: "88%" },
  { name: "Benjamín", coach: "Lucía Vega", swimmers: 11, acwr: 0.95, attendance: "79%" },
];

function GroupsPage() {
  const { t } = useLanguage();
  return (
    <>
      <PageHeader title={t("director.groups.title_page")} description={t("director.groups.desc")} />
      <SectionCard title={`${groups.length} ${t("director.groups.count")}`}>
        <div className="-m-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground tracking-wider">
              <tr>
                <th className="text-left px-5 py-3">{t("director.groups.table.group")}</th>
                <th className="text-left px-5 py-3">{t("director.groups.table.coach")}</th>
                <th className="text-left px-5 py-3">{t("director.groups.table.swimmers")}</th>
                <th className="text-left px-5 py-3">{t("director.groups.table.acwr")}</th>
                <th className="text-left px-5 py-3">{t("director.groups.table.attendance")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {groups.map((g) => (
                <tr key={g.name} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4 font-medium text-foreground">{g.name}</td>
                  <td className="px-5 py-4 text-muted-foreground">{g.coach}</td>
                  <td className="px-5 py-4 text-muted-foreground">{g.swimmers}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      g.acwr > 1.3 ? "bg-destructive/10 text-destructive" : "bg-aqua/15 text-primary"
                    }`}>
                      {g.acwr}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{g.attendance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </>
  );
}
