import { Link } from "react-router-dom";

export function Features() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold text-center mb-4">Características</h1>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          SIGRENE proporciona todas las herramientas que necesitas para gestionar el rendimiento de tus nadadores.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              icon: "📅",
              title: "Registro Diario",
              desc: "Registra sesiones de entrenamiento con volumen, intensidad, RPE y frecuencia cardíaca."
            },
            {
              icon: "🌅",
              title: "Wellness Matutino",
              desc: "Seguimiento del estado de recuperación con métricas de sueño, fatiga y stressors."
            },
            {
              icon: "💪",
              title: "Control Filosófico",
              desc: "Monitorea HRV, CMJ, lactato, cortisol/testosterona y más."
            },
            {
              icon: "⚖️",
              title: "Composición Corporal",
              desc: "Control de peso, masa muscular, grasa corporal e hidratación."
            },
            {
              icon: "🏅",
              title: "Análisis de Competición",
              desc: "Tiempos parciales, análisis de fases y variables cinemáticas."
            },
            {
              icon: "📈",
              title: "Métricas Avanzadas",
              desc: "Cálculos automáticos de sRPE, TRIMP, ACWR y densidad de entrenamiento."
            },
          ].map((feature, i) => (
            <div key={i} className="bg-white rounded-xl border border-border/60 p-6 shadow-glass">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/register" className="text-primary hover:underline">
            Crear una cuenta →
          </Link>
        </div>
      </div>
    </section>
  );
}
