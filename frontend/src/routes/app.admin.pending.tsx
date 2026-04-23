import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, SectionCard } from "@/components/dashboard/Cards";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/app/admin/pending")({
  head: () => ({ meta: [{ title: "Solicitudes Pendientes — Admin" }] }),
  component: PendingPageWithI18n,
});

function PendingPageWithI18n() {
  const { t } = useLanguage();
  return <PendingPage t={t} />;
}

interface Usuario {
  email: string;
  nombre_completo: string;
  rol: string;
  nadadores_asignados: string[];
  activo: boolean;
  estado_aprobacion: string;
  aprobado_por?: string;
  fecha_aprobacion?: string;
  fecha_registro?: string;
  created_at?: string;
}

const ROLE_LABELS: Record<string, string> = {
  superadmin: "Superadmin",
  admin_federacion: "Admin Federación",
  director_tecnico: "Director Técnico",
  coach: "Entrenador",
  swimmer: "Nadador",
};

const ROLE_COLORS: Record<string, string> = {
  superadmin: "bg-red-500/15 text-red-400",
  admin_federacion: "bg-orange-500/15 text-orange-400",
  director_tecnico: "bg-blue-500/15 text-blue-400",
  coach: "bg-aqua/15 text-primary",
  swimmer: "bg-green-500/15 text-green-400",
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function PendingPage({ t }: { t: (key: string) => string }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadPendientes();
  }, []);

  async function loadPendientes() {
    try {
      setIsLoading(true);
      const response = await api.getRegistrosPendientes();
      setUsuarios(response.datos || []);
    } catch (err: any) {
      setError(err.message || t("admin.pending.error_loading"));
    } finally {
      setIsLoading(false);
    }
  }

  const handleAprobar = async (email: string) => {
    try {
      setProcessing(email);
      await api.aprobarUsuario(email);
      loadPendientes();
    } catch (err: any) {
      alert(err.message || t("admin.pending.error_approving"));
    } finally {
      setProcessing(null);
    }
  };

  const handleRechazar = async (email: string) => {
    if (!confirm(`${t("admin.pending.reject_confirm")} ${email}?`)) return;
    try {
      setProcessing(email);
      await api.rechazarUsuario(email);
      loadPendientes();
    } catch (err: any) {
      alert(err.message || t("admin.pending.error_rejecting"));
    } finally {
      setProcessing(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <PageHeader title={t("admin.pending.title_page")} description={t("admin.pending.loading")} />
        <div className="h-64 rounded-xl bg-muted animate-pulse" />
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

  return (
    <>
      <PageHeader
        title={t("admin.pending.title_page")}
        description={`${usuarios.length} ${t("admin.pending.count")}`}
      />

      {usuarios.length === 0 ? (
        <SectionCard title={t("admin.pending.no_pending")}>
          <div className="text-center py-8 text-muted-foreground">
            <svg className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{t("admin.pending.no_pending_desc")}</p>
          </div>
        </SectionCard>
      ) : (
        <SectionCard title={`${usuarios.length} ${t("admin.pending.count")}`}>
          <div className="-m-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground tracking-wider">
                <tr>
                  <th className="text-left px-5 py-3">{t("admin.pending.table.applicant")}</th>
                  <th className="text-left px-5 py-3">{t("admin.pending.table.role")}</th>
                  <th className="text-left px-5 py-3">{t("admin.pending.table.date")}</th>
                  <th className="text-right px-5 py-3">{t("admin.pending.table.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {usuarios.map((u) => (
                  <tr key={u.email} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-water grid place-items-center text-white text-xs font-semibold shadow-aqua">
                          {(u.nombre_completo?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || u.email?.[0] || "?").toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{u.nombre_completo || t("admin.pending.no_name")}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${ROLE_COLORS[u.rol] || "bg-muted text-muted-foreground"}`}>
                        {ROLE_LABELS[u.rol] || u.rol}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {formatDate(u.fecha_registro || u.created_at)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          disabled={processing === u.email}
                          onClick={() => handleAprobar(u.email)}
                        >
                          {processing === u.email ? t("admin.pending.processing") : t("admin.pending.approve")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          disabled={processing === u.email}
                          onClick={() => handleRechazar(u.email)}
                        >
                          {t("admin.pending.reject")}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </>
  );
}
