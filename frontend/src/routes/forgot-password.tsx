import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/lib/i18n";
import { api } from "@/lib/api";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "forgot.page.title" },
      { name: "description", content: "forgot.page.desc" },
    ],
  }),
  component: ForgotPage,
});

function ForgotPage() {
  const { t } = useLanguage();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;

    try {
      await api.requestPasswordRecovery(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar el correo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={sent ? "Revisa tu correo" : t("forgot.title")}
      subtitle={
        sent
          ? t("forgot.subtitle")
          : t("forgot.subtitle2")
      }
      footer={
        <>
          <Link to="/login" className="text-aqua font-medium hover:underline">← {t("forgot.back")}</Link>
        </>
      }
    >
      {!sent ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">{t("forgot.email")}</Label>
            <Input id="email" name="email" type="email" placeholder={t("forgot.email_placeholder")} required />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
            {loading ? t("forgot.sending") : t("forgot.send")}
          </Button>
        </form>
      ) : (
        <div className="text-center py-6">
          <div className="mx-auto h-14 w-14 rounded-full bg-gradient-water grid place-items-center text-white shadow-aqua">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{t("forgot.expiry")}</p>
        </div>
      )}
    </AuthShell>
  );
}
