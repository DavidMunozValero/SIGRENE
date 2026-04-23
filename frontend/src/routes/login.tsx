import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    if (api.isAuthenticated()) {
      const role = api.getUserRole() || "coach";
      const redirectTo = api.getDefaultRouteForRole(role);
      throw redirect({ to: redirectTo });
    }
  },
  head: () => ({
    meta: [
      { title: "login.page.title" },
      { name: "description", content: "login.page.desc" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    async function checkExistingSession() {
      const token = api.getToken();
      if (token) {
        try {
          const profile = await api.getMiPerfil();
          const role = profile?.rol || api.getUserRole() || "coach";
          const redirectTo = api.getDefaultRouteForRole(role);
          navigate({ to: redirectTo });
          return;
        } catch {
          api.clearToken();
        }
      }
      setIsCheckingSession(false);
    }
    checkExistingSession();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await api.login(email, password);
      const role = api.getUserRole() || "coach";
      const redirectTo = api.getDefaultRouteForRole(role);
      navigate({ to: redirectTo });
    } catch (err: any) {
      setError(err.message || t("login.error"));
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return null;
  }

  return (
    <AuthShell
      title={t("login.welcome")}
      subtitle={t("login.subtitle")}
      footer={
        <>
          {t("login.no_account")}{" "}
          <Link to="/register" className="text-aqua font-medium hover:underline">{t("login.create_federation")}</Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3">
            {error}
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">{t("contact.email")}</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@ejemplo.com"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">{t("login.password")}</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("login.password_placeholder")}
            required
          />
        </div>
        <div className="text-right">
          <Link to="/forgot-password" className="text-xs text-primary hover:underline">{t("login.forgot")}</Link>
        </div>

        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? t("login.signing_in") : t("login.sign_in")}
        </Button>

        <div className="text-center text-xs text-muted-foreground mt-4">
          <p>{t("login.hint")}</p>
        </div>
      </form>
    </AuthShell>
  );
}
