import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Funcionalidades — SIGRENE" },
      { name: "description", content: "Auth y permisos, multi-tenant, invitaciones, JWT, auditoría y GDPR en SIGRENE." },
      { property: "og:title", content: "Funcionalidades — SIGRENE" },
      { property: "og:description", content: "Auth, permisos por rol, multi-tenant, JWT y auditoría completa." },
    ],
  }),
  component: FeaturesPage,
});

const blocks = [
  {
    title: "Multi-tenant con aislamiento por organización",
    body: "Cada federación opera en su propio espacio lógico. Las consultas se filtran por organization_id en todas las capas, garantizando que los datos no se mezclen jamás.",
  },
  {
    title: "Control de acceso por rol y por grupo",
    body: "Federation Admin > Director Técnico > Entrenador > Nadador. Un entrenador solo accede a sus nadadores; un nadador solo a sus propios datos.",
  },
  {
    title: "Invitaciones por email con expiración",
    body: "Tokens de invitación firmados con expiración configurable. Reenvío y revocación desde el panel administrativo en un click.",
  },
  {
    title: "Autenticación con JWT y refresh rotativo",
    body: "Tokens cortos (15 min) con refresh rotativo y opción 'remember me' a 30 días. Claims con user_id, organization_id y role.",
  },
  {
    title: "Recuperación de contraseña segura",
    body: "Enlaces de reset válidos 1 hora, un solo uso, invalidación automática del resto de tokens del usuario.",
  },
  {
    title: "Rate limiting y bloqueo de cuentas",
    body: "Tras 5 intentos fallidos en 15 minutos la cuenta se bloquea automáticamente. Previene ataques de fuerza bruta.",
  },
  {
    title: "Auditoría inmutable",
    body: "Todo evento de autenticación queda registrado con IP, user agent y timestamp. Consultable por admins federativos.",
  },
  {
    title: "Cumplimiento GDPR",
    body: "Derecho de acceso, rectificación, portabilidad y borrado. Export de datos personales en JSON estándar.",
  },
];

function FeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Funcionalidades v1</p>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight">
            Todo lo que tu federación necesita para empezar.
          </h1>
          <p className="mt-4 text-muted-foreground text-lg">
            La primera versión de SIGRENE cubre los pilares de autenticación, autorización y onboarding multi-tenant. Listos para escalar a wellness, carga y resultados.
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
