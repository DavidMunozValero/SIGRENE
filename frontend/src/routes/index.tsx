import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
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
  const { t, lang } = useLanguage();
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
            {lang === "es" ? (
              <>
                La <span className="text-gradient-water">corriente</span> que mueve
                <br className="hidden sm:block" /> a tu federación de natación.
              </>
            ) : (
              <>
                The <span className="text-gradient-water">current</span> that drives
                <br className="hidden sm:block" /> your swimming federation.
              </>
            )}
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl">
            {t("hero.subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="hero" size="xl">
              <Link to="/register">{t("hero.cta.start")}</Link>
            </Button>
            <Button asChild variant="glass" size="xl">
              <Link to="/login">{t("hero.cta.access")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const { t } = useLanguage();
  const items = [
    { v: t("stats.roles"), l: t("stats.roles.label") },
    { v: t("stats.performance"), l: t("stats.performance.label") },
    { v: t("stats.metrics"), l: t("stats.metrics.label") },
    { v: t("stats.rgpd"), l: t("stats.rgpd.label") },
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
  const { t } = useLanguage();
  const roles = [
    {
      title: t("roles.director.title"),
      desc: t("roles.director.desc"),
      tag: t("roles.director.tag"),
    },
    {
      title: t("roles.coach.title"),
      desc: t("roles.coach.desc"),
      tag: t("roles.coach.tag"),
    },
    {
      title: t("roles.swimmer.title"),
      desc: t("roles.swimmer.desc"),
      tag: t("roles.swimmer.tag"),
    },
  ];
  return (
    <section id="roles" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Roles</p>
        <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">
          {t("roles.title")}
        </h2>
        <p className="mt-3 text-muted-foreground">
          {t("roles.subtitle")}
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
              {r.title === t("roles.director.title") && (
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
              )}
              {r.title === t("roles.coach.title") && (
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              )}
              {r.title === t("roles.swimmer.title") && (
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
  const { t } = useLanguage();
  const items = [
    { it: t("features.org"), d: t("features.org.desc") },
    { it: t("features.perms"), d: t("features.perms.desc") },
    { it: t("features.daily"), d: t("features.daily.desc") },
    { it: t("features.load"), d: t("features.load.desc") },
    { it: t("features.competition"), d: t("features.competition.desc") },
    { it: t("features.reports"), d: t("features.reports.desc") },
  ];
  return (
    <section id="funcionalidades" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-28">
      <div className="grid lg:grid-cols-3 gap-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Funcionalidades</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">
            {t("features.title")}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t("features.subtitle")}
          </p>
        </div>
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          {items.map((it) => (
            <div key={it.it} className="rounded-2xl bg-card/80 backdrop-blur border border-border/60 p-5">
              <div className="flex items-center gap-2 text-primary">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"/></svg>
                <h3 className="font-semibold text-foreground">{it.it}</h3>
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
  const { t } = useLanguage();
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-28">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-deep p-10 md:p-14 shadow-elevated">
        <div className="absolute inset-0 bg-gradient-glow opacity-50" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl text-white">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              {t("cta.title")}
            </h2>
            <p className="mt-3 text-white/80">
              {t("cta.subtitle")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="glass" size="xl">
              <Link to="/register">{t("cta.start")}</Link>
            </Button>
            <Button asChild variant="hero" size="xl">
              <Link to="/login">{t("cta.access")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
