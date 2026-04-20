import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/invite")({
  head: () => ({
    meta: [
      { title: "Aceptar invitación — SIGRENE" },
      { name: "description", content: "Acepta tu invitación de entrenador o nadador en SIGRENE." },
    ],
  }),
  component: InvitePage,
});

function InvitePage() {
  const navigate = useNavigate();
  return (
    <AuthShell
      title="Únete a tu federación"
      subtitle="Has sido invitado a SIGRENE. Completa tus datos para empezar."
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-aqua font-medium hover:underline">Entrar</Link>
        </>
      }
    >
      <div className="rounded-xl bg-aqua/15 border border-aqua/30 p-3 text-sm mb-4">
        <p className="text-foreground">
          <span className="font-semibold">Federación Natación Madrid</span> te ha invitado como{" "}
          <span className="font-semibold text-primary">Entrenador</span>.
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ to: "/app/coach" });
        }}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <Label htmlFor="code">Código de invitación</Label>
          <Input id="code" defaultValue="SIG-MAD-7H4P" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="name">Nombre completo</Label>
          <Input id="name" placeholder="Carlos Ruiz" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Crea una contraseña</Label>
          <Input id="password" type="password" placeholder="Mínimo 8 caracteres" required />
        </div>
        <Button type="submit" variant="hero" size="lg" className="w-full">
          Aceptar invitación
        </Button>
      </form>
    </AuthShell>
  );
}
