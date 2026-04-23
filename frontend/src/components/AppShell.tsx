import { Link, Outlet, useLocation, useRouter } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";

export type Role = "superadmin" | "admin_federacion" | "director_tecnico" | "coach" | "swimmer";

export function AppShell({ role }: { role: Role }) {
  const { t } = useLanguage();
  const router = useRouter();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState<string>(role);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = api.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserEmail(payload.sub || "");
        setUserRole(payload.rol || role);
      } catch (e) {
        console.error("Error decoding token", e);
      }
    }
  }, []);

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await api.getMiPerfil();
        if (profile?.foto_perfil) {
          setUserPhoto(profile.foto_perfil);
        }
        if (profile?.nombre_completo) {
          setUserName(profile.nombre_completo);
        }
      } catch (e) {
        console.error("Error loading profile:", e);
      }
    }
    if (api.getToken()) {
      loadProfile();
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

  const handleLogout = async () => {
    await api.logout();
    router.navigate({ to: "/login" });
  };

  const getSettingsPath = () => {
    return "/app/admin/settings";
  };

  const NAV_ADMIN = [
    { label: t("app.summary"), to: "/app/admin" },
    { label: t("app.users"), to: "/app/admin/users" },
    { label: t("app.pending"), to: "/app/admin/pending" },
    { label: t("app.register_user"), to: "/app/admin/register-trainer" },
    { label: t("app.preview"), to: "/app/admin/preview" },
  ];

  const NAV_DIRECTOR = [
    { label: t("app.dashboard"), to: "/app/director" },
    { label: t("app.groups"), to: "/app/director/groups" },
    { label: t("app.reports"), to: "/app/director/reports" },
  ];

  const NAV_COACH = [
    { label: t("app.my_group"), to: "/app/coach" },
    { label: t("app.swimmers"), to: "/app/coach/swimmers" },
    { label: t("app.wellness"), to: "/app/coach/wellness" },
  ];

  const NAV_SWIMMER = [
    { label: t("app.today"), to: "/app/swimmer" },
    { label: t("app.history"), to: "/app/swimmer/history" },
    { label: t("app.profile"), to: "/app/swimmer/profile" },
  ];

  const getNavForRole = (r: string) => {
    if (r === "superadmin" || r === "admin_federacion") return NAV_ADMIN;
    if (r === "director_tecnico") return NAV_DIRECTOR;
    if (r === "coach") return NAV_COACH;
    return NAV_SWIMMER;
  };

  const getRoleLabel = (r: string) => {
    const labels: Record<string, string> = {
      superadmin: t("app.superadmin"),
      admin_federacion: t("app.admin_federacion"),
      director_tecnico: t("app.director_tecnico"),
      coach: t("app.coach"),
      swimmer: t("app.swimmer"),
    };
    return labels[r] || r;
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
          <p className="px-3 text-xs uppercase tracking-wider text-white/50 mb-2">{t("app.menu")}</p>
          <nav className="space-y-1">
            {getNavForRole(userRole).map((item) => {
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
              aria-label={t("app.open_menu")}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
            </button>
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{t("app.connected_as")}</span>
              <span className="text-sm font-semibold text-foreground">{getRoleLabel(userRole)}</span>
            </div>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                aria-label={t("app.user_menu")}
              >
                <div className="hidden sm:flex flex-col items-end leading-tight">
                  <span className="text-sm font-medium text-foreground">{userName || userEmail}</span>
                  <span className="text-xs text-muted-foreground">{getRoleLabel(userRole)}</span>
                </div>
                {userPhoto ? (
                  <img
                    src={userPhoto}
                    alt="Profile"
                    className="h-9 w-9 rounded-full object-cover shadow-aqua"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-gradient-water grid place-items-center text-white font-semibold text-sm shadow-aqua">
                    {(userName || userEmail || "?").charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border/60 bg-card shadow-elevated overflow-hidden">
                  <div className="px-4 py-3 border-b border-border/60">
                    <p className="text-sm font-medium text-foreground">{userName}</p>
                    <p className="text-xs text-muted-foreground">{userEmail}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to={getSettingsPath()}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                      </svg>
                      {t("app.settings")}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
                      </svg>
                      {t("app.logout")}
                    </button>
                  </div>
                </div>
              )}
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
