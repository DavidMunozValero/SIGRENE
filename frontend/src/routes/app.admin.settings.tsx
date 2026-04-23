import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { PageHeader, SectionCard } from "@/components/dashboard/Cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/app/admin/settings")({
  head: () => ({ meta: [{ title: "Mi Perfil — Admin" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { t } = useLanguage();

  interface Profile {
    email: string;
    nombre_completo: string;
    rol: string;
    foto_perfil?: string | null;
  }

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
        setError(err.message || t("admin.settings.error_loading"));
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
      setError(t("admin.settings.select_image"));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError(t("admin.settings.image_size"));
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
    } catch (err: any) {
      setError(err.message || t("admin.settings.error_photo"));
    }
  };

  const handleRemovePhoto = async () => {
    setError(null);
    try {
      await api.updateMiPerfil({ foto_perfil: null });
      setPhotoPreview(null);
      setSuccessPhoto(true);
      setTimeout(() => setSuccessPhoto(false), 3000);
    } catch (err: any) {
      setError(err.message || t("admin.settings.error_removing"));
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
      setError(err.message || t("admin.settings.error_name"));
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setError(t("admin.settings.passwords_mismatch"));
      return;
    }

    if (formData.newPassword.length < 8) {
      setError(t("admin.settings.password_min"));
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
      setError(err.message || t("admin.settings.error_password"));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <PageHeader title={t("admin.settings.my_profile")} description={t("admin.settings.loading")} />
        <div className="h-64 rounded-xl bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={t("admin.settings.my_profile")}
        description={t("admin.settings.my_profile_desc")}
      />

      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 text-destructive p-3 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg bg-green-500/10 text-green-400 p-3 text-sm">
          {t("admin.settings.saved")}
        </div>
      )}

      {successPhoto && (
        <div className="mb-4 rounded-lg bg-green-500/10 text-green-400 p-3 text-sm">
          {t("admin.settings.photo_saved")}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title={t("admin.settings.profile_photo")}>
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
                  {t("admin.settings.formats")}
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
                    {photoPreview ? t("admin.settings.change") : t("admin.settings.upload")}
                  </Button>
                  {photoPreview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemovePhoto}
                      className="text-destructive hover:text-destructive"
                    >
                      {t("admin.settings.remove")}
                    </Button>
                  )}
                </div>
              </div>
            </div>
            {photoPreview && photoPreview !== profile?.foto_perfil && (
              <Button type="submit" variant="hero" size="sm">
                {t("admin.settings.save_photo")}
              </Button>
            )}
          </form>
        </SectionCard>

        <SectionCard title={t("admin.settings.personal_info")}>
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
                placeholder={t("admin.settings.name_placeholder")}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Rol</Label>
              <Input
                value={profile?.rol === "superadmin" ? t("app.superadmin") : profile?.rol === "admin_federacion" ? t("app.admin_federacion") : profile?.rol === "director_tecnico" ? t("app.director_tecnico") : profile?.rol === "coach" ? t("app.coach") : profile?.rol === "swimmer" ? t("app.swimmer") : profile?.rol}
                disabled
                className="bg-muted"
              />
            </div>

            <Button type="submit" variant="hero">
              {t("admin.settings.save_name")}
            </Button>
          </form>
        </SectionCard>

        <SectionCard title={t("admin.settings.change_password")}>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">{t("admin.settings.current_password")}</Label>
              <Input
                id="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder={t("admin.settings.current_password_placeholder")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newPassword">{t("admin.settings.new_password")}</Label>
              <Input
                id="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder={t("admin.settings.new_password_placeholder")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">{t("admin.settings.confirm_password")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder={t("admin.settings.confirm_placeholder")}
              />
            </div>

            <Button type="submit" variant="hero">
              {t("admin.settings.change_btn")}
            </Button>
          </form>
        </SectionCard>
      </div>
    </>
  );
}