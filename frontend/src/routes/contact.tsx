import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contacto — SIGRENE" },
      { name: "description", content: "Habla con el equipo de SIGRENE para llevar tu federación de natación al siguiente nivel." },
      { property: "og:title", content: "Contacto — SIGRENE" },
      { property: "og:description", content: "Resolvemos tus dudas sobre onboarding, seguridad y precios." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Contacto</p>
            <h1 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight">
              Hablemos de tu federación.
            </h1>
            <p className="mt-4 text-muted-foreground text-lg">
              Trabajamos con federaciones nacionales y autonómicas para diseñar onboardings a medida. Cuéntanos tu caso.
            </p>
            <div className="mt-8 space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-gradient-water grid place-items-center text-white shadow-aqua">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <span>federaciones@sigrene.app</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-gradient-water grid place-items-center text-white shadow-aqua">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <span>Madrid · Barcelona · remoto</span>
              </div>
            </div>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="rounded-3xl bg-card border border-border/60 shadow-glass p-6 md:p-8 space-y-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" placeholder="Ana García" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="org">Federación</Label>
                <Input id="org" placeholder="Fed. Natación Madrid" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="ana@federacion.es" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="msg">Mensaje</Label>
              <Textarea id="msg" rows={5} placeholder="Cuéntanos sobre tu federación y necesidades..." />
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full">
              Enviar mensaje
            </Button>
          </form>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
