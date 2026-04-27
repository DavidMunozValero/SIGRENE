import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError(t("invite.passwords_mismatch"));
      return;
    }

    if (password.length < 8) {
      setError(t("invite.password_min"));
      return;
    }

    navigate({ to: "/app/coach" });
  };

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
      {error && (
        <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3 mb-4">
          {error}
        </div>
      )}
      <div className="rounded-xl bg-aqua/15 border border-aqua/30 p-3 text-sm mb-4">
        <p className="text-foreground">
          <span className="font-semibold">Federación Natación Madrid</span> te ha invitado como{" "}
          <span className="font-semibold text-primary">Entrenador</span>.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <Input id="password" name="password" type="password" placeholder={t("invite.password_placeholder")} required minLength={8} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">{t("invite.confirm_password")}</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" placeholder={t("invite.confirm_password_placeholder")} required minLength={8} />
        </div>
        <Button type="submit" variant="hero" size="lg" className="w-full">
          {t("invite.accept")}
        </Button>
      </form>
    </AuthShell>
  );
}
