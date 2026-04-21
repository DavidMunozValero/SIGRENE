import { useEffect, useState } from "react";
import { PageHeader, SectionCard } from "@/components/dashboard/Cards";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface Usuario {
  email: string;
  nombre_completo: string;
  rol: string;
  activo: boolean;
}

const ROLE_INFO = {
  admin: {
    label: "Administrador",
    description: "Acceso total al sistema. Gestiona usuarios, federation settings y ve todos los datos.",
    routes: ["/app/admin", "/app/admin/users", "/app/admin/register-trainer", "/app/admin/register-swimmer"],
    color: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  },
  director: {
    label: "Director Técnico",
    description: "Acceso al dashboard de dirección, grupos de entrenamiento e informes.",
    routes: ["/app/director", "/app/director/groups", "/app/director/reports"],
    color: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  coach: {
    label: "Entrenador",
    description: "Acceso a su grupo de nadadores, registro de entrenamiento y wellness.",
    routes: ["/app/coach", "/app/coach/swimmers", "/app/coach/wellness"],
    color: "bg-aqua/15 text-primary border-aqua/30",
  },
  swimmer: {
    label: "Nadador",
    description: "Acceso a su panel personal, historial y perfil.",
    routes: ["/app/swimmer", "/app/swimmer/history", "/app/swimmer/profile"],
    color: "bg-green-500/15 text-green-400 border-green-500/30",
  },
};

export function AdminPreview() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUsuarios() {
      try {
        const response = await api.getUsuarios({ limit: 500 });
        setUsuarios(response.datos || []);
      } catch (err) {
        console.error("Error loading usuarios:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadUsuarios();
  }, []);

  const usuariosByRol = {
    admin: usuarios.filter(u => u.rol === "admin"),
    director: usuarios.filter(u => u.rol === "director"),
    coach: usuarios.filter(u => u.rol === "coach"),
    swimmer: usuarios.filter(u => u.rol === "swimmer"),
  };

  return (
    <>
      <PageHeader
        title="Vista Previa de Roles"
        description="Explora qué ve cada tipo de usuario en la plataforma."
      />

      <div className="space-y-6">
        <SectionCard title="Acerca de esta función">
          <p className="text-sm text-muted-foreground mb-4">
            Esta herramienta te permite verificar qué ve cada rol de usuario en la plataforma. 
            Para probar la experiencia completa de otro rol, cierra sesión y entra con las credenciales 
            de ese usuario.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.open("/login", "_blank")}>
              Abrir login en nueva pestaña
            </Button>
          </div>
        </SectionCard>

        <div className="grid gap-6 lg:grid-cols-2">
          {Object.entries(ROLE_INFO).map(([rol, info]) => {
            const roleUsers = usuariosByRol[rol as keyof typeof usuariosByRol] || [];
            
            return (
              <SectionCard 
                key={rol}
                title={
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${info.color}`}>
                    {rol.toUpperCase()}
                  </span>
                }
                description={info.description}
              >
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Rutas del menú</p>
                    <div className="flex flex-wrap gap-1">
                      {info.routes.map(route => (
                        <span key={route} className="text-xs font-mono bg-muted px-2 py-1 rounded">
                          {route}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                      Usuarios {rol === "admin" ? "" : "(prueba con estos)"}
                    </p>
                    {isLoading ? (
                      <p className="text-sm text-muted-foreground">Cargando...</p>
                    ) : roleUsers.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No hay usuarios</p>
                    ) : (
                      <div className="space-y-2">
                        {roleUsers.slice(0, 3).map(u => (
                          <div key={u.email} className="flex items-center justify-between text-sm bg-muted/50 rounded-lg px-3 py-2">
                            <div>
                              <p className="font-medium">{u.nombre_completo || "Sin nombre"}</p>
                              <p className="text-xs text-muted-foreground">{u.email}</p>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              u.activo ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
                            }`}>
                              {u.activo ? "Activo" : "Inactivo"}
                            </span>
                          </div>
                        ))}
                        {roleUsers.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{roleUsers.length - 3} más
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </SectionCard>
            );
          })}
        </div>

        <SectionCard title="Flujo de prueba recomendado" description="Para probar la plataforma como otro usuario">
          <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
            <li>Abre una ventana de incognito/navegación privada</li>
            <li>Ve a <span className="font-mono bg-muted px-1 rounded">/login</span></li>
            <li>Inicia sesión con las credenciales de prueba del rol que quieras probar</li>
            <li>Navega por todas las secciones disponibles para ese rol</li>
            <li>Cuando termines, cierra sesión y vuelve a tu sesión de admin</li>
          </ol>
          
          <div className="mt-4 pt-4 border-t border-border/60">
            <p className="text-xs text-muted-foreground mb-3">Credenciales de prueba comunes:</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { rol: "Admin", email: "admin@sigrene.es" },
                { rol: "Entrenador", email: "carlos@fnm.es" },
                { rol: "Nadador", email: "maria@club.es" },
              ].map(c => (
                <div key={c.email} className="text-xs bg-muted/50 rounded-lg px-3 py-2">
                  <span className="font-medium">{c.rol}:</span>{" "}
                  <span className="font-mono">{c.email}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>
    </>
  );
}
