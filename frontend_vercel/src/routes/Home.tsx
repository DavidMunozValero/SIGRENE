import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

export function Home() {
  return (
    <>
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
            Gestión inteligente del rendimiento natatorio
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Plataforma integral para entrenadores y nadadores de élite. 
            Registra entrenamientos, monitoriza indicadores y maximiza el rendimiento.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="hero" size="lg">
              <Link to="/register">Comenzar ahora</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/features">Conocer más</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Todo lo que necesitas</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🏊",
                title: "Registro de entrenamientos",
                desc: "Controla volumen, intensidad y carga de entrenamiento con precisión."
              },
              {
                icon: "📊",
                title: "Análisis de datos",
                desc: "Métricas avanzadas como sRPE, TRIMP y ACWR para optimizar cargas."
              },
              {
                icon: "🔒",
                title: "Datos seguros",
                desc: "Plataforma privada con autenticación JWT y control de acceso."
              },
            ].map((feature, i) => (
              <div key={i} className="text-center p-6">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para empezar?</h2>
          <p className="text-muted-foreground mb-8">
            Únete a clubes y federaciones que ya confían en SIGRENE
          </p>
          <Button asChild variant="hero" size="lg">
            <Link to="/register">Crear mi cuenta</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
