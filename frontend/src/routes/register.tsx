import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "register.page.title" },
      { name: "description", content: "register.page.desc" },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const nombreCompleto = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await api.register({
        email,
        password,
        nombre_completo: nombreCompleto,
        rol: "admin_federacion",
        nadadores_asignados: [],
      }) as { message: string; estado_aprobacion?: string };

      if (response.estado_aprobacion === "pendiente") {
        setIsPending(true);
        setSuccess(t("register.success"));
      } else {
        navigate({ to: "/login" });
      }
    } catch (err: any) {
      setError(err.message || t("register.error"));
    }
  };

  if (isPending) {
    return (
      <AuthShell
        title={t("register.request_sent")}
        subtitle={t("register.request_pending")}
        footer={
          <>
            {t("register.has_account")}{" "}
            <Link to="/login" className="text-aqua font-medium hover:underline">{t("register.sign_in")}</Link>
          </>
        }
      >
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{t("register.pending_title")}</h3>
          <p className="text-sm text-muted-foreground mb-6">
            {t("register.pending_desc")}
          </p>
          <Button asChild variant="outline" size="lg">
            <Link to="/">{t("register.back_home")}</Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={t("register.create")}
      subtitle={t("register.create_subtitle")}
      footer={
        <>
          {t("register.has_account")}{" "}
          <Link to="/login" className="text-aqua font-medium hover:underline">{t("register.sign_in")}</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="org">{t("register.federation_name")}</Label>
          <Input id="org" name="org" placeholder="Mi Federación" required />
        </div>
        <div className="border-t border-border/60 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Datos del administrador</p>
          <div className="space-y-1.5">
            <Label htmlFor="name">{t("register.full_name")}</Label>
            <Input id="name" name="name" placeholder={t("register.full_name_placeholder")} required />
          </div>
          <div className="space-y-1.5 mt-3">
            <Label htmlFor="email">{t("register.email")}</Label>
            <Input id="email" name="email" type="email" placeholder="tu@email.com" required />
          </div>
          <div className="space-y-1.5 mt-3">
            <Label htmlFor="password">{t("register.password")}</Label>
            <Input id="password" name="password" type="password" placeholder={t("register.password_placeholder")} required />
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 text-sm text-primary">
            {success}
          </div>
        )}

        <Button type="submit" variant="hero" size="lg" className="w-full">
          {t("register.get_started")}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          {t("register.terms")}{" "}
          <Link to="/terms" className="text-primary hover:underline" target="_blank">
            {t("register.terms_link")}
          </Link>{" "}
          {t("register.privacy_link")}{" "}
          <Link to="/privacy" className="text-primary hover:underline" target="_blank">
            {t("register.privacy_link")}
          </Link>
          .
        </p>
      </form>
    </AuthShell>
  );
}
