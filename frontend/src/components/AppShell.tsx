import { Link, Outlet, useLocation, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { api } from "@/lib/api";

export type Role = "admin" | "director" | "coach" | "swimmer";

const ROLE_LABEL: Record<Role, string> = {
  admin: "Federación Admin",
  director: "Director Técnico",
  coach: "Entrenador",
  swimmer: "Nadador",
};

const NAV: Record<Role, { label: string; to: string }[]> = {
  admin: [
    { label: "Resumen", to: "/app/admin" },
    { label: "Entrenadores", to: "/app/admin/coaches" },
    { label: "Invitaciones", to: "/app/admin/invitations" },
    { label: "Ajustes", to: "/app/admin/settings" },
  ],
  director: [
    { label: "Dashboard", to: "/app/director" },
    { label: "Grupos", to: "/app/director/groups" },
    { label: "Informes", to: "/app/director/reports" },
  ],
  coach: [
    { label: "Mi grupo", to: "/app/coach" },
    { label: "Nadadores", to: "/app/coach/swimmers" },
    { label: "Wellness", to: "/app/coach/wellness" },
  ],
  swimmer: [
    { label: "Hoy", to: "/app/swimmer" },
    { label: "Mi historial", to: "/app/swimmer/history" },
    { label: "Perfil", to: "/app/swimmer/profile" },
  ],
};

export function AppShell({ role }: { role: Role }) {
  const router = useRouter();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    api.clearToken();
    router.navigate({ to: "/login" });
  };

  const switchRole = (r: Role) => {
    const target = NAV[r][0].to;
    router.navigate({ to: target });
  };

  return (
    <div className="flex min-h-screen bg-gradient-surface">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-deep text-sidebar-foreground transform transition-transform lg:translate-x-0 lg:static lg:inset-auto ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center px-5 border-b border-white/10">
          <Logo variant="light" />
        </div>
        <div className="px-3 py-4">
          <p className="px-3 text-xs uppercase tracking-wider text-white/50 mb-2">Menú</p>
          <nav className="space-y-1">
            {NAV[role].map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-white/15 text-white shadow-aqua"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <p className="px-3 mt-8 text-xs uppercase tracking-wider text-white/50 mb-2">Rol demo</p>
          <div className="space-y-1">
            {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => switchRole(r)}
                className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                  r === role ? "bg-aqua/20 text-white" : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {ROLE_LABEL[r]}
              </button>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <Button variant="glass" size="sm" className="w-full" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-20 glass border-b border-white/40">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <button
              className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border"
              onClick={() => setOpen(true)}
              aria-label="Abrir menú"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
            </button>
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Conectado como</span>
              <span className="text-sm font-semibold text-foreground">{ROLE_LABEL[role]}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end leading-tight">
                <span className="text-sm font-medium text-foreground">Usuario</span>
                <span className="text-xs text-muted-foreground">SIGRENE</span>
              </div>
              <div className="h-9 w-9 rounded-full bg-gradient-water grid place-items-center text-white font-semibold text-sm shadow-aqua">
                U
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
