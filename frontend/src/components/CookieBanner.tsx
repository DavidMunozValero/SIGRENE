import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";

const COOKIE_CONSENT_KEY = "sigrene_cookie_consent";

type ConsentOption = "accepted" | "rejected" | null;

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export function CookieBanner() {
  const { t } = useLanguage();
  const [consent, setConsent] = useState<ConsentOption>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored) {
      setConsent(stored as ConsentOption);
    }
  }, []);

  const handleAcceptAll = () => {
    const fullConsent: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    localStorage.setItem("sigrene_cookie_preferences", JSON.stringify(fullConsent));
    setConsent("accepted");
    if (typeof document !== "undefined") {
      document.cookie = `sigrene_cookie_analytics=true; max-age=${60 * 60 * 24 * 365}; path=/`;
      document.cookie = `sigrene_cookie_marketing=true; max-age=${60 * 60 * 24 * 365}; path=/`;
    }
  };

  const handleRejectAll = () => {
    const minimalConsent: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, "rejected");
    localStorage.setItem("sigrene_cookie_preferences", JSON.stringify(minimalConsent));
    setConsent("rejected");
  };

  const handleSavePreferences = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    localStorage.setItem("sigrene_cookie_preferences", JSON.stringify(preferences));
    setConsent("accepted");
    if (typeof document !== "undefined") {
      document.cookie = `sigrene_cookie_analytics=${preferences.analytics}; max-age=${60 * 60 * 24 * 365}; path=/`;
      document.cookie = `sigrene_cookie_marketing=${preferences.marketing}; max-age=${60 * 60 * 24 * 365}; path=/`;
    }
  };

  if (consent !== null) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 lg:p-6">
      <div className="mx-auto max-w-4xl rounded-2xl border border-border/60 bg-card shadow-elevated">
        {!showDetails ? (
          <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between lg:p-6">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground">{t("cookies.title")}</h3>
              <p className="mt-1 text-xs text-muted-foreground lg:max-w-xl">
                {t("cookies.notice")}{" "}
                <button
                  onClick={() => setShowDetails(true)}
                  className="text-primary hover:underline"
                >
                  {t("cookies.configure")}
                </button>
              </p>
            </div>
            <div className="flex flex-col gap-2 lg:flex-row lg:shrink-0">
              <Button variant="outline" size="sm" onClick={handleRejectAll}>
                {t("cookies.reject")}
              </Button>
              <Button size="sm" onClick={handleAcceptAll}>
                {t("cookies.accept")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">{t("cookies.detail_title")}</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ← {t("cookies.back")}
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                <input
                  type="checkbox"
                  id="necessary"
                  checked={preferences.necessary}
                  disabled
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary"
                />
                <div>
                  <label htmlFor="necessary" className="text-sm font-medium text-foreground">
                    {t("cookies.necessary")}
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {t("cookies.necessary_desc")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                <input
                  type="checkbox"
                  id="analytics"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary"
                />
                <div>
                  <label htmlFor="analytics" className="text-sm font-medium text-foreground">
                    {t("cookies.analytics")}
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {t("cookies.analytics_desc")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                <input
                  type="checkbox"
                  id="marketing"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary"
                />
                <div>
                  <label htmlFor="marketing" className="text-sm font-medium text-foreground">
                    {t("cookies.marketing")}
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {t("cookies.marketing_desc")}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 lg:flex-row lg:justify-end">
              <Button variant="outline" size="sm" onClick={handleRejectAll}>
                {t("cookies.reject_all")}
              </Button>
              <Button size="sm" onClick={handleSavePreferences}>
                {t("cookies.save")}
              </Button>
            </div>

            <div className="border-t border-border/60 pt-3">
              <p className="text-xs text-muted-foreground">
                {t("cookies.more_info")}{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  {t("privacy.h1")}
                </Link>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
