import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, SectionCard } from "@/components/dashboard/Cards";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/app/admin/preview")({
  head: () => ({ meta: [{ title: "Vista Previa Roles — Admin" }] }),
  component: PreviewPageWithI18n,
});

function PreviewPageWithI18n() {
  const { t } = useLanguage();
  return <PreviewPage t={t} />;
}

interface Usuario {
  email: string;
  nombre_completo: string;
  rol: string;
  activo: boolean;
}

function PreviewPage({ t }: { t: (key: string) => string }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUsuarios() {
      try {
        const response = await api.getUsuarios({ limit: 500 });
        setUsuarios(response.datos || []);
      } catch (err) {
        console.error("Error loading usuarios:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadUsuarios();
  }, []);

  const usuariosByRol = {
    superadmin: usuarios.filter(u => u.rol === "superadmin"),
    admin_federacion: usuarios.filter(u => u.rol === "admin_federacion"),
    director_tecnico: usuarios.filter(u => u.rol === "director_tecnico"),
    coach: usuarios.filter(u => u.rol === "coach"),
    swimmer: usuarios.filter(u => u.rol === "swimmer"),
  };

  const ROLE_INFO = [
    {
      rol: "superadmin",
      label: "Superadmin",
      description: t("admin.register.full_access"),
      routes: ["/app/admin", "/app/admin/users", "/app/admin/settings", "/app/admin/pending"],
      color: "bg-red-500/15 text-red-400 border-red-500/30",
    },
    {
      rol: "admin_federacion",
      label: "Admin Federación",
      description: t("admin.register.federation_admin"),
      routes: ["/app/admin", "/app/admin/users", "/app/admin/settings"],
      color: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    },
    {
      rol: "director_tecnico",
      label: "Director Técnico",
      description: t("admin.register.dashboard"),
      routes: ["/app/director", "/app/director/groups", "/app/director/reports"],
      color: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    },
    {
      rol: "coach",
      label: "Entrenador",
      description: t("admin.register.coach_management"),
      routes: ["/app/coach", "/app/coach/swimmers", "/app/coach/wellness"],
      color: "bg-aqua/15 text-primary border-aqua/30",
    },
    {
      rol: "swimmer",
      label: t("admin.preview.swimmer_label"),
      description: t("admin.register.swimmer_panel"),
      routes: ["/app/swimmer", "/app/swimmer/history", "/app/swimmer/profile"],
      color: "bg-green-500/15 text-green-400 border-green-500/30",
    },
  ];

  return (
    <>
      <PageHeader
        title={t("admin.preview.title_page")}
        description={t("admin.preview.desc")}
      />

      <div className="space-y-6">
        <SectionCard title={t("admin.preview.about")}>
          <p className="text-sm text-muted-foreground mb-4">
            {t("admin.preview.about_desc")}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.open("/login", "_blank")}>
              {t("admin.preview.open_login")}
            </Button>
          </div>
        </SectionCard>

        <div className="grid gap-6 lg:grid-cols-2">
          {ROLE_INFO.map((info) => {
            const roleUsers = usuariosByRol[info.rol as keyof typeof usuariosByRol] || [];
            const activeUsers = roleUsers.filter(u => u.activo);
            
            return (
              <SectionCard 
                key={info.rol}
                title={
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${info.color}`}>
                    {info.rol.toUpperCase()}
                  </span>
                }
                description={info.description}
              >
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{t("admin.preview.menu_routes")}</p>
                    <div className="flex flex-wrap gap-1">
                      {info.routes.map(route => (
                        <span key={route} className="text-xs font-mono bg-muted px-2 py-1 rounded">
                          {route}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                      {t("admin.preview.users_test")} {info.rol === "superadmin" || info.rol === "admin_federacion" ? "" : t("admin.preview.users_test_desc")}
                    </p>
                    {isLoading ? (
                      <p className="text-sm text-muted-foreground">{t("admin.preview.loading")}</p>
                    ) : roleUsers.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{t("admin.preview.no_users")}</p>
                    ) : (
                      <div className="space-y-2">
                        {roleUsers.slice(0, 3).map(u => (
                          <div key={u.email} className="flex items-center justify-between text-sm bg-muted/50 rounded-lg px-3 py-2">
                            <div>
                              <p className="font-medium">{u.nombre_completo || t("admin.pending.no_name")}</p>
                              <p className="text-xs text-muted-foreground">{u.email}</p>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              u.activo ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
                            }`}>
                              {u.activo ? t("admin.preview.active") : t("admin.preview.inactive")}
                            </span>
                          </div>
                        ))}
                        {roleUsers.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{roleUsers.length - 3} más
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </SectionCard>
            );
          })}
        </div>

        <SectionCard title={t("admin.preview.test_flow")} description={t("admin.preview.test_flow_desc")}>
          <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
            <li>{t("admin.preview.step1")}</li>
            <li>{t("admin.preview.step2")}</li>
            <li>{t("admin.preview.step3")}</li>
          </ol>
          
          <div className="mt-4 pt-4 border-t border-border/60">
            <p className="text-xs text-muted-foreground mb-3">{t("admin.preview.test_credentials")}</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { rol: "Superadmin", email: "admin@sigrene.com" },
                { rol: "Entrenador", email: "carlos@fnm.es" },
                { rol: t("admin.preview.swimmer_label"), email: "maria@club.es" },
              ].map(c => (
                <div key={c.email} className="text-xs bg-muted/50 rounded-lg px-3 py-2">
                  <span className="font-medium">{c.rol}:</span>{" "}
                  <span className="font-mono">{c.email}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>
    </>
  );
}
