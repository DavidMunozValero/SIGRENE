import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, SectionCard } from "@/components/dashboard/Cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/app/admin/invitations")({
  head: () => ({ meta: [{ title: "Invitaciones — Superadmin" }] }),
  component: InvitationsPageWithI18n,
});

function InvitationsPageWithI18n() {
  const { t } = useLanguage();
  return <InvitationsPage t={t} />;
}

interface Invitacion {
  id: string;
  email_invitado: string;
  rol_asignado: string;
  token: string;
  invitador_email: string;
  estado: string;
  fecha_creacion: string;
  fecha_expiracion: string;
}

function InvitationsPage({ t }: { t: (key: string) => string }) {
  const [invitaciones, setInvitaciones] = useState<Invitacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ email: "", rol: "director_tecnico" });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [invError, setInvError] = useState<string | null>(null);

  useEffect(() => {
    loadInvitaciones();
  }, []);

  async function loadInvitaciones() {
    try {
      setIsLoading(true);
      const res = await api.getInvitaciones({ limit: 100 });
      setInvitaciones(res.datos || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setInvError(null);
    setSuccess(null);
    setSending(true);

    try {
      await api.crearInvitacion({
        email_invitado: formData.email,
        rol_asignado: formData.rol,
      });
      setSuccess(t("admin.invitations.send_success"));
      setFormData({ email: "", rol: "director_tecnico" });
      setShowForm(false);
      loadInvitaciones();
    } catch (err: any) {
      setInvError(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleCancelInvitation = async (id: string) => {
    if (!confirm(t("admin.invitations.cancel_confirm"))) return;
    try {
      await api.cancelarInvitacion(id);
      loadInvitaciones();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  const estadoColors: Record<string, string> = {
    pendiente: "bg-yellow-500/15 text-yellow-400",
    aceptada: "bg-green-500/15 text-green-400",
    expirada: "bg-red-500/15 text-red-400",
  };

  const rolLabels: Record<string, string> = {
    director_tecnico: t("app.director_tecnico"),
    coach: t("app.coach"),
    swimmer: t("app.swimmer"),
  };

  return (
    <>
      <PageHeader
        title={t("admin.invitations.title_page")}
        description={t("admin.invitations.desc")}
        action={
          <Button asChild variant="outline">
            <Link to="/app/admin/users">← {t("admin.invitations.manage_users")}</Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <SectionCard title={t("admin.invitations.register")} description={t("admin.invitations.register_desc")}>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{t("admin.invitations.register_desc2")}</p>
              <Button asChild variant="hero">
                <Link to="/app/admin/register-trainer">+ {t("admin.invitations.register")}</Link>
              </Button>
            </div>
          </SectionCard>

          <SectionCard title={t("admin.invitations.send")} description={t("admin.invitations.send_desc")}>
            <form onSubmit={handleSendInvitation} className="space-y-4">
              {invError && (
                <div className="rounded-lg bg-destructive/10 text-destructive p-3 text-sm">{invError}</div>
              )}
              {success && (
                <div className="rounded-lg bg-green-500/10 text-green-400 p-3 text-sm">{success}</div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">{t("admin.invitations.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="director@federacion.es"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Rol</Label>
                <div className="grid grid-cols-3 gap-2">
                  {["director_tecnico", "coach", "swimmer"].map((rol) => (
                    <button
                      key={rol}
                      type="button"
                      onClick={() => setFormData({ ...formData, rol })}
                      className={`rounded-lg border px-3 py-2 text-sm text-left transition-colors ${
                        formData.rol === rol
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-background hover:border-primary/40 text-foreground"
                      }`}
                    >
                      {rolLabels[rol]}
                    </button>
                  ))}
                </div>
              </div>
              <Button type="submit" variant="hero" className="w-full" disabled={sending}>
                {sending ? t("admin.invitations.sending") : t("admin.invitations.send")}
              </Button>
            </form>
          </SectionCard>
        </div>

        <SectionCard title={t("admin.invitations.all")}>
          {isLoading ? (
            <div className="h-64 rounded-xl bg-muted animate-pulse" />
          ) : error ? (
            <div className="rounded-lg bg-destructive/10 text-destructive p-4">{error}</div>
          ) : invitaciones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <svg className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p>{t("admin.invitations.no_invitations")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invitaciones.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium text-foreground">{inv.email_invitado}</p>
                    <p className="text-xs text-muted-foreground">
                      {rolLabels[inv.rol_asignado]} · {t("admin.invitations.by")}: {inv.invitador_email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(inv.fecha_creacion)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${estadoColors[inv.estado] || "bg-muted text-muted-foreground"}`}>
                      {inv.estado}
                    </span>
                    {inv.estado === "pendiente" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleCancelInvitation(inv.id)}
                      >
                        {t("admin.invitations.cancel")}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </>
  );
}
