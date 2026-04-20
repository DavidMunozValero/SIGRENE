import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, SectionCard, StatCard } from "@/components/dashboard/Cards";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/admin/")({
  head: () => ({ meta: [{ title: "Resumen — Federación Admin" }] }),
  component: AdminHome,
});

function AdminHome() {
  return (
    <>
      <PageHeader
        title="Resumen federativo"
        description="Estado general de la Federación Natación Madrid."
        action={
          <Button asChild variant="hero">
            <Link to="/app/admin/invitations">Invitar entrenador</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Entrenadores activos" value="24" delta="+3 este mes" icon={<span>👥</span>} />
        <StatCard label="Nadadores totales" value="312" delta="+18 esta semana" icon={<span>🏊</span>} />
        <StatCard label="Invitaciones pendientes" value="7" delta="2 expiran pronto" icon={<span>✉️</span>} />
        <StatCard label="Logins (30d)" value="1.842" delta="99.4% éxito" icon={<span>🔐</span>} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3 mt-6">
        <div className="lg:col-span-2">
          <SectionCard
            title="Actividad reciente"
            description="Últimos eventos de auditoría"
            action={<Button variant="ghost" size="sm">Ver todo</Button>}
          >
            <ul className="divide-y divide-border/60 -m-5">
              {[
                { who: "Carlos Ruiz", what: "aceptó invitación", when: "hace 2 min", tag: "invite" },
                { who: "Marina López", what: "inició sesión", when: "hace 12 min", tag: "login" },
                { who: "Pedro Sanz", what: "creó grupo 'Alevín A'", when: "hace 1 h", tag: "group" },
                { who: "Anónimo", what: "intento fallido x3", when: "hace 3 h", tag: "fail" },
                { who: "Ana García", what: "actualizó ajustes", when: "ayer", tag: "settings" },
              ].map((it, i) => (
                <li key={i} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-water grid place-items-center text-white text-xs font-semibold shadow-aqua">
                      {it.who[0]}
                    </div>
                    <div>
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{it.who}</span> {it.what}
                      </p>
                      <p className="text-xs text-muted-foreground">{it.when}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${
                    it.tag === "fail" ? "bg-destructive/10 text-destructive" : "bg-aqua/15 text-primary"
                  }`}>{it.tag}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>

        <SectionCard title="Onboarding" description="Tu progreso inicial">
          <ul className="space-y-3 text-sm">
            {[
              { l: "Crear federación", done: true },
              { l: "Configurar logo y zona horaria", done: true },
              { l: "Invitar al primer entrenador", done: true },
              { l: "Activar 2FA en tu cuenta", done: false },
              { l: "Revisar política GDPR", done: false },
            ].map((s) => (
              <li key={s.l} className="flex items-center gap-3">
                <span className={`h-5 w-5 rounded-full grid place-items-center ${s.done ? "bg-gradient-water text-white" : "border border-border bg-background"}`}>
                  {s.done && <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>}
                </span>
                <span className={s.done ? "text-muted-foreground line-through" : "text-foreground"}>{s.l}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </>
  );
}
