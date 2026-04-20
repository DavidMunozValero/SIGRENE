import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, SectionCard, StatCard } from "@/components/dashboard/Cards";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/swimmer/")({
  head: () => ({ meta: [{ title: "Hoy — Nadador" }] }),
  component: SwimmerHome,
});

function SwimmerHome() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <>
      <PageHeader title="¡Buenos días, Ana!" description="Tu wellness matinal te espera antes del entreno." />

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard label="Racha wellness" value="12 días" delta="🔥 sigue así" />
        <StatCard label="Mi ACWR" value="1.08" delta="zona óptima" />
        <StatCard label="Próx. entreno" value="17:00" delta="Series 4×100" />
      </div>

      <SectionCard
        title={submitted ? "✅ Wellness enviado" : "Wellness de hoy"}
        description={submitted ? "Gracias. Tu entrenadora ya puede verlo." : "Cuatro preguntas rápidas, menos de un minuto."}
      >
        {submitted ? (
          <div className="text-center py-6">
            <div className="mx-auto h-14 w-14 rounded-full bg-gradient-water grid place-items-center text-white shadow-aqua">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Disfruta del entreno 🌊</p>
            <Button variant="ghost" className="mt-4" onClick={() => setSubmitted(false)}>Editar</Button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="space-y-6"
          >
            {[
              { l: "¿Cuántas horas dormiste?", min: 0, max: 12, def: 8 },
              { l: "¿Cómo te sientes de ánimo?", min: 1, max: 10, def: 8 },
              { l: "¿Dolor muscular?", min: 1, max: 10, def: 3 },
              { l: "¿Nivel de fatiga?", min: 1, max: 10, def: 3 },
            ].map((q) => (
              <div key={q.l}>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">{q.l}</label>
                  <span className="text-sm text-primary font-semibold" id={`v-${q.l}`}>{q.def}</span>
                </div>
                <input
                  type="range"
                  min={q.min}
                  max={q.max}
                  defaultValue={q.def}
                  onChange={(e) => {
                    const el = document.getElementById(`v-${q.l}`);
                    if (el) el.textContent = e.target.value;
                  }}
                  className="w-full accent-[oklch(0.55_0.13_210)]"
                />
              </div>
            ))}
            <Button type="submit" variant="hero" size="lg" className="w-full">
              Enviar wellness
            </Button>
          </form>
        )}
      </SectionCard>
    </>
  );
}
