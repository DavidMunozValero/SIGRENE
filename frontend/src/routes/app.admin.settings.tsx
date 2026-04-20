import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/dashboard/Cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/app/admin/settings")({
  head: () => ({ meta: [{ title: "Ajustes — Admin" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <>
      <PageHeader title="Ajustes" description="Configuración general de la federación." />
      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Organización">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="oname">Nombre</Label>
              <Input id="oname" defaultValue="Federación Natación Madrid" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="otz">Zona horaria</Label>
              <Input id="otz" defaultValue="Europe/Madrid" />
            </div>
            <Button variant="hero">Guardar cambios</Button>
          </form>
        </SectionCard>
        <SectionCard title="Seguridad">
          <ul className="space-y-4 text-sm">
            <li className="flex justify-between items-center">
              <div>
                <p className="font-medium text-foreground">Bloqueo tras intentos fallidos</p>
                <p className="text-xs text-muted-foreground">5 intentos / 15 min</p>
              </div>
              <span className="text-xs font-medium bg-aqua/15 text-primary px-2 py-1 rounded-full">Activo</span>
            </li>
            <li className="flex justify-between items-center">
              <div>
                <p className="font-medium text-foreground">Sesiones "remember me"</p>
                <p className="text-xs text-muted-foreground">30 días con refresh rotativo</p>
              </div>
              <span className="text-xs font-medium bg-aqua/15 text-primary px-2 py-1 rounded-full">Activo</span>
            </li>
            <li className="flex justify-between items-center">
              <div>
                <p className="font-medium text-foreground">Auditoría de eventos</p>
                <p className="text-xs text-muted-foreground">Login, logout, fallos, resets</p>
              </div>
              <span className="text-xs font-medium bg-aqua/15 text-primary px-2 py-1 rounded-full">Activo</span>
            </li>
          </ul>
        </SectionCard>
      </div>
    </>
  );
}
