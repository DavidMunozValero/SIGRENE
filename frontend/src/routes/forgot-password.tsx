import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Recuperar contraseña — SIGRENE" },
      { name: "description", content: "Recibe un enlace para restablecer tu contraseña en SIGRENE." },
    ],
  }),
  component: ForgotPage,
});

function ForgotPage() {
  const [sent, setSent] = useState(false);
  return (
    <AuthShell
      title={sent ? "Revisa tu correo" : "Recupera tu contraseña"}
      subtitle={
        sent
          ? "Si el email existe, recibirás un enlace válido durante 1 hora."
          : "Te enviaremos un enlace seguro por email."
      }
      footer={
        <>
          <Link to="/login" className="text-aqua font-medium hover:underline">← Volver a entrar</Link>
        </>
      }
    >
      {!sent ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="tu@federacion.es" required />
          </div>
          <Button type="submit" variant="hero" size="lg" className="w-full">
            Enviar enlace
          </Button>
        </form>
      ) : (
        <div className="text-center py-6">
          <div className="mx-auto h-14 w-14 rounded-full bg-gradient-water grid place-items-center text-white shadow-aqua">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">El enlace expirará en 1 hora.</p>
        </div>
      )}
    </AuthShell>
  );
}
