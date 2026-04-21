import { Outlet, Link } from "react-router-dom";

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-water flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-xl text-foreground">SIGRENE</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Características
            </Link>
            <Link to="/roles" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Roles
            </Link>
            <Link
              to="/login"
              className="text-sm font-medium text-primary hover:underline"
            >
              Entrar
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t py-8 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 SIGRENE - Sistema de Gestión del Rendimiento del Nadador de Élite</p>
        </div>
      </footer>
    </div>
  );
}
