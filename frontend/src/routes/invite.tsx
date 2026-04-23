import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/invite")({
  head: () => ({
    meta: [
      { title: "invite.page.title" },
      { name: "description", content: "invite.page.desc" },
    ],
  }),
  component: InvitePage,
});

function InvitePage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  return (
    <AuthShell
      title={t("invite.title")}
      subtitle={t("invite.subtitle")}
      footer={
        <>
          {t("invite.has_account")}{" "}
          <Link to="/login" className="text-aqua font-medium hover:underline">{t("invite.sign_in")}</Link>
        </>
      }
    >
      <div className="rounded-xl bg-aqua/15 border border-aqua/30 p-3 text-sm mb-4">
        <p className="text-foreground">
          <span className="font-semibold">Federación Natación Madrid</span> te ha invitado como{" "}
          <span className="font-semibold text-primary">Entrenador</span>.
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ to: "/app/coach" });
        }}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <Label htmlFor="code">{t("invite.code")}</Label>
          <Input id="code" defaultValue="SIG-MAD-7H4P" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="name">{t("invite.full_name")}</Label>
          <Input id="name" placeholder={t("invite.full_name_placeholder")} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">{t("invite.create_password")}</Label>
          <Input id="password" type="password" placeholder={t("invite.password_placeholder")} required />
        </div>
        <Button type="submit" variant="hero" size="lg" className="w-full">
          {t("invite.accept")}
        </Button>
      </form>
    </AuthShell>
  );
}
