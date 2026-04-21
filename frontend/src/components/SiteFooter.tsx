import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-gradient-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Plataforma federativa para la gestión integral del rendimiento, bienestar y carga de entrenamiento en natación.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Plataforma</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Funcionalidades</li>
              <li>Roles</li>
              <li>Seguridad</li>
              <li>GDPR</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Federaciones</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Onboarding</li>
              <li>Contacto comercial</li>
              <li>Soporte</li>
              <li>Documentación API</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-border/60 pt-6 text-xs text-muted-foreground flex flex-col sm:flex-row gap-2 justify-between">
          <p>© {new Date().getFullYear()} SIGRENE — Sistema de Gestión del Rendimiento en Natación.</p>
          <p>Hecho con ♒︎ para el deporte.</p>
        </div>
      </div>
    </footer>
  );
}
