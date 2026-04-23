import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, SectionCard } from "@/components/dashboard/Cards";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/app/coach/swimmers")({
  head: () => ({ meta: [{ title: "Nadadores — Entrenador" }] }),
  component: SwimmersPage,
});

interface Nadador {
  id_seudonimo: string;
  nombre: string;
  fecha_nacimiento?: string;
  genero?: string;
  club?: string;
  provincia?: string;
}

function SwimmersPage() {
  const { t } = useLanguage();
  const [nadadores, setNadadores] = useState<Nadador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNadadores() {
      try {
        setIsLoading(true);
        const response = await api.getNadadores();
        setNadadores(response.datos || []);
      } catch (err: any) {
        setError(err.message || t("coach.swimmers.error_loading"));
      } finally {
        setIsLoading(false);
      }
    }
    loadNadadores();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <PageHeader title={t("coach.swimmers.title_page")} description={t("coach.swimmers.loading")} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-destructive/10 text-destructive p-4">
        {error}
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={t("coach.swimmers.title_page")}
        description={`${nadadores.length} ${t("coach.swimmers.count")}`}
        action={<Button variant="hero">+ {t("coach.swimmers.register")}</Button>}
      />
      <SectionCard title={`${nadadores.length} ${t("coach.swimmers.count")}`}>
        {nadadores.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            {t("coach.swimmers.no_swimmers")} <br />
            <span className="text-sm">{t("coach.swimmers.no_swimmers_desc")}</span>
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 -m-5 p-5">
            {nadadores.map((s) => {
              const initials = (s.nombre
                ?.split(" ")
                .map((x) => x[0])
                .join("")
                .slice(0, 2) || s.id_seudonimo?.[0] || "?").toUpperCase();
              const age = s.fecha_nacimiento
                ? new Date().getFullYear() - new Date(s.fecha_nacimiento).getFullYear()
                : null;

              return (
                <div
                  key={s.id_seudonimo}
                  className="rounded-xl border border-border/60 bg-card p-4 hover:shadow-glass transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-gradient-water grid place-items-center text-white font-semibold shadow-aqua">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{s.nombre}</p>
                      <p className="text-xs text-muted-foreground">
                        {age ? `${age} años` : t("coach.swimmers.age")} · {s.club || t("coach.swimmers.no_club")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">ID</span>
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                      {s.id_seudonimo}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </>
  );
}
