import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Crear federación — SIGRENE" },
      { name: "description", content: "Registra tu federación en SIGRENE en menos de 5 minutos." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  return (
    <AuthShell
      title="Crea tu federación"
      subtitle="Quedará lista en menos de 5 minutos."
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-aqua font-medium hover:underline">Entrar</Link>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ to: "/app/admin" });
        }}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <Label htmlFor="org">Nombre de la federación</Label>
          <Input id="org" placeholder="Federación Natación Madrid" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="tz">Zona horaria</Label>
            <Input id="tz" defaultValue="Europe/Madrid" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="region">Región</Label>
            <Input id="region" placeholder="Madrid" />
          </div>
        </div>
        <div className="border-t border-border/60 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Cuenta del admin</p>
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre completo</Label>
            <Input id="name" placeholder="Ana García" required />
          </div>
          <div className="space-y-1.5 mt-3">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="ana@federacion.es" required />
          </div>
          <div className="space-y-1.5 mt-3">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" placeholder="Mínimo 8 caracteres" required />
          </div>
        </div>
        <Button type="submit" variant="hero" size="lg" className="w-full">
          Crear federación
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Al registrarte aceptas nuestros términos y la política GDPR.
        </p>
      </form>
    </AuthShell>
  );
}
