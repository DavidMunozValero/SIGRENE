import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/roles")({
  head: () => ({
    meta: [
      { title: "Roles — SIGRENE" },
      { name: "description", content: "Director Técnico, Entrenador y Nadador: tres perfiles con acceso adaptado a cada rol." },
      { property: "og:title", content: "Roles — SIGRENE" },
      { property: "og:description", content: "Tres perfiles adaptados para gestionar el rendimiento de nadadores." },
    ],
  }),
  component: RolesPage,
});

const roles = [
  {
    name: "Director Técnico",
    icon: "chart",
    tag: "Estrategia",
    bullets: [
      "Dashboard agregado con métricas de rendimiento federativo",
      "Análisis de participación y tendencia de los clubes",
      "Vista general para gestión deportiva",
    ],
  },
  {
    name: "Entrenador",
    icon: "clock",
    tag: "Operación",
    bullets: [
      "Gestiona su grupo de nadadores",
      "Consulta rendimientos y seguimiento diario",
      "Comparte informes con familias",
    ],
  },
  {
    name: "Nadador",
    icon: "swimmer",
    tag: "Seguimiento",
    bullets: [
      "Registro personal con credenciales de invitación",
      "Completar su seguimiento diario de forma",
      "Consulta su histórico personal y progreso",
    ],
  },
];

function RolesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Roles</p>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight">
            Tres perfiles, una misma plataforma.
          </h1>
          <p className="mt-4 text-muted-foreground text-lg">
            Acceso por capas con aislamiento de datos entre organizaciones y entre grupos del mismo entrenador.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((r) => (
            <div key={r.name} className="rounded-2xl bg-card border border-border/60 p-6 shadow-glass hover:shadow-elevated hover:-translate-y-1 transition-all duration-300">
              <div className="absolute -top-3 right-4 rounded-full bg-aqua/20 text-primary text-[10px] font-semibold px-2 py-1">
                {r.tag}
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-water grid place-items-center text-white shadow-aqua mb-4">
                {r.icon === "chart" && (
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                )}
                {r.icon === "clock" && (
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                )}
                {r.icon === "swimmer" && (
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12c1.5-1.5 3-2 5-2s3.5.5 5 2 3 2 5 2 3.5-.5 5-2"/><path d="M2 17c1.5-1.5 3-2 5-2s3.5.5 5 2 3 2 5 2 3.5-.5 5-2"/><circle cx="8" cy="5" r="2"/><path d="m9 8-1.5 1.5"/></svg>
                )}
              </div>
              <h3 className="font-semibold text-foreground">{r.name}</h3>
              <ul className="mt-4 space-y-2">
                {r.bullets.map((b) => (
                  <li key={b} className="flex gap-2.5 text-sm text-muted-foreground">
                    <svg className="h-4 w-4 text-primary shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-6">¿Listo para empezar?</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild variant="hero" size="lg">
              <Link to="/register">Empezar ahora</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/login">Acceder</Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
