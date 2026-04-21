import { useEffect, useState } from "react";
import { PageHeader, SectionCard } from "@/components/dashboard/Cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

interface Profile {
  email: string;
  nombre_completo: string;
  rol: string;
}

export function AdminSettings() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nombre_completo: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await api.getMiPerfil();
        setProfile(data);
        setFormData(prev => ({ ...prev, nombre_completo: data.nombre_completo || "" }));
      } catch (err: any) {
        setError(err.message || "Error cargando perfil");
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      await api.updateMiPerfil({ nombre_completo: formData.nombre_completo });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Error actualizando nombre");
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    try {
      await api.updateMiPerfil({ password: formData.newPassword });
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Error actualizando contraseña");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <PageHeader title="Mi Perfil" description="Cargando..." />
        <div className="h-64 rounded-xl bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Mi Perfil"
        description="Gestiona tu información personal y contraseña."
      />

      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 text-destructive p-3 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg bg-green-500/10 text-green-400 p-3 text-sm">
          Cambios guardados correctamente
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Información personal">
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile?.email || ""}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nombre_completo">Nombre completo</Label>
              <Input
                id="nombre_completo"
                value={formData.nombre_completo}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre_completo: e.target.value }))}
                placeholder="Tu nombre"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Rol</Label>
              <Input
                value={profile?.rol === "admin" ? "Administrador" : profile?.rol === "director" ? "Director Técnico" : profile?.rol === "coach" ? "Entrenador" : "Nadador"}
                disabled
                className="bg-muted"
              />
            </div>

            <Button type="submit" variant="hero">
              Guardar nombre
            </Button>
          </form>
        </SectionCard>

        <SectionCard title="Cambiar contraseña">
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Contraseña actual</Label>
              <Input
                id="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Contraseña actual"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newPassword">Nueva contraseña</Label>
              <Input
                id="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Repite la nueva contraseña"
              />
            </div>

            <Button type="submit" variant="hero">
              Cambiar contraseña
            </Button>
          </form>
        </SectionCard>
      </div>
    </>
  );
}
