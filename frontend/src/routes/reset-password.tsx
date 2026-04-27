import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "reset.page.title" },
      { name: "description", content: "reset.page.desc" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    if (!tokenParam) {
      setError("Token no proporcionado");
    } else {
      setToken(tokenParam);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError(t("admin.settings.passwords_mismatch"));
      return;
    }

    if (newPassword.length < 8) {
      setError(t("admin.settings.password_min"));
      return;
    }

    if (!token) {
      setError("Token no válido");
      return;
    }

    setLoading(true);

    try {
      await api.resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Error al restablecer la contraseña");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthShell
        title="Contraseña restablecida"
        subtitle="Tu contraseña ha sido actualizada correctamente."
        footer={
          <>
            <Link to="/login" className="text-aqua font-medium hover:underline">← Iniciar sesión</Link>
          </>
        }
      >
        <div className="text-center py-6">
          <div className="mx-auto h-14 w-14 rounded-full bg-gradient-water grid place-items-center text-white shadow-aqua">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Ya puedes iniciar sesión con tu nueva contraseña.</p>
          <Button asChild variant="outline" size="lg" className="mt-6">
            <Link to="/login">Ir al login</Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={t("reset.title")}
      subtitle={t("reset.subtitle")}
      footer={
        <>
          <Link to="/login" className="text-aqua font-medium hover:underline">← {t("reset.back")}</Link>
        </>
      }
    >
      {error && (
        <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3 mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="newPassword">{t("reset.new_password")}</Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={t("reset.password_placeholder")}
            required
            minLength={8}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">{t("reset.confirm_password")}</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t("reset.confirm_placeholder")}
            required
            minLength={8}
          />
        </div>
        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading || !token}>
          {loading ? t("reset.resetting") : t("reset.submit")}
        </Button>
      </form>
    </AuthShell>
  );
}