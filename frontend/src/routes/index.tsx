import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import heroPool from "@/assets/hero-pool.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SIGRENE — Plataforma federativa de natación" },
      {
        name: "description",
        content:
          "SIGRENE es la plataforma federativa para la gestión del rendimiento, bienestar y carga de entrenamiento en natación. Multi-tenant, segura y lista para federaciones.",
      },
      { property: "og:title", content: "SIGRENE — Plataforma federativa de natación" },
      { property: "og:description", content: "Rendimiento, wellness y ACWR para federaciones, directores técnicos, entrenadores y nadadores." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Stats />
        <Roles />
        <Features />
        <CTA />
      </main>
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img
          src={heroPool}
          alt="Piscina de competición vista desde el agua con líneas de calle y rayos de sol"
          className="h-full w-full object-cover"
          width={1920}
          height={1280}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-28 md:pt-28 md:pb-40">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground">
            La <span className="text-gradient-water">corriente</span> que mueve
            <br className="hidden sm:block" /> a tu federación de natación.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl">
            Plataforma para la gestión integral del rendimiento de nadadores. Centraliza el seguimiento diario, análisis de competición y control de carga de entrenamiento. Diseñada para federaciones, clubes, entrenadores y nadadores.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="hero" size="xl">
              <Link to="/register">Empezar ahora</Link>
            </Button>
            <Button asChild variant="glass" size="xl">
              <Link to="/login">Acceder</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const items = [
    { v: "3 roles", l: "Perfiles adaptados" },
    { v: "Rendimiento", l: "Seguimiento diario" },
    { v: "Métricas", l: "Análisis avanzado" },
    { v: "RGPD", l: "Datos protegidos" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 glass rounded-2xl p-4 shadow-elevated">
        {items.map((i) => (
          <div key={i.l} className="text-center px-2 py-3">
            <p className="text-2xl md:text-3xl font-bold text-gradient-water">{i.v}</p>
            <p className="text-xs text-muted-foreground mt-1">{i.l}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Roles() {
  const roles = [
    {
      title: "Director Técnico",
      desc: "Dashboard agregado con KPIs federativos: métricas de rendimiento, participación y tendencia.",
      tag: "Estrategia",
    },
    {
      title: "Entrenador",
      desc: "Gestiona su grupo de nadadores, consulta rendimientos y comparte informes con familias.",
      tag: "Operación",
    },
    {
      title: "Nadador",
      desc: "Se registra por invitación y completa su seguimiento de forma diaria.",
      tag: "Seguimiento",
    },
  ];
  return (
    <section id="roles" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Roles</p>
        <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">
          Tres perfiles, una misma plataforma.
        </h2>
        <p className="mt-3 text-muted-foreground">
          Acceso por capas con aislamiento de datos entre organizaciones y entre grupos del mismo entrenador.
        </p>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map((r) => (
          <div
            key={r.title}
            className="group relative rounded-2xl bg-card border border-border/60 p-6 shadow-glass hover:shadow-elevated hover:-translate-y-1 transition-all duration-300"
          >
            <div className="absolute -top-3 right-4 rounded-full bg-aqua/20 text-primary text-[10px] font-semibold px-2 py-1">
              {r.tag}
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-water grid place-items-center text-white shadow-aqua mb-4">
              {r.title === "Director Técnico" && (
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
              )}
              {r.title === "Entrenador" && (
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              )}
              {r.title === "Nadador" && (
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12c1.5-1.5 3-2 5-2s3.5.5 5 2 3 2 5 2 3.5-.5 5-2"/><path d="M2 17c1.5-1.5 3-2 5-2s3.5.5 5 2 3 2 5 2 3.5-.5 5-2"/><circle cx="8" cy="5" r="2"/><path d="m9 8-1.5 1.5"/></svg>
              )}
            </div>
            <h3 className="font-semibold text-foreground">{r.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{r.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { t: "Organización por clubes", d: "Cada federación o club gestiona sus datos de forma independiente." },
    { t: "Permisos por rol", d: "Cada usuario accede solo a la información que le corresponde." },
    { t: "Seguimiento diario", d: "Cada nadador registra cada mañana cómo se encuentra antes del entreno." },
    { t: "Control de carga", d: "Métricas para prevenir lesiones y optimizar el rendimiento de cada nadador." },
    { t: "Análisis de competición", d: "Registro de tiempos, parciales y velocidad en cada tramo de la carrera." },
    { t: "Informes", d: "Reportes visuales adaptados para cada tipo de usuario." },
  ];
  return (
    <section id="funcionalidades" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-28">
      <div className="grid lg:grid-cols-3 gap-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Funcionalidades</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">
            Todo lo que tu federación necesita.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Herramientas prácticas para gestionar el rendimiento de nadadores desde la base hasta élite.
          </p>
        </div>
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          {items.map((it) => (
            <div key={it.t} className="rounded-2xl bg-card/80 backdrop-blur border border-border/60 p-5">
              <div className="flex items-center gap-2 text-primary">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"/></svg>
                <h3 className="font-semibold text-foreground">{it.t}</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{it.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-28">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-deep p-10 md:p-14 shadow-elevated">
        <div className="absolute inset-0 bg-gradient-glow opacity-50" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl text-white">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              ¿Listos para zambullirse?
            </h2>
            <p className="mt-3 text-white/80">
              Crea tu federación e invita a tu primer entrenador para empezar a gestionar el rendimiento de tus nadadores.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="glass" size="xl">
              <Link to="/register">Empezar ahora</Link>
            </Button>
            <Button asChild variant="hero" size="xl">
              <Link to="/login">Acceder</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
