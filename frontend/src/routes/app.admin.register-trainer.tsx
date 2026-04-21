import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, SectionCard } from "@/components/dashboard/Cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export const Route = createFileRoute("/app/admin/register-trainer")({
  head: () => ({ meta: [{ title: "Registrar Usuario — Admin" }] }),
  component: RegisterTrainerPage,
});

const ROLES = [
  { value: "admin", label: "Administrador", description: "Acceso total al sistema" },
  { value: "director", label: "Director Técnico", description: "Dashboard agregado e informes" },
  { value: "coach", label: "Entrenador", description: "Gestión de nadadores" },
  { value: "swimmer", label: "Nadador", description: "Panel personal" },
];

function RegisterTrainerPage() {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
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
      setError(err.message || "Error registrando usuario");
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
          <h3 className="text-lg font-semibold text-foreground mb-2">Usuario registrado</h3>
          <p className="text-sm text-muted-foreground mb-4">
            El usuario se ha registrado correctamente y puede iniciar sesión.
          </p>
          <p className="text-xs text-muted-foreground">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Registrar Usuario"
        description="Crea una cuenta de usuario directamente sin necesidad de invitación."
        action={
          <Button asChild variant="outline">
            <Link to="/app/admin/users">← Volver a Usuarios</Link>
          </Button>
        }
      />

      <div className="max-w-md">
        <SectionCard title="Datos del usuario">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 text-destructive p-3 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="nombre_completo">Nombre completo</Label>
              <Input
                id="nombre_completo"
                name="nombre_completo"
                value={formData.nombre_completo}
                onChange={handleChange}
                placeholder="Carlos Ruiz Pérez"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="usuario@ejemplo.es"
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
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 8 caracteres"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repite la contraseña"
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
                {isLoading ? "Registrando..." : "Registrar Usuario"}
              </Button>
            </div>
          </form>
        </SectionCard>
      </div>
    </>
  );
}