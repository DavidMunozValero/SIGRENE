import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/roles")({
  head: () => ({
    meta: [
      { title: "Roles y permisos — SIGRENE" },
      { name: "description", content: "Federation Admin, Director Técnico, Entrenador y Nadador: jerarquía y permisos en SIGRENE." },
      { property: "og:title", content: "Roles y permisos — SIGRENE" },
      { property: "og:description", content: "Cuatro niveles de acceso con aislamiento de datos por organización y grupo." },
    ],
  }),
  component: RolesPage,
});

const roles = [
  {
    name: "Federación Admin",
    to: "/app/admin",
    color: "from-[oklch(0.32_0.1_235)] to-[oklch(0.55_0.13_210)]",
    bullets: [
      "Crea y configura la organización (nombre, logo, zona horaria)",
      "Registra directamente entrenadores y nadadores",
      "Acceso a auditoría completa y ajustes de seguridad",
      "Puede desactivar coaches preservando datos de nadadores",
    ],
  },
  {
    name: "Director Técnico",
    to: "/app/director",
    color: "from-[oklch(0.42_0.13_220)] to-[oklch(0.72_0.13_195)]",
    bullets: [
      "Dashboard agregado con KPIs federativos",
      "Drill-down por grupos sin acceso a datos individuales",
      "Exporta informes anonimizados para terceros",
      "Vista ejecutiva para B2G y stakeholders",
    ],
  },
  {
    name: "Entrenador",
    to: "/app/coach",
    color: "from-[oklch(0.55_0.13_210)] to-[oklch(0.78_0.14_195)]",
    bullets: [
      "Gestiona sus nadadores registrados por el admin",
      "Ve wellness diario y carga de entrenamiento de su grupo",
      "Comparte informes con padres mediante enlaces seguros",
      "Solo accede a SUS nadadores: 403 al intentar otros",
    ],
  },
  {
    name: "Nadador",
    to: "/app/swimmer",
    color: "from-[oklch(0.72_0.13_195)] to-[oklch(0.85_0.1_190)]",
    bullets: [
      "Accede a su panel personal con credenciales del admin",
      "Completa wellness matinal antes del entreno",
      "Consulta su histórico personal y progreso",
      "Visibilidad estricta a sus propios datos",
    ],
  },
];

function RolesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Jerarquía</p>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight">
            Cuatro roles con permisos estrictos.
          </h1>
          <p className="mt-4 text-muted-foreground text-lg">
            Cada rol ve exactamente lo que necesita ver. Ni más, ni menos.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {roles.map((r) => (
            <div key={r.name} className="rounded-3xl bg-card border border-border/60 overflow-hidden shadow-glass hover:shadow-elevated transition-all">
              <div className={`h-2 bg-gradient-to-r ${r.color}`} />
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-foreground">{r.name}</h3>
                  <Button asChild variant="outline" size="sm">
                    <Link to={r.to}>Ver demo →</Link>
                  </Button>
                </div>
                <ul className="mt-4 space-y-2.5">
                  {r.bullets.map((b) => (
                    <li key={b} className="flex gap-2.5 text-sm text-muted-foreground">
                      <svg className="h-4 w-4 text-primary shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
