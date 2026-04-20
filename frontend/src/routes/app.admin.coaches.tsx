import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/dashboard/Cards";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/admin/coaches")({
  head: () => ({ meta: [{ title: "Entrenadores — Admin" }] }),
  component: CoachesPage,
});

const coaches = [
  { name: "Carlos Ruiz", email: "carlos@fnm.es", group: "Alevín A", swimmers: 18, status: "active" },
  { name: "Marina López", email: "marina@fnm.es", group: "Junior", swimmers: 14, status: "active" },
  { name: "Pedro Sanz", email: "pedro@fnm.es", group: "Senior", swimmers: 22, status: "active" },
  { name: "Lucía Vega", email: "lucia@fnm.es", group: "Benjamín", swimmers: 11, status: "inactive" },
];

function CoachesPage() {
  return (
    <>
      <PageHeader
        title="Entrenadores"
        description="Gestiona los entrenadores de la federación."
        action={<Button variant="hero">+ Invitar entrenador</Button>}
      />
      <SectionCard title={`${coaches.length} entrenadores`}>
        <div className="-m-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground tracking-wider">
              <tr>
                <th className="text-left px-5 py-3">Nombre</th>
                <th className="text-left px-5 py-3">Grupo</th>
                <th className="text-left px-5 py-3">Nadadores</th>
                <th className="text-left px-5 py-3">Estado</th>
                <th className="text-right px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {coaches.map((c) => (
                <tr key={c.email} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-water grid place-items-center text-white text-xs font-semibold shadow-aqua">
                        {c.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{c.group}</td>
                  <td className="px-5 py-4 text-muted-foreground">{c.swimmers}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      c.status === "active" ? "bg-aqua/15 text-primary" : "bg-muted text-muted-foreground"
                    }`}>
                      {c.status === "active" ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button variant="ghost" size="sm">Editar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </>
  );
}
