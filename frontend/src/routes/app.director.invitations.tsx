import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, SectionCard } from "@/components/dashboard/Cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/app/director/invitations")({
  head: () => ({ meta: [{ title: "Invitaciones — Director Técnico" }] }),
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
  estado: string;
  fecha_creacion: string;
  fecha_expiracion: string;
}

function InvitationsPage({ t }: { t: (key: string) => string }) {
  const [invitaciones, setInvitaciones] = useState<Invitacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ email: "" });
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
        rol_asignado: "coach",
      });
      setSuccess(t("director.invitations.send_success"));
      setFormData({ email: "" });
      setShowForm(false);
      loadInvitaciones();
    } catch (err: any) {
      setInvError(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleCancelInvitation = async (id: string) => {
    if (!confirm(t("director.invitations.cancel_confirm"))) return;
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

  const pendingInvitations = invitaciones.filter(i => i.estado === "pendiente");

  return (
    <>
      <PageHeader
        title={t("director.invitations.title_page")}
        description={t("director.invitations.desc")}
        action={
          <Button variant="hero" onClick={() => setShowForm(!showForm)}>
            {showForm ? t("director.invitations.cancel") : "+ " + t("director.invitations.send")}
          </Button>
        }
      />

      {showForm && (
        <SectionCard title={t("director.invitations.send")}>
          <form onSubmit={handleSendInvitation} className="space-y-4">
            {invError && (
              <div className="rounded-lg bg-destructive/10 text-destructive p-3 text-sm">
                {invError}
              </div>
            )}
            {success && (
              <div className="rounded-lg bg-green-500/10 text-green-400 p-3 text-sm">
                {success}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("director.invitations.email")}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ email: e.target.value })}
                placeholder="entrenador@club.es"
                required
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {t("director.invitations.email_help")}
            </p>
            <div className="flex gap-2">
              <Button type="submit" variant="hero" disabled={sending}>
                {sending ? t("director.invitations.sending") : t("director.invitations.send")}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                {t("director.invitations.cancel")}
              </Button>
            </div>
          </form>
        </SectionCard>
      )}

      <SectionCard title={t("director.invitations.sent")}>
        {isLoading ? (
          <div className="h-64 rounded-xl bg-muted animate-pulse" />
        ) : error ? (
          <div className="rounded-lg bg-destructive/10 text-destructive p-4">{error}</div>
        ) : pendingInvitations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <svg className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p>{t("director.invitations.no_pending")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingInvitations.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium text-foreground">{inv.email_invitado}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("director.invitations.sent_on")}: {formatDate(inv.fecha_creacion)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${estadoColors[inv.estado] || "bg-muted text-muted-foreground"}`}>
                    {inv.estado === "pendiente" ? t("director.invitations.pending") : inv.estado}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleCancelInvitation(inv.id)}
                  >
                    {t("director.invitations.cancel")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </>
  );
}
