import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/dashboard/Cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/app/swimmer/profile")({
  head: () => ({ meta: [{ title: "Mi perfil — Nadador" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { t } = useLanguage();
  return (
    <>
      <PageHeader
        title={t("swimmer.profile.title_page")}
        description={t("swimmer.profile.desc")}
      />
      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard title={t("swimmer.profile.personal_data")}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="pn">{t("swimmer.profile.full_name")}</Label>
              <Input id="pn" defaultValue="Ana Martín" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pdob">{t("swimmer.profile.birthdate")}</Label>
                <Input id="pdob" type="date" defaultValue="2012-04-15" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pst">{t("swimmer.profile.style")}</Label>
                <Input id="pst" defaultValue="Espalda" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pec">{t("swimmer.profile.emergency")}</Label>
              <Input
                id="pec"
                placeholder={t("swimmer.profile.emergency_placeholder")}
              />
            </div>
            <Button variant="hero">{t("swimmer.profile.save")}</Button>
          </form>
        </SectionCard>

        <div className="lg:col-span-2 space-y-5">
          <SectionCard title={t("swimmer.profile.my_group")}>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-water grid place-items-center text-white text-xl font-bold shadow-aqua">
                A
              </div>
              <div>
                <p className="font-semibold text-foreground">Alevín A</p>
                <p className="text-sm text-muted-foreground">
                  Entrenador: Carlos Ruiz
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Federación Natación Madrid
                </p>
              </div>
            </div>
          </SectionCard>
          <SectionCard title={t("swimmer.profile.privacy")}>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between items-center p-3 rounded-lg bg-muted/40">
                <span>{t("swimmer.profile.download")}</span>
                <Button variant="outline" size="sm">
                  {t("swimmer.profile.download_btn")}
                </Button>
              </li>
              <li className="flex justify-between items-center p-3 rounded-lg bg-muted/40">
                <span>{t("swimmer.profile.delete_account")}</span>
                <Button variant="ghost" size="sm" className="text-destructive">
                  {t("swimmer.profile.delete_btn")}
                </Button>
              </li>
            </ul>
          </SectionCard>
        </div>
      </div>
    </>
  );
}
