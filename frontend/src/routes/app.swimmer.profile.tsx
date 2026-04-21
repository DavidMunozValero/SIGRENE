import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/dashboard/Cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/app/swimmer/profile")({
  head: () => ({ meta: [{ title: "Mi perfil — Nadador" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <>
      <PageHeader title="Mi perfil" description="Tus datos personales y preferencias." />
      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard title="Datos personales">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="pn">Nombre completo</Label>
              <Input id="pn" defaultValue="Ana Martín" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pdob">Nacimiento</Label>
                <Input id="pdob" type="date" defaultValue="2012-04-15" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pst">Estilo</Label>
                <Input id="pst" defaultValue="Espalda" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pec">Contacto emergencia</Label>
              <Input id="pec" placeholder="Madre · 600 123 456" />
            </div>
            <Button variant="hero">Guardar</Button>
          </form>
        </SectionCard>

        <div className="lg:col-span-2 space-y-5">
          <SectionCard title="Mi grupo">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-water grid place-items-center text-white text-xl font-bold shadow-aqua">A</div>
              <div>
                <p className="font-semibold text-foreground">Alevín A</p>
                <p className="text-sm text-muted-foreground">Entrenador: Carlos Ruiz</p>
                <p className="text-xs text-muted-foreground mt-1">Federación Natación Madrid</p>
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Privacidad (GDPR)">
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between items-center p-3 rounded-lg bg-muted/40">
                <span>Descargar mis datos</span>
                <Button variant="outline" size="sm">Solicitar</Button>
              </li>
              <li className="flex justify-between items-center p-3 rounded-lg bg-muted/40">
                <span>Borrar mi cuenta</span>
                <Button variant="ghost" size="sm" className="text-destructive">Eliminar</Button>
              </li>
            </ul>
          </SectionCard>
        </div>
      </div>
    </>
  );
}
