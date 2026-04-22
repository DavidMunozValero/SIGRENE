import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Términos y Condiciones — SIGRENE" },
      { name: "description", content: "Términos y condiciones de uso de la plataforma SIGRENE." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Términos y Condiciones</h1>
        <p className="text-muted-foreground mt-2 text-sm">Última actualización: 22 de abril de 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/80">
            <p>
              <strong>AVISO IMPORTANTE:</strong> SIGRENE es un proyecto de investigación. Esta plataforma actualmente se ofrece como prototipo funcional sin relación comercial con las instituciones a las que posteriormente podrá vincularse.
            </p>

            <h2 className="text-xl font-semibold mt-8">1. Aceptación de los términos</h2>
            <p>
              Al acceder y utilizar la plataforma SIGRENE (en adelante, "la Plataforma"), usted acepta vinculse a los presentes Términos y Condiciones en su totalidad. Si no está de acuerdo con alguno de los términos, no deberá utilizar la Plataforma.
            </p>

            <h2 className="text-xl font-semibold mt-8">2. Descripción del servicio</h2>
            <p>
              SIGRENE es una plataforma de gestión del rendimiento deportivo destinada a federaciones, clubes, entrenadores y nadadores. La Plataforma permite el seguimiento diario del estado de forma de los nadadores, el registro de entrenamientos, el análisis de competiciones y la generación de informes adaptados a cada rol.
            </p>

            <h2 className="text-xl font-semibold mt-8">3. Usuarios y registro</h2>
            <p>
              El acceso a determinadas funcionalidades de la Plataforma requiere el registro previo del usuario. El usuario se compromete a proporcionar información veraz, exacta y completa durante el registro, y a mantenerla actualizada.
            </p>
            <p>
              El usuario es responsable de mantener la confidencialidad de sus credenciales de acceso (email y contraseña). Todas las actividades realizadas bajo su cuenta son responsabilidad del titular de la cuenta.
            </p>

            <h2 className="text-xl font-semibold mt-8">4. Uso permitido</h2>
            <p>
              El usuario se compromete a utilizar la Plataforma de conformidad con la legislación vigente y los presentes términos. Queda prohibido:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Utilizar la Plataforma para fines ilegales o no autorizados.</li>
              <li>Intentar acceder a cuentas de otros usuarios sin autorización.</li>
              <li>Introducir virus, troyanos u otros elementos que puedan dañar o interrumpir el funcionamiento de la Plataforma.</li>
              <li>Realizar ingeniería inversa, descompilar o extraer el código fuente de la Plataforma.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8">5. Protección de datos</h2>
            <p>
              Los datos personales recogidos a través de la Plataforma serán tratados de conformidad con lo dispuesto en nuestra Política de Privacidad.
            </p>
            <p>
              La Plataforma incorpora medidas de seguridad técnicas y organizativas apropiadas para proteger los datos personales contra tratamiento no autorizado o ilícito.
            </p>

            <h2 className="text-xl font-semibold mt-8">6. Propiedad intelectual</h2>
            <p>
              Todos los derechos de propiedad intelectual sobre la Plataforma, incluyendo el diseño, código, textos, gráficos, logotipos e iconos, pertenecen al desarrollador de la plataforma. Queda prohibida la reproducción, distribución o modificación sin autorización expresa.
            </p>

            <h2 className="text-xl font-semibold mt-8">7. Limitación de responsabilidad</h2>
            <p>
              SIGRENE se ofrece "tal cual" como prototipo de investigación. El desarrollador no garantiza que la Plataforma esté libre de errores o que su funcionamiento sea ininterrumpido. No se asume responsabilidad por daños derivados del uso de la Plataforma.
            </p>

            <h2 className="text-xl font-semibold mt-8">8. Modificaciones</h2>
            <p>
              El desarrollador se reserva el derecho de modificar los presentes términos en cualquier momento. Las modificaciones entrarán en vigor desde su publicación en la Plataforma. El uso continuado de la Plataforma tras las modificaciones implica la aceptación de los nuevos términos.
            </p>

            <h2 className="text-xl font-semibold mt-8">9. Legislación aplicable</h2>
            <p>
              Los presentes términos se rigen por la legislación española. Cualquier controversia derivada de la interpretación o ejecución de los mismos será sometida a los tribunales competentes del territorio español.
            </p>

            <h2 className="text-xl font-semibold mt-8">10. Contacto</h2>
            <p>
              Para cualquier cuestión relacionada con los presentes términos, puede contactar a través de:<br />
              Email: <a href="mailto:info@davidmunozvalero.com" className="text-primary hover:underline">info@davidmunozvalero.com</a>
            </p>
          </div>

        <div className="mt-12 pt-6 border-t border-border/60">
          <Link to="/register" className="text-sm text-primary hover:underline">
            ← Volver al registro
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}