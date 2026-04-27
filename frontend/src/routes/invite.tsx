import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/lib/i18n";
import { api } from "@/lib/api";

export const Route = createFileRoute("/invite")({
  head: () => ({
    meta: [
      { title: "invite.page.title" },
      { name: "description", content: "invite.page.desc" },
    ],
  }),
  component: InvitePage,
});

function InvitePage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [rolMostrado, setRolMostrado] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    if (tokenParam) {
      setToken(tokenParam);
      try {
        const payload = JSON.parse(atob(tokenParam.split('.')[1]));
        if (payload.rol) {
          const rolMap: Record<string, string> = {
            director_tecnico: t("app.director_tecnico"),
            coach: t("app.coach"),
            swimmer: t("app.swimmer"),
          };
          setRolMostrado(rolMap[payload.rol] || payload.rol);
        }
      } catch (e) {
        console.error("Error parsing token:", e);
      }
    }
  }, [t]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError(t("invite.invalid_token"));
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);

    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const nombreCompleto = formData.get("nombre_completo") as string;

    if (password !== confirmPassword) {
      setError(t("invite.passwords_mismatch"));
      return;
    }

    if (password.length < 8) {
      setError(t("invite.password_min"));
      return;
    }

    if (!nombreCompleto || nombreCompleto.length < 2) {
      setError(t("invite.name_required"));
      return;
    }

    setIsLoading(true);

    try {
      await api.aceptarInvitacion({
        token,
        nombre_completo: nombreCompleto,
        password,
      });
      navigate({ to: "/login" });
    } catch (err: any) {
      setError(err.message || t("invite.error"));
    } finally {
      setIsLoading(false);
    }
  };

  const rolLabel = rolMostrado || t("invite.role_unknown");

  return (
    <AuthShell
      title={t("invite.title")}
      subtitle={t("invite.subtitle")}
      footer={
        <>
          {t("invite.has_account")}{" "}
          <Link to="/login" className="text-aqua font-medium hover:underline">{t("invite.sign_in")}</Link>
        </>
      }
    >
      {error && (
        <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3 mb-4">
          {error}
        </div>
      )}

      {!token ? (
        <div className="rounded-xl bg-destructive/15 border border-destructive/30 p-4 text-sm">
          <p className="text-destructive font-medium">{t("invite.no_token")}</p>
          <p className="text-muted-foreground mt-1">{t("invite.no_token_desc")}</p>
        </div>
      ) : (
        <>
          <div className="rounded-xl bg-aqua/15 border border-aqua/30 p-3 text-sm mb-4">
            <p className="text-foreground">
              {t("invite.invited_as")}{" "}
              <span className="font-semibold text-primary">{rolLabel}</span>.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nombre_completo">{t("invite.full_name")}</Label>
              <Input
                id="nombre_completo"
                name="nombre_completo"
                placeholder={t("invite.full_name_placeholder")}
                required
                minLength={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{t("invite.create_password")}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder={t("invite.password_placeholder")}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">{t("invite.confirm_password")}</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder={t("invite.confirm_password_placeholder")}
                required
                minLength={8}
              />
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? t("invite.accepting") : t("invite.accept")}
            </Button>
          </form>
        </>
      )}
    </AuthShell>
  );
}
