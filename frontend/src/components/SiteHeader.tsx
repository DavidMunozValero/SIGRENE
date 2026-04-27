import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "@/lib/i18n";

export function SiteHeader() {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: "/", label: t("nav.inicio"), exact: true },
    { to: "/features", label: t("nav.funcionalidades"), exact: false },
    { to: "/roles", label: t("nav.roles"), exact: false },
    { to: "/contact", label: t("nav.contacto"), exact: false },
  ];

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass border-b border-white/40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-foreground/80">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                activeOptions={{ exact: link.exact }}
                activeProps={{ className: "text-primary" }}
                className="hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/login">{t("nav.entrar")}</Link>
            </Button>
            <Button asChild variant="hero" size="sm">
              <Link to="/register">{t("nav.empezar")}</Link>
            </Button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-foreground/70 hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 bg-background/95 backdrop-blur-lg">
            <nav className="flex flex-col px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  activeOptions={{ exact: link.exact }}
                  activeProps={{ className: "text-primary bg-primary/5" }}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-2 pt-4 border-t border-border/60 mt-4">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    {t("nav.entrar")}
                  </Link>
                </Button>
                <Button asChild variant="hero" size="sm" className="flex-1">
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    {t("nav.empezar")}
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
