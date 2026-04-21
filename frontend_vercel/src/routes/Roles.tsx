import { Link } from "react-router-dom";

const roles = [
  {
    name: "Federación Admin",
    to: "/app/admin",
    color: "from-blue-600 to-blue-800",
    bullets: [
      "Gestiona usuarios y permisos",
      "Registra entrenadores y nadadores",
      "Configuración del sistema",
    ],
  },
  {
    name: "Director Técnico",
    to: "/app/director",
    color: "from-blue-500 to-blue-700",
    bullets: [
      "Dashboard agregado con KPIs",
      "Vista por grupos",
      "Informes ejecutivos",
    ],
  },
  {
    name: "Entrenador",
    to: "/app/coach",
    color: "from-cyan-500 to-cyan-700",
    bullets: [
      "Gestión de sus nadadores",
      "Registro de entrenamientos",
      "Seguimiento de wellness",
    ],
  },
  {
    name: "Nadador",
    to: "/app/swimmer",
    color: "from-teal-500 to-teal-700",
    bullets: [
      "Panel personal",
      "Historial de entrenamientos",
      "Registro de wellness",
    ],
  },
];

export function Roles() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-4">Roles y permisos</h1>
        <p className="text-muted-foreground text-center mb-12">
          Cada rol tiene acceso específico a las funcionalidades de la plataforma.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {roles.map((r) => (
            <div key={r.name} className="rounded-xl bg-white border border-border/60 overflow-hidden shadow-glass">
              <div className={`h-2 bg-gradient-to-r ${r.color}`} />
              <div className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-4">{r.name}</h3>
                <ul className="space-y-2">
                  {r.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="text-primary">✓</span> {b}
                    </li>
                  ))}
                </ul>
                <Link
                  to={r.to}
                  className="mt-4 inline-block text-sm text-primary hover:underline"
                >
                  Ver demo →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
