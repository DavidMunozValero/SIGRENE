import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, SectionCard } from "@/components/dashboard/Cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export const Route = createFileRoute("/app/admin/users")({
  head: () => ({ meta: [{ title: "Usuarios — Admin" }] }),
  component: UsersPage,
});

interface Usuario {
  email: string;
  nombre_completo: string;
  rol: string;
  nadadores_asignados: string[];
  activo: boolean;
  estado_aprobacion: string;
  aprobado_por?: string;
  fecha_aprobacion?: string;
  fecha_registro?: string;
  created_at?: string;
}

const ROLE_LABELS: Record<string, string> = {
  superadmin: "Superadmin",
  admin_federacion: "Admin Federación",
  director_tecnico: "Director Técnico",
  coach: "Entrenador",
  swimmer: "Nadador",
};

const ROLE_COLORS: Record<string, string> = {
  superadmin: "bg-red-500/15 text-red-400",
  admin_federacion: "bg-orange-500/15 text-orange-400",
  director_tecnico: "bg-blue-500/15 text-blue-400",
  coach: "bg-aqua/15 text-primary",
  swimmer: "bg-green-500/15 text-green-400",
};

const ESTADO_COLORS: Record<string, string> = {
  aprobado: "bg-green-500/15 text-green-400",
  pendiente: "bg-yellow-500/15 text-yellow-400",
  rechazado: "bg-red-500/15 text-red-400",
};

const ESTADO_LABELS: Record<string, string> = {
  aprobado: "Aprobado",
  pendiente: "Pendiente",
  rechazado: "Rechazado",
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function EditUserModal({ user, onClose, onSave }: { user: Usuario; onClose: () => void; onSave: (data: Partial<Usuario>) => void }) {
  const [formData, setFormData] = useState({
    nombre_completo: user.nombre_completo || "",
    rol: user.rol,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl border border-border/60 bg-card p-6 shadow-elevated">
        <h3 className="text-lg font-semibold text-foreground mb-4">Editar Usuario</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email} disabled className="bg-muted" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nombre_completo">Nombre completo</Label>
            <Input
              id="nombre_completo"
              value={formData.nombre_completo}
              onChange={(e) => setFormData(prev => ({ ...prev, nombre_completo: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rol">Rol</Label>
            <select
              id="rol"
              value={formData.rol}
              onChange={(e) => setFormData(prev => ({ ...prev, rol: e.target.value }))}
              className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="superadmin">Superadmin</option>
              <option value="admin_federacion">Admin Federación</option>
              <option value="director_tecnico">Director Técnico</option>
              <option value="coach">Entrenador</option>
              <option value="swimmer">Nadador</option>
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" variant="hero" className="flex-1">
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ user, onClose, onConfirm }: { user: Usuario; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl border border-destructive/30 bg-card p-6 shadow-elevated">
        <h3 className="text-lg font-semibold text-foreground mb-2">Eliminar Usuario</h3>
        <p className="text-sm text-muted-foreground mb-6">
          ¿Estás seguro de que quieres eliminar al usuario <strong>{user.nombre_completo || user.email}</strong>? 
          Esta acción no se puede deshacer y se eliminarán todos sus datos de forma permanente.
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} className="flex-1">
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
}

function UsersPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRol, setFilterRol] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [deletingUser, setDeletingUser] = useState<Usuario | null>(null);

  useEffect(() => {
    loadUsuarios();
  }, [filterRol]);

  async function loadUsuarios() {
    try {
      setIsLoading(true);
      const params: { skip?: number; limit?: number; rol?: string } = { limit: 500 };
      if (filterRol) params.rol = filterRol;
      const response = await api.getUsuarios(params);
      setUsuarios(response.datos || []);
    } catch (err: any) {
      setError(err.message || "Error cargando usuarios");
    } finally {
      setIsLoading(false);
    }
  }

  const handleSaveEdit = async (data: Partial<Usuario>) => {
    if (!editingUser) return;
    try {
      await api.updateUsuario(editingUser.email, data);
      setEditingUser(null);
      loadUsuarios();
    } catch (err: any) {
      alert(err.message || "Error actualizando usuario");
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    try {
      await api.deleteUsuario(deletingUser.email);
      setDeletingUser(null);
      loadUsuarios();
    } catch (err: any) {
      alert(err.message || "Error eliminando usuario");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <PageHeader title="Usuarios" description="Cargando..." />
        <div className="h-64 rounded-xl bg-muted animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-destructive/10 text-destructive p-4">
        {error}
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Usuarios"
        description={`${usuarios.length} usuarios registrados en el sistema.`}
        action={
          <Button asChild variant="hero">
            <Link to="/app/admin/register-trainer">+ Registrar Usuario</Link>
          </Button>
        }
      />

      <div className="flex gap-2 mb-4 flex-wrap">
        <Button 
          variant={filterRol === null ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilterRol(null)}
        >
          Todos ({usuarios.length})
        </Button>
        {Object.entries(ROLE_LABELS).map(([rol, label]) => (
          <Button
            key={rol}
            variant={filterRol === rol ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterRol(rol)}
          >
            {label} ({usuarios.filter(u => u.rol === rol).length})
          </Button>
        ))}
      </div>

      <SectionCard title={`${usuarios.length} usuarios`}>
        <div className="-m-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground tracking-wider">
              <tr>
                <th className="text-left px-5 py-3">Usuario</th>
                <th className="text-left px-5 py-3">Rol</th>
                <th className="text-left px-5 py-3">Estado</th>
                <th className="text-left px-5 py-3">Fecha registro</th>
                <th className="text-right px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {usuarios.map((u) => (
                <tr key={u.email} className={`hover:bg-muted/30 transition-colors ${!u.activo ? "opacity-50" : ""}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-water grid place-items-center text-white text-xs font-semibold shadow-aqua">
                        {(u.nombre_completo?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || u.email?.[0] || "?").toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{u.nombre_completo || "Sin nombre"}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${ROLE_COLORS[u.rol] || "bg-muted text-muted-foreground"}`}>
                      {ROLE_LABELS[u.rol] || u.rol}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${ESTADO_COLORS[u.estado_aprobacion] || "bg-muted text-muted-foreground"}`}>
                      {ESTADO_LABELS[u.estado_aprobacion] || u.estado_aprobacion}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {formatDate(u.fecha_registro || u.created_at)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditingUser(u)}
                      >
                        Editar
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeletingUser(u)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveEdit}
        />
      )}

      {deletingUser && (
        <DeleteConfirmModal
          user={deletingUser}
          onClose={() => setDeletingUser(null)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}