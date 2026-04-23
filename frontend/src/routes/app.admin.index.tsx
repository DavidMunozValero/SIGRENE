import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, SectionCard, StatCard } from "@/components/dashboard/Cards";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/app/admin/")({
  head: () => ({ meta: [{ title: "Resumen — Federación Admin" }] }),
  component: AdminHome,
});

function AdminHome() {
  const { t } = useLanguage();
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
        title={t("admin.index.panel_title")}
        description={t("admin.index.panel_desc")}
        action={
          <Button asChild variant="hero">
            <Link to="/app/admin/register-trainer">+ {t("admin.index.register_user")}</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          label={t("admin.index.total_users")} 
          value={isLoading ? "..." : String(stats.totalUsers)} 
          icon={<span>👥</span>} 
        />
        <StatCard 
          label={t("admin.index.coaches")} 
          value={isLoading ? "..." : String(stats.totalCoaches)} 
          icon={<span>🏊</span>} 
        />
        <StatCard 
          label={t("admin.index.swimmers")} 
          value={isLoading ? "..." : String(stats.totalNadadores)} 
          icon={<span>🏅</span>} 
        />
        <StatCard 
          label={t("admin.index.records")} 
          value={isLoading ? "..." : String(stats.totalRegistros)} 
          icon={<span>📋</span>} 
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3 mt-6">
        <div className="lg:col-span-2">
          <SectionCard
            title={t("admin.index.quick_actions")}
            description={t("admin.index.quick_actions_desc")}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Link to="/app/admin/users">
                <div className="rounded-lg border border-border/60 bg-card p-4 hover:shadow-glass transition-all cursor-pointer h-full">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500/15 grid place-items-center text-blue-400">
                      👥
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{t("admin.index.manage_users")}</p>
                      <p className="text-xs text-muted-foreground">{t("admin.index.manage_users_desc")}</p>
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
                      <p className="font-medium text-foreground">{t("admin.index.register_user_action")}</p>
                      <p className="text-xs text-muted-foreground">{t("admin.index.register_user_desc")}</p>
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
                      <p className="font-medium text-foreground">{t("admin.index.my_profile")}</p>
                      <p className="text-xs text-muted-foreground">{t("admin.index.my_profile_desc")}</p>
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
                      <p className="font-medium text-foreground">{t("admin.index.preview")}</p>
                      <p className="text-xs text-muted-foreground">{t("admin.index.preview_desc")}</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </SectionCard>
        </div>

        <SectionCard title={t("admin.index.quick_start")} description={t("admin.index.quick_start_desc")}>
          <ul className="space-y-3 text-sm">
            {[
              { l: t("admin.index.register_first_coach"), done: stats.totalCoaches > 0 },
              { l: t("admin.index.register_first_swimmer"), done: stats.totalNadadores > 0 },
              { l: t("admin.index.invite_admins"), done: stats.totalUsers > 1 },
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