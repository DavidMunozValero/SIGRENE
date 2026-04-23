import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "@/lib/i18n";

export function SiteHeader() {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass border-b border-white/40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-foreground/80">
            <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "text-primary" }} className="hover:text-primary transition-colors">
              {t("nav.inicio")}
            </Link>
            <Link to="/features" activeProps={{ className: "text-primary" }} className="hover:text-primary transition-colors">
              {t("nav.funcionalidades")}
            </Link>
            <Link to="/roles" activeProps={{ className: "text-primary" }} className="hover:text-primary transition-colors">
              {t("nav.roles")}
            </Link>
            <Link to="/contact" activeProps={{ className: "text-primary" }} className="hover:text-primary transition-colors">
              {t("nav.contacto")}
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/login">{t("nav.entrar")}</Link>
            </Button>
            <Button asChild variant="hero" size="sm">
              <Link to="/register">{t("nav.empezar")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
