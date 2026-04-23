import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, SectionCard } from "@/components/dashboard/Cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/app/admin/register-trainer")({
  head: () => ({ meta: [{ title: "Registrar Usuario — Admin" }] }),
  component: RegisterTrainerPageWithI18n,
});

function RegisterTrainerPageWithI18n() {
  const { t } = useLanguage();
  return <RegisterTrainerPage t={t} />;
}

interface ROLES {
  value: string;
  label: string;
  description: string;
}

function RegisterTrainerPage({ t }: { t: (key: string) => string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nombre_completo: "",
    rol: "coach",
  });

  const ROLES: ROLES[] = [
    { value: "superadmin", label: "Superadmin", description: t("admin.register.full_access") },
    { value: "admin_federacion", label: "Admin Federación", description: t("admin.register.federation_admin") },
    { value: "director_tecnico", label: "Director Técnico", description: t("admin.register.dashboard") },
    { value: "coach", label: "Entrenador", description: t("admin.register.coach_management") },
    { value: "swimmer", label: t("admin.preview.swimmer_label"), description: t("admin.register.swimmer_panel") },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError(t("admin.register.passwords_mismatch"));
      return;
    }

    if (formData.password.length < 8) {
      setError(t("admin.register.password_min"));
      return;
    }

    try {
      setIsLoading(true);
      await api.register({
        email: formData.email,
        password: formData.password,
        nombre_completo: formData.nombre_completo,
        rol: formData.rol,
        nadadores_asignados: [],
      });
      setSuccess(true);
      setTimeout(() => {
        router.navigate({ to: "/app/admin/users" });
      }, 1500);
    } catch (err: any) {
      setError(err.message || t("admin.register.error"));
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto">
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-8 text-center">
          <div className="h-12 w-12 rounded-full bg-green-500/20 grid place-items-center mx-auto mb-4">
            <svg className="h-6 w-6 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{t("admin.register.success")}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t("admin.register.success_desc")}
          </p>
          <p className="text-xs text-muted-foreground">{t("admin.register.redirecting")}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={t("admin.register.title_page")}
        description={t("admin.register.desc")}
        action={
          <Button asChild variant="outline">
            <Link to="/app/admin/users">← {t("admin.register.back")}</Link>
          </Button>
        }
      />

      <div className="max-w-md">
        <SectionCard title={t("admin.register.user_data")}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 text-destructive p-3 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="nombre_completo">{t("admin.register.full_name")}</Label>
              <Input
                id="nombre_completo"
                name="nombre_completo"
                value={formData.nombre_completo}
                onChange={handleChange}
                placeholder={t("admin.register.full_name_placeholder")}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">{t("admin.register.email")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t("admin.register.email_placeholder")}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Rol</Label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, rol: r.value }))}
                    className={`rounded-lg border px-3 py-2 text-sm text-left transition-colors ${
                      formData.rol === r.value
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-background hover:border-primary/40 text-foreground"
                    }`}
                  >
                    <span className="font-medium">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">{t("admin.register.password")}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t("admin.register.password_placeholder")}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">{t("admin.register.confirm_password")}</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={t("admin.register.confirm_placeholder")}
                required
              />
            </div>

            <div className="pt-2">
              <Button 
                type="submit" 
                variant="hero" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? t("admin.register.registering") : t("admin.register.register")}
              </Button>
            </div>
          </form>
        </SectionCard>
      </div>
    </>
  );
}
