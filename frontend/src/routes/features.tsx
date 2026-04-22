import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Funcionalidades — SIGRENE" },
      { name: "description", content: "Gestión de nadadores, seguimiento diario, control de carga y análisis de competición para federaciones y clubes." },
      { property: "og:title", content: "Funcionalidades — SIGRENE" },
      { property: "og:description", content: "Herramientas para gestionar el rendimiento de nadadores." },
    ],
  }),
  component: FeaturesPage,
});

const blocks = [
  {
    title: "Organización por clubes",
    body: "Cada federación o club gestiona sus datos de forma independiente, con acceso privado y seguro.",
  },
  {
    title: "Permisos por rol",
    body: "Directores, entrenadores y nadadores acceden solo a la información que les corresponde.",
  },
  {
    title: "Seguimiento diario",
    body: "Cada nadador puede realizar cuestionarios diarios o periódicos. Los entrenadores pueden consultar el estado de todo su grupo.",
  },
  {
    title: "Control de carga",
    body: "Métricas para prevenir lesiones y optimizar el rendimiento de cada nadador a lo largo del tiempo.",
  },
  {
    title: "Análisis de competición",
    body: "Registro de tiempos de carrera. Análisis de imágenes.",
  },
  {
    title: "Informes",
    body: "Reportes visuales adaptados para cada tipo de usuario que permiten seguir la evolución de cada nadador.",
  },
  {
    title: "Gestión de nadadores",
    body: "Registro completo de cada nadador con datos personales, rendimiento histórico y asignación a grupos de entrenamiento.",
  },
  {
    title: "Privacidad de datos",
    body: "Cumplimiento con la normativa de protección de datos. Cada usuario gestiona sus propios datos de forma segura.",
  },
];

function FeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Funcionalidades</p>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight">
            Todo lo que tu federación necesita.
          </h1>
          <p className="mt-4 text-muted-foreground text-lg">
            Herramientas prácticas para gestionar el rendimiento de nadadores desde la base hasta la élite.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {blocks.map((b, i) => (
            <div key={b.title} className="rounded-2xl bg-card border border-border/60 p-6 shadow-glass">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-water grid place-items-center text-white text-sm font-bold shadow-aqua">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="font-semibold text-foreground">{b.title}</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{b.body}</p>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
