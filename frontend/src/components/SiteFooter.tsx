import { Logo } from "./Logo";
import { useLanguage } from "@/lib/i18n";

export function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer className="mt-24 border-t border-border/60 bg-gradient-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              {t("hero.subtitle")}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Plataforma</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#funcionalidades" className="hover:text-primary transition-colors">
                  {t("nav.funcionalidades")}
                </a>
              </li>
              <li>
                <a href="#roles" className="hover:text-primary transition-colors">
                  {t("nav.roles")}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Contacto</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>David Muñoz Valero</li>
              <li>
                <a href="mailto:info@davidmunozvalero.com" className="hover:text-primary transition-colors">
                  info@davidmunozvalero.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-border/60 pt-6 text-xs text-muted-foreground flex flex-col sm:flex-row gap-2 justify-between">
          <p>{new Date().getFullYear()} Sistema de Gestión del Rendimiento en Nadadores de Élite.</p>
          <p>© David Muñoz Valero {t("footer.rights")}</p>
        </div>
      </div>
    </footer>
  );
}
