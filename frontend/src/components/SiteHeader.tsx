import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Button } from "./ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass border-b border-white/40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-foreground/80">
            <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "text-primary" }} className="hover:text-primary transition-colors">
              Inicio
            </Link>
            <Link to="/features" activeProps={{ className: "text-primary" }} className="hover:text-primary transition-colors">
              Funcionalidades
            </Link>
            <Link to="/roles" activeProps={{ className: "text-primary" }} className="hover:text-primary transition-colors">
              Roles
            </Link>
            <Link to="/contact" activeProps={{ className: "text-primary" }} className="hover:text-primary transition-colors">
              Contacto
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild variant="hero" size="sm">
              <Link to="/register">Empezar ahora</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
