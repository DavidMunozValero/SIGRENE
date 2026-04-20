import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/dashboard/Cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/app/admin/invitations")({
  head: () => ({ meta: [{ title: "Invitaciones — Admin" }] }),
  component: InvitationsPage,
});

const pending = [
  { email: "alex@fnm.es", role: "Entrenador", expires: "en 4 días" },
  { email: "rocio@fnm.es", role: "Director Téc.", expires: "en 1 día" },
  { email: "miguel@fnm.es", role: "Entrenador", expires: "en 6 días" },
];

function InvitationsPage() {
  return (
    <>
      <PageHeader
        title="Invitaciones"
        description="Envía invitaciones por email con expiración configurable."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <SectionCard title="Nueva invitación">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="iemail">Email</Label>
                <Input id="iemail" type="email" placeholder="entrenador@fed.es" />
              </div>
              <div className="space-y-1.5">
                <Label>Rol</Label>
                <div className="grid grid-cols-2 gap-2">
                  {["Entrenador", "Director Téc."].map((r) => (
                    <button
                      key={r}
                      type="button"
                      className="rounded-lg border border-border bg-background hover:border-primary/40 px-3 py-2 text-sm"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <Button variant="hero" className="w-full">Enviar invitación</Button>
            </form>
          </SectionCard>
        </div>

        <div className="lg:col-span-2">
          <SectionCard title={`${pending.length} pendientes`} description="Reenvía o revoca según necesites.">
            <ul className="-m-5 divide-y divide-border/60">
              {pending.map((p) => (
                <li key={p.email} className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{p.email}</p>
                    <p className="text-xs text-muted-foreground">{p.role} · expira {p.expires}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">Reenviar</Button>
                    <Button variant="outline" size="sm">Revocar</Button>
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>
    </>
  );
}
