import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, SectionCard } from "@/components/dashboard/Cards";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/app/admin/backups")({
  head: () => ({ meta: [{ title: "Backups — Superadmin" }] }),
  component: BackupsPageWithI18n,
});

function BackupsPageWithI18n() {
  const { t } = useLanguage();
  return <BackupsPage t={t} />;
}

interface Backup {
  name: string;
  size: number;
  size_formatted: string;
  created_at: string;
}

function BackupsPage({ t }: { t: (key: string) => string }) {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    loadBackups();
  }, []);

  async function loadBackups() {
    try {
      setIsLoading(true);
      const res = await api.getBackups();
      setBackups(res.backups || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateBackup() {
    setCreating(true);
    try {
      await api.createBackup();
      await loadBackups();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDownload(backup: Backup) {
    try {
      const blob = await api.downloadBackup(backup.name);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = backup.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleRestore(backup: Backup) {
    const confirm1 = confirm(t("admin.backups.restore_confirm"));
    if (!confirm1) return;

    const confirm2 = confirm(t("admin.backups.restore_final"));
    if (!confirm2) return;

    setRestoring(backup.name);
    try {
      await api.restoreBackup(backup.name);
      alert(t("admin.backups.restore_success"));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRestoring(null);
    }
  }

  function formatDate(dateStr: string) {
    try {
      return new Date(dateStr).toLocaleString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  }

  return (
    <>
      <PageHeader
        title={t("admin.backups.title_page")}
        description={t("admin.backups.desc")}
        action={
          <Button asChild variant="outline">
            <Link to="/app/admin">← {t("admin.backups.back")}</Link>
          </Button>
        }
      />

      <div className="space-y-6">
        <SectionCard title={t("admin.backups.create")}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t("admin.backups.create_desc")}</p>
            </div>
            <Button
              variant="hero"
              onClick={handleCreateBackup}
              disabled={creating}
            >
              {creating ? t("admin.backups.creating") : `+ ${t("admin.backups.create_btn")}`}
            </Button>
          </div>
        </SectionCard>

        <SectionCard title={t("admin.backups.available")}>
          {isLoading ? (
            <div className="h-64 rounded-xl bg-muted animate-pulse" />
          ) : error ? (
            <div className="rounded-lg bg-destructive/10 text-destructive p-4">{error}</div>
          ) : backups.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <svg className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
              <p>{t("admin.backups.no_backups")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {backups.map((backup) => (
                <div
                  key={backup.name}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{backup.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(backup.created_at)} · {backup.size_formatted}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(backup)}
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      {t("admin.backups.download")}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={restoring === backup.name}
                      onClick={() => handleRestore(backup)}
                    >
                      {restoring === backup.name ? t("admin.backups.restoring") : t("admin.backups.restore")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
          <div className="flex gap-3">
            <svg className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-400">{t("admin.backups.warning_title")}</p>
              <p className="text-sm text-yellow-400/80 mt-1">{t("admin.backups.warning_desc")}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
