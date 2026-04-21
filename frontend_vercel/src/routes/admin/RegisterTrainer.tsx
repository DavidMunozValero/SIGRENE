import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader, SectionCard } from "@/components/dashboard/Cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export function AdminRegisterTrainer() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nombre_completo: "",
    rol: "coach",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      await api.register({
        email: formData.email,
        password: formData.password,
        nombre_completo: formData.nombre_completo,
        rol: formData.rol,
        nadadores_asignados: [],
      });
      setSuccess(true);
      setFormData({
        email: "",
        password: "",
        nombre_completo: "",
        rol: "coach",
      });
      setTimeout(() => navigate("/app/admin/users"), 1500);
    } catch (err: any) {
      setError(err.message || "Error al registrar usuario");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Registrar Usuario"
        description="Crea una nueva cuenta de usuario en el sistema."
      />

      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 text-destructive p-3 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg bg-green-500/10 text-green-400 p-3 text-sm">
          Usuario registrado correctamente. Redirigiendo...
        </div>
      )}

      <SectionCard title="Datos del usuario" description="Completa todos los campos">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div className="space-y-1.5">
            <Label htmlFor="nombre_completo">Nombre completo</Label>
            <Input
              id="nombre_completo"
              value={formData.nombre_completo}
              onChange={(e) => setFormData(prev => ({ ...prev, nombre_completo: e.target.value }))}
              placeholder="Ana García"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="ana@federacion.es"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña provisional</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Mínimo 8 caracteres"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rol">Rol</Label>
            <select
              id="rol"
              value={formData.rol}
              onChange={(e) => setFormData(prev => ({ ...prev, rol: e.target.value }))}
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="coach">Entrenador</option>
              <option value="director">Director Técnico</option>
              <option value="admin">Administrador</option>
              <option value="swimmer">Nadador</option>
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate("/app/admin")}>
              Cancelar
            </Button>
            <Button type="submit" variant="hero" disabled={isLoading}>
              {isLoading ? "Registrando..." : "Registrar usuario"}
            </Button>
          </div>
        </form>
      </SectionCard>
    </>
  );
}
