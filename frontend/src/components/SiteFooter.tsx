import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-gradient-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              Plataforma para la gestión integral del rendimiento de nadadores. Centraliza el seguimiento diario, análisis de competición y control de carga de entrenamiento. Diseñada para federaciones, clubes, entrenadores y nadadores.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Plataforma</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#funcionalidades" className="hover:text-primary transition-colors">
                  Funcionalidades
                </a>
              </li>
              <li>
                <a href="#roles" className="hover:text-primary transition-colors">
                  Roles
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
          <p>© David Muñoz Valero.</p>
        </div>
      </div>
    </footer>
  );
}
