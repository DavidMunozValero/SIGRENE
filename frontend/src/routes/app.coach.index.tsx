import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, SectionCard, StatCard } from "@/components/dashboard/Cards";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export const Route = createFileRoute("/app/coach/")({
  head: () => ({ meta: [{ title: "Mi grupo — Entrenador" }] }),
  component: CoachHome,
});

interface Nadador {
  id_seudonimo: string;
  nombre: string;
  club?: string;
}

interface DashboardStats {
  total_sesiones: number;
  volumen_total: number;
  duracion_total: number;
  volumen_semanal: number;
  sesiones_semanales: number;
  rpe_promedio: number;
  srpe_promedio: number;
}

function CoachHome() {
  const [nadadores, setNadadores] = useState<Nadador[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [nadadoresRes, statsRes] = await Promise.all([
          api.getNadadores(),
          api.getDashboardStats(),
        ]);
        setNadadores(nadadoresRes.datos || []);
        setStats(statsRes);
      } catch (err: any) {
        setError(err.message || "Error cargando datos");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Mi grupo"
          description="Cargando datos..."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-destructive/10 text-destructive p-4">
        {error}
      </div>
    );
  }

  const nadadorCount = nadadores.length;

  return (
    <>
      <PageHeader
        title="Mi grupo"
        description={`${nadadorCount} nadadores registrados.`}
        action={<Button variant="hero">+ Invitar nadador</Button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Nadadores" value={String(nadadorCount)} delta="Total registrados" />
        <StatCard
          label="Sesiones totales"
          value={String(stats?.total_sesiones || 0)}
          delta={`${stats?.sesiones_semanales || 0} esta semana`}
        />
        <StatCard
          label="Volumen semanal"
          value={`${((stats?.volumen_semanal || 0) / 1000).toFixed(1)}km`}
          delta="Metros acumulados"
        />
        <StatCard
          label="RPE medio"
          value={stats?.rpe_promedio?.toFixed(1) || "-"}
          delta="Esfuerzo percibido"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2 mt-6">
        <SectionCard
          title="Nadadores"
          description="Tu grupo de entrenamiento"
        >
          {nadadores.length === 0 ? (
            <p className="text-muted-foreground text-sm">No hay nadadores registrados.</p>
          ) : (
            <ul className="space-y-2">
              {nadadores.slice(0, 6).map((n) => (
                <li key={n.id_seudonimo} className="flex items-center gap-3 p-2 rounded-lg bg-muted/40">
                  <div className="h-9 w-9 rounded-full bg-gradient-water grid place-items-center text-white text-xs font-semibold shadow-aqua">
                    {n.nombre?.split(" ").map((x) => x[0]).join("").slice(0, 2) || n.id_seudonimo[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{n.nombre}</p>
                    <p className="text-xs text-muted-foreground">{n.id_seudonimo} · {n.club || "Sin club"}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Resumen de entrenamiento" description="Datos de la semana">
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/40">
              <span className="text-sm text-muted-foreground">Duración total</span>
              <span className="text-sm font-semibold">{stats?.duracion_total || 0} min</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/40">
              <span className="text-sm text-muted-foreground">sRPE promedio</span>
              <span className="text-sm font-semibold">{stats?.srpe_promedio?.toFixed(1) || "-"}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/40">
              <span className="text-sm text-muted-foreground">Volumen total</span>
              <span className="text-sm font-semibold">{(stats?.volumen_total || 0).toLocaleString()}m</span>
            </div>
          </div>
        </SectionCard>
      </div>
    </>
  );
}
