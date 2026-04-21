import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Register() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-surface p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-water flex items-center justify-center mx-auto mb-4 shadow-aqua">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Crea tu federación</h1>
          <p className="text-muted-foreground mt-2">Quedará lista en menos de 5 minutos.</p>
        </div>

        <div className="bg-white rounded-2xl border border-border/60 shadow-glass p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate("/app/admin");
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
        </div>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="text-primary font-medium hover:underline">Entrar</a>
        </p>
      </div>
    </div>
  );
}
