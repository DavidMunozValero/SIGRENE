import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/dashboard/Cards";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/app/admin/invitations")({
  head: () => ({ meta: [{ title: "Registro Directo — Admin" }] }),
  component: InvitationsPageWithI18n,
});

function InvitationsPageWithI18n() {
  const { t } = useLanguage();
  return <InvitationsPage t={t} />;
}

function InvitationsPage({ t }: { t: (key: string) => string }) {
  return (
    <>
      <PageHeader
        title={t("admin.invitations.title_page")}
        description={t("admin.invitations.desc")}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard
          title={t("admin.invitations.register")}
          description={t("admin.invitations.register_desc")}
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("admin.invitations.register_desc2")}
            </p>
            <Button asChild variant="hero">
              <Link to="/app/admin/register-trainer">+ {t("admin.invitations.register")}</Link>
            </Button>
          </div>
        </SectionCard>

        <SectionCard title={t("admin.invitations.manage")} description={t("admin.invitations.manage_desc")}>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("admin.invitations.manage_desc2")}
            </p>
            <Button asChild variant="outline">
              <Link to="/app/admin/users">→ Ir a Usuarios</Link>
            </Button>
          </div>
        </SectionCard>
      </div>
    </>
  );
}
