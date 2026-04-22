import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Política de Privacidad — SIGRENE" },
      { name: "description", content: "Política de privacidad y protección de datos de SIGRENE." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Política de Privacidad</h1>
        <p className="text-muted-foreground mt-2 text-sm">Última actualización: 22 de abril de 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/80">
            <p>
              <strong>AVISO:</strong> SIGRENE es un proyecto de investigación. Sus datos serán tratados exclusivamente con fines de investigación y mejora de la plataforma, en cumplimiento con el Reglamento General de Protección de Datos (RGPD).
            </p>

            <h2 className="text-xl font-semibold mt-8">1. Responsable del tratamiento</h2>
            <p>
              El responsable del tratamiento de sus datos personales es:<br />
              <strong>David Muñoz Valero</strong><br />
              Email: <a href="mailto:info@davidmunozvalero.com" className="text-primary hover:underline">info@davidmunozvalero.com</a><br />
              Ubicación: Toledo, España
            </p>

            <h2 className="text-xl font-semibold mt-8">2. Datos personales recogidos</h2>
            <p>
              La Plataforma puede recoger los siguientes tipos de datos personales:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Datos de identificación:</strong> nombre, apellidos, email.</li>
              <li><strong>Datos organizacionales:</strong> nombre de la federación o club, región, zona horaria.</li>
              <li><strong>Datos de rendimiento deportivo:</strong> registros de seguimiento diario, entrenamientos, resultados de competición, análisis biomecánicos y datos fisiológicos.</li>
              <li><strong>Datos de salud y bienestar:</strong> información sobre el estado de forma diaria de los nadadores, incluyendo aspectos subjetivos como el cansancio, el ánimo y la calidad del sueño.</li>
              <li><strong>Datos de composición corporal:</strong> peso, altura, envergadura y otros datos antropométricos.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8">3. Finalidad del tratamiento</h2>
            <p>
              Sus datos personales serán utilizados para:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Gestionar su cuenta de usuario y el acceso a la Plataforma.</li>
              <li>Facilitar la gestión del rendimiento de los nadadores por parte de entrenadores y directores técnicos.</li>
              <li>Generar informes adaptados a cada rol (entrenador, nadador, director).</li>
              <li>Mejorar la Plataforma y desarrollar nuevas funcionalidades.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8">4. Base legal</h2>
            <p>
              El tratamiento de sus datos personales se realiza bajo las siguientes bases legales:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Consentimiento:</strong> mediante el registro en la Plataforma, usted consiente el tratamiento de sus datos para los fines descritos.</li>
              <li><strong>Ejecución de un contrato:</strong> el tratamiento es necesario para prestarle los servicios de la Plataforma.</li>
              <li><strong>Interés legítimo:</strong> para fines de investigación y mejora del servicio.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8">5. Conservación de los datos</h2>
            <p>
              Sus datos personales serán conservados mientras mantengasu cuenta activa en la Plataforma. Puede solicitar la eliminación de sus datos en cualquier momento escribiendo a <a href="mailto:info@davidmunozvalero.com" className="text-primary hover:underline">info@davidmunozvalero.com</a>.
            </p>
            <p>
              Los datos de rendimiento deportivo e historial de entrenamientos podrán ser conservados de forma anonimizada con fines de investigación tras la eliminación de su cuenta.
            </p>

            <h2 className="text-xl font-semibold mt-8">6. Destinatarios</h2>
            <p>
              Sus datos personales no serán vendidos, alquilados ni cedidos a terceros sin su consentimiento, excepto:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Cuando sea requerido por la ley o autoridad competente.</li>
              <li>Para la prestación de servicios auxiliares (alojamiento, copias de seguridad), siempre bajo agreements de confidencialidad.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8">7. Sus derechos</h2>
            <p>
              En cumplimiento con el RGPD, usted tiene los siguientes derechos sobre sus datos personales:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Acceso:</strong> obtener confirmación de qué datos suyos están siendo tratados y acceder a ellos.</li>
              <li><strong>Rectificación:</strong> solicitar la corrección de datos inexactos o incompletos.</li>
              <li><strong>Supresión:</strong> solicitar la eliminación de sus datos ("derecho al olvido").</li>
              <li><strong>Limitación:</strong> solicitar que limitemos el tratamiento de sus datos.</li>
              <li><strong>Portabilidad:</strong> recibir sus datos en un formato estructurado y de uso común.</li>
              <li><strong>Oposición:</strong> oponerse al tratamiento de sus datos.</li>
            </ul>
            <p>
              Para ejercer cualquiera de estos derechos, contacte a través de <a href="mailto:info@davidmunozvalero.com" className="text-primary hover:underline">info@davidmunozvalero.com</a>.
            </p>

            <h2 className="text-xl font-semibold mt-8">8. Medidas de seguridad</h2>
            <p>
              La Plataforma implementa medidas de seguridad técnicas y organizativas apropiadas para proteger sus datos personales contra pérdida, acceso no autorizado, alteración o destrucción. Estas medidas incluyen, entre otras:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Cifrado de datos en tránsito mediante HTTPS.</li>
              <li>Control de acceso basado en roles.</li>
              <li>Tokens de autenticación con expiración.</li>
              <li>Respaldo periódico de datos.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8">9. Cookies y tecnologías similares</h2>
            <p>
              La Plataforma utiliza cookies y tecnologías similares para garantizar el correcto funcionamiento de los servicios y mejorar tu experiencia de uso. Al acceder a la Plataforma por primera vez, se muestra un banner de cookies que te permite aceptar, rechazar o configurar tus preferencias.
            </p>
            <p className="mt-4">
              <strong>Tipos de cookies utilizadas:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Cookies necesarias:</strong> Son esenciales para el funcionamiento de la Plataforma. Permiten la autenticación, gestión de sesiones y seguridad. No pueden desactivarse.</li>
              <li><strong>Cookies de análisis:</strong> Nos ayudan a entender cómo interactúas con la Plataforma, permitiéndonos mejorar continuamente. Solo se utilizan si das tu consentimiento.</li>
              <li><strong>Cookies de marketing:</strong> Se utilizan para mostrar contenido personalizado y relevante. Solo se utilizan si das tu consentimiento.</li>
            </ul>
            <p className="mt-4">
              <strong>Gestión de cookies:</strong>
            </p>
            <p>
              Puedes cambiar tus preferencias de cookies en cualquier momento desde el enlace "Configurar cookies" disponible en el banner inicial o en el pie de página de la Plataforma. Ten en cuenta que bloquear cookies necesarias puede afectar al funcionamiento de la Plataforma.
            </p>
            <p className="mt-4">
              <strong>Cookies de sesión (httpOnly):</strong>
            </p>
            <p>
              Para mayor seguridad, la sesión de usuario se gestiona mediante cookies httpOnly, que no son accesibles desde JavaScript. Estas cookies se almacenan automáticamente cuando inicias sesión si aceptas "Mantener sesión iniciada".
            </p>

            <h2 className="text-xl font-semibold mt-8">10. Menores de edad</h2>
            <p>
              La Plataforma puede ser utilizada por menores de edad en calidad de nadadores. En estos casos, se requerirá el consentimiento de un padre, madre o tutor legal para el registro y tratamiento de datos del menor.
            </p>

            <h2 className="text-xl font-semibold mt-8">11. Modificaciones</h2>
            <p>
              Esta Política de Privacidad puede ser actualizada periódicamente. Cualquier modificación será publicada en esta página. Le recomendamos revisar esta política regularmente.
            </p>

            <h2 className="text-xl font-semibold mt-8">12. Contacto</h2>
            <p>
              Para cualquier cuestión relacionada con la protección de sus datos personales, puede contactar con el responsable del tratamiento a través de:<br />
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