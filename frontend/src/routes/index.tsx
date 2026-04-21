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
          <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Plataforma federativa · v1
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground">
            La <span className="text-gradient-water">corriente</span> que mueve
            <br className="hidden sm:block" /> a tu federación de natación.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl">
            Centraliza wellness, carga de entrenamiento y resultados de cada nadador.
            Multi-tenant, con control de acceso por rol y diseñado para federaciones, clubes y entrenadores.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="hero" size="xl">
              <Link to="/register">Crear federación</Link>
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
    { v: "4 roles", l: "Jerarquía federativa" },
    { v: "<200ms", l: "Latencia de auth" },
    { v: "GDPR", l: "Cumplimiento nativo" },
    { v: "JWT", l: "Sesiones seguras" },
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
      title: "Federación Admin",
      desc: "Crea la organización, invita entrenadores y configura ajustes de la federación.",
      tag: "P1",
    },
    {
      title: "Director Técnico",
      desc: "Dashboard agregado con KPIs federativos: ACWR medio, participación, tendencia.",
      tag: "P2",
    },
    {
      title: "Entrenador",
      desc: "Gestiona su grupo de nadadores, lee wellness y comparte informes con padres.",
      tag: "P1",
    },
    {
      title: "Nadador",
      desc: "Se registra por invitación y completa el wellness diario antes del entreno.",
      tag: "P1",
    },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Jerarquía</p>
        <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">
          Cuatro roles, una sola plataforma.
        </h2>
        <p className="mt-3 text-muted-foreground">
          Acceso por capas con aislamiento de datos entre organizaciones y entre grupos del mismo entrenador.
        </p>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {roles.map((r) => (
          <div
            key={r.title}
            className="group relative rounded-2xl bg-card border border-border/60 p-6 shadow-glass hover:shadow-elevated hover:-translate-y-1 transition-all duration-300"
          >
            <div className="absolute -top-3 right-4 rounded-full bg-aqua/20 text-primary text-[10px] font-semibold px-2 py-1">
              {r.tag}
            </div>
            <div className="h-10 w-10 rounded-xl bg-gradient-water grid place-items-center text-white shadow-aqua mb-4">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
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
    { t: "Multi-tenant nativo", d: "Aislamiento total de datos entre federaciones, con control de acceso por filas." },
    { t: "Invitaciones seguras", d: "Tokens con expiración, reenvío y revocación desde el panel de admin." },
    { t: "Sesiones JWT", d: "Tokens firmados con claims de organización y rol, refresco rotativo." },
    { t: "Auditoría completa", d: "Cada login, logout o intento fallido queda registrado y consultable." },
    { t: "Recuperación por email", d: "Enlaces de reset válidos 1h, invalidación automática de tokens previos." },
    { t: "Rate limiting", d: "Bloqueo temporal tras 5 intentos fallidos para prevenir fuerza bruta." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-28">
      <div className="grid lg:grid-cols-3 gap-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Auth & permisos</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">
            Seguridad pensada para datos sensibles.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Datos médicos y de menores requieren controles estrictos. SIGRENE incorpora desde el día uno los pilares que la federación necesita.
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
              Crea tu federación en menos de 5 minutos e invita al primer entrenador. Sin tarjetas, sin compromisos.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="glass" size="xl">
              <Link to="/register">Empezar ahora</Link>
            </Button>
            <Button asChild variant="hero" size="xl">
              <Link to="/contact">Hablar con ventas</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
