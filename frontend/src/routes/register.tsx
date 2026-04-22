import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Crear federación — SIGRENE" },
      { name: "description", content: "Registra tu federación en SIGRENE." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
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
        setSuccess("Tu solicitud ha sido enviada. Un administrador revisará tu registro y te notificará cuando sea aprobado.");
      } else {
        navigate({ to: "/login" });
      }
    } catch (err: any) {
      setError(err.message || "Error al registrar. Inténtalo de nuevo.");
    }
  };

  if (isPending) {
    return (
      <AuthShell
        title="Solicitud enviada"
        subtitle="Tu solicitud de registro está pendiente de aprobación."
        footer={
          <>
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-aqua font-medium hover:underline">Entrar</Link>
          </>
        }
      >
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Pendiente de aprobación</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Tu solicitud como administrador de federación ha sido recibida. 
            Un superadministrador revisará tu registro y te notificará cuando sea aprobado.
          </p>
          <Button asChild variant="outline" size="lg">
            <Link to="/">Volver al inicio</Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Crea tu federación"
      subtitle="Gestiona el rendimiento de tus nadadores."
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-aqua font-medium hover:underline">Entrar</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="org">Nombre de la federación</Label>
          <Input id="org" name="org" placeholder="Mi Federación" required />
        </div>
        <div className="border-t border-border/60 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Datos del administrador</p>
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre completo</Label>
            <Input id="name" name="name" placeholder="Tu nombre" required />
          </div>
          <div className="space-y-1.5 mt-3">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="tu@email.com" required />
          </div>
          <div className="space-y-1.5 mt-3">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" placeholder="Mínimo 8 caracteres" required />
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
          Crear federación
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Al registrarte aceptas nuestros{" "}
          <Link to="/terms" className="text-primary hover:underline" target="_blank">
            términos y condiciones
          </Link>{" "}
          y la{" "}
          <Link to="/privacy" className="text-primary hover:underline" target="_blank">
            política de privacidad
          </Link>
          .
        </p>
      </form>
    </AuthShell>
  );
}
