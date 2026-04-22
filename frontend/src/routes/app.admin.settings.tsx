import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { PageHeader, SectionCard } from "@/components/dashboard/Cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export const Route = createFileRoute("/app/admin/settings")({
  head: () => ({ meta: [{ title: "Mi Perfil — Admin" }] }),
  component: SettingsPage,
});

interface Profile {
  email: string;
  nombre_completo: string;
  rol: string;
  foto_perfil?: string | null;
}

function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successPhoto, setSuccessPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nombre_completo: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await api.getMiPerfil();
        setProfile(data);
        setFormData(prev => ({ ...prev, nombre_completo: data.nombre_completo || "" }));
        if (data.foto_perfil) {
          setPhotoPreview(data.foto_perfil);
        }
      } catch (err: any) {
        setError(err.message || "Error cargando perfil");
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Por favor selecciona una imagen");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("La imagen debe ser menor de 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!photoPreview) return;

    try {
      await api.updateMiPerfil({ foto_perfil: photoPreview });
      setSuccessPhoto(true);
      setTimeout(() => setSuccessPhoto(false), 3000);
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Error actualizando foto");
    }
  };

  const handleRemovePhoto = async () => {
    setError(null);
    try {
      await api.updateMiPerfil({ foto_perfil: null });
      setPhotoPreview(null);
      setSuccessPhoto(true);
      setTimeout(() => setSuccessPhoto(false), 3000);
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Error eliminando foto");
    }
  };

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

      {successPhoto && (
        <div className="mb-4 rounded-lg bg-green-500/10 text-green-400 p-3 text-sm">
          Foto actualizada correctamente
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Foto de perfil">
          <form onSubmit={handlePhotoSubmit} className="space-y-4">
            <div className="flex items-center gap-4">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Foto de perfil"
                  className="h-20 w-20 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-gradient-water flex items-center justify-center text-white text-2xl font-bold">
                  {(profile?.nombre_completo?.split(" ").map(n => n[0]).join("").slice(0, 2) || profile?.email?.[0] || "?").toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">
                  Formatos: JPG, PNG, GIF. Máximo 2MB.
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {photoPreview ? "Cambiar" : "Subir foto"}
                  </Button>
                  {photoPreview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemovePhoto}
                      className="text-destructive hover:text-destructive"
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
              </div>
            </div>
            {photoPreview && photoPreview !== profile?.foto_perfil && (
              <Button type="submit" variant="hero" size="sm">
                Guardar foto
              </Button>
            )}
          </form>
        </SectionCard>

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
                value={profile?.rol === "superadmin" ? "Superadmin" : profile?.rol === "admin_federacion" ? "Admin Federación" : profile?.rol === "director_tecnico" ? "Director Técnico" : profile?.rol === "coach" ? "Entrenador" : profile?.rol === "swimmer" ? "Nadador" : profile?.rol}
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