import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { api } from "../lib/api";
import { clsx } from "clsx";

type Role = "admin" | "director" | "coach" | "swimmer";

const ROLE_LABEL: Record<Role, string> = {
  admin: "Federación Admin",
  director: "Director Técnico",
  coach: "Entrenador",
  swimmer: "Nadador",
};

const NAV: Record<Role, { label: string; to: string }[]> = {
  admin: [
    { label: "Resumen", to: "/app/admin" },
    { label: "Usuarios", to: "/app/admin/users" },
    { label: "Registrar Usuario", to: "/app/admin/register-trainer" },
    { label: "Vista Previa", to: "/app/admin/preview" },
  ],
  director: [
    { label: "Dashboard", to: "/app/director" },
    { label: "Grupos", to: "/app/director/groups" },
    { label: "Informes", to: "/app/director/reports" },
  ],
  coach: [
    { label: "Mi grupo", to: "/app/coach" },
    { label: "Nadadores", to: "/app/coach/swimmers" },
  ],
  swimmer: [
    { label: "Hoy", to: "/app/swimmer" },
    { label: "Mi historial", to: "/app/swimmer/history" },
    { label: "Perfil", to: "/app/swimmer/profile" },
  ],
};

function getUserInitials(email?: string, name?: string): string {
  if (name) {
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
  }
  if (email && email.length > 0) {
    return email[0].toUpperCase();
  }
  return "?";
}

export function AppShell({ role, children }: { role: Role; children?: React.ReactNode }) {
  const router = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = api.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserEmail(payload.sub || "");
      } catch (e) {
        console.error("Error decoding token", e);
      }
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    api.clearToken();
    router("/login");
  };

  return (
    <div className="flex min-h-screen bg-gradient-surface">
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-40 w-64 bg-gradient-deep text-sidebar-foreground transform transition-transform lg:translate-x-0 lg:static lg:inset-auto",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center px-5 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-water flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-xl text-white">SIGRENE</span>
          </Link>
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
                  className={clsx(
                    "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active ? "bg-white/15 text-white shadow-aqua" : "text-white/75 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full rounded-lg px-3 py-2 text-sm text-white/75 hover:bg-white/10 hover:text-white transition-colors text-left"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 glass border-b border-white/40">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <button
              className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border"
              onClick={() => setOpen(true)}
              aria-label="Abrir menú"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18"/>
              </svg>
            </button>
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Conectado como</span>
              <span className="text-sm font-semibold text-foreground">{ROLE_LABEL[role]}</span>
            </div>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="hidden sm:flex flex-col items-end leading-tight">
                  <span className="text-sm font-medium text-foreground">{userEmail || "Usuario"}</span>
                  <span className="text-xs text-muted-foreground">{ROLE_LABEL[role]}</span>
                </div>
                <div className="h-9 w-9 rounded-full bg-gradient-water grid place-items-center text-white font-semibold text-sm shadow-aqua">
                  {getUserInitials(userEmail)}
                </div>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border/60 bg-card shadow-elevated overflow-hidden">
                  <div className="px-4 py-3 border-b border-border/60">
                    <p className="text-sm font-medium text-foreground">Usuario</p>
                    <p className="text-xs text-muted-foreground">{userEmail}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/app/admin/settings"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors"
                    >
                      Ajustes
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
