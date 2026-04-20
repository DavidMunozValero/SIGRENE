import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/dashboard/Cards";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/admin/invitations")({
  head: () => ({ meta: [{ title: "Registro Directo — Admin" }] }),
  component: InvitationsPage,
});

function InvitationsPage() {
  return (
    <>
      <PageHeader
        title="Registro Directo"
        description="Registra usuarios directamente sin necesidad de invitación."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard
          title="Registrar Usuario"
          description="Crea cuentas de cualquier tipo: Admin, Director, Entrenador o Nadador."
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              El usuario recibirá sus credenciales y podrá iniciar sesión inmediatamente 
              después del registro.
            </p>
            <Button asChild variant="hero">
              <Link to="/app/admin/register-trainer">+ Registrar Usuario</Link>
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="Gestionar Usuarios" description="Ver, editar y gestionar todos los usuarios">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Accede a la lista completa de usuarios para ver, editar 
              o eliminar sus cuentas.
            </p>
            <Button asChild variant="outline">
              <Link to="/app/admin/users">→ Ir a Usuarios</Link>
            </Button>
          </div>
        </SectionCard>
      </div>
    </>
  );
}