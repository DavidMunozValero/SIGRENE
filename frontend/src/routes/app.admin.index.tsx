import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, SectionCard, StatCard } from "@/components/dashboard/Cards";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export const Route = createFileRoute("/app/admin/")({
  head: () => ({ meta: [{ title: "Resumen — Federación Admin" }] }),
  component: AdminHome,
});

function AdminHome() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCoaches: 0,
    totalNadadores: 0,
    totalRegistros: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [usersRes, nadadoresRes, registrosRes] = await Promise.all([
          api.getUsuarios({ limit: 1 }),
          api.getNadadores({ limit: 1 }),
          api.getRegistros({ limit: 1 }),
        ]);

        const coachesCount = usersRes.datos?.filter((u: any) => u.rol === "coach").length || 0;

        setStats({
          totalUsers: usersRes.total || 0,
          totalCoaches: coachesCount,
          totalNadadores: nadadoresRes.total || 0,
          totalRegistros: registrosRes.total || 0,
        });
      } catch (err) {
        console.error("Error loading stats:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <>
      <PageHeader
        title="Panel de Administración"
        description="Gestiona usuarios, nadadores y configuración del sistema."
        action={
          <Button asChild variant="hero">
            <Link to="/app/admin/register-trainer">+ Registrar Usuario</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          label="Usuarios totales" 
          value={isLoading ? "..." : String(stats.totalUsers)} 
          icon={<span>👥</span>} 
        />
        <StatCard 
          label="Entrenadores" 
          value={isLoading ? "..." : String(stats.totalCoaches)} 
          icon={<span>🏊</span>} 
        />
        <StatCard 
          label="Nadadores" 
          value={isLoading ? "..." : String(stats.totalNadadores)} 
          icon={<span>🏅</span>} 
        />
        <StatCard 
          label="Registros" 
          value={isLoading ? "..." : String(stats.totalRegistros)} 
          icon={<span>📋</span>} 
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3 mt-6">
        <div className="lg:col-span-2">
          <SectionCard
            title="Acciones rápidas"
            description="Tareas comunes de administración"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Link to="/app/admin/users">
                <div className="rounded-lg border border-border/60 bg-card p-4 hover:shadow-glass transition-all cursor-pointer h-full">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500/15 grid place-items-center text-blue-400">
                      👥
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Gestionar Usuarios</p>
                      <p className="text-xs text-muted-foreground">Ver, editar y eliminar usuarios</p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link to="/app/admin/register-trainer">
                <div className="rounded-lg border border-border/60 bg-card p-4 hover:shadow-glass transition-all cursor-pointer h-full">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-aqua/15 grid place-items-center text-primary">
                      ➕
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Registrar Usuario</p>
                      <p className="text-xs text-muted-foreground">Admin, director, entrenador o nadador</p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link to="/app/admin/settings">
                <div className="rounded-lg border border-border/60 bg-card p-4 hover:shadow-glass transition-all cursor-pointer h-full">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-500/15 grid place-items-center text-orange-400">
                      ⚙️
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Mi Perfil</p>
                      <p className="text-xs text-muted-foreground">Editar nombre y contraseña</p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link to="/app/admin/preview">
                <div className="rounded-lg border border-border/60 bg-card p-4 hover:shadow-glass transition-all cursor-pointer h-full">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-500/15 grid place-items-center text-purple-400">
                      👁️
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Vista Previa</p>
                      <p className="text-xs text-muted-foreground">Ver qué ve cada rol</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Inicio rápido" description="Primeros pasos">
          <ul className="space-y-3 text-sm">
            {[
              { l: "Registrar primer entrenador", done: stats.totalCoaches > 0 },
              { l: "Registrar primer nadador", done: stats.totalNadadores > 0 },
              { l: "Invitar a otros administradores", done: stats.totalUsers > 1 },
            ].map((s, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className={`h-5 w-5 rounded-full grid place-items-center ${
                  s.done 
                    ? "bg-gradient-water text-white" 
                    : "border border-border bg-background"
                }`}>
                  {s.done && (
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                  )}
                </span>
                <span className={s.done ? "text-muted-foreground" : "text-foreground"}>{s.l}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </>
  );
}