import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  PageHeader,
  SectionCard,
  StatCard,
} from "@/components/dashboard/Cards";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/app/swimmer/")({
  head: () => ({ meta: [{ title: "Hoy — Nadador" }] }),
  component: SwimmerHome,
});

function SwimmerHome() {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  return (
    <>
      <PageHeader
        title={t("swimmer.index.greeting") + " Ana!"}
        description={t("swimmer.index.greeting_desc")}
      />

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard
          label={t("swimmer.index.streak")}
          value="12 días"
          delta={t("swimmer.index.streak_emoji")}
        />
        <StatCard
          label={t("swimmer.index.acwr")}
          value="1.08"
          delta={t("swimmer.index.acwr_emoji")}
        />
        <StatCard
          label={t("swimmer.index.next_training")}
          value="17:00"
          delta={t("swimmer.index.next_training_emoji")}
        />
      </div>

      <SectionCard
        title={
          submitted
            ? t("swimmer.index.wellness_sent")
            : t("swimmer.index.wellness_today")
        }
        description={
          submitted
            ? t("swimmer.index.thanks")
            : t("swimmer.index.wellness_prompt")
        }
      >
        {submitted ? (
          <div className="text-center py-6">
            <div className="mx-auto h-14 w-14 rounded-full bg-gradient-water grid place-items-center text-white shadow-aqua">
              <svg
                className="h-7 w-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {t("swimmer.index.enjoy")}
            </p>
            <Button
              variant="ghost"
              className="mt-4"
              onClick={() => setSubmitted(false)}
            >
              {t("swimmer.index.edit")}
            </Button>
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
              { l: t("swimmer.index.sleep_hours"), min: 0, max: 12, def: 8 },
              { l: t("swimmer.index.mood"), min: 1, max: 10, def: 8 },
              { l: t("swimmer.index.muscle_pain"), min: 1, max: 10, def: 3 },
              { l: t("swimmer.index.fatigue"), min: 1, max: 10, def: 3 },
            ].map((q) => (
              <div key={q.l}>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">
                    {q.l}
                  </label>
                  <span
                    className="text-sm text-primary font-semibold"
                    id={`v-${q.l}`}
                  >
                    {q.def}
                  </span>
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
              {t("swimmer.index.send")}
            </Button>
          </form>
        )}
      </SectionCard>
    </>
  );
}
