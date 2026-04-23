import { useLanguage } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setLang("es")}
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
          lang === "es"
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
        title="Español"
      >
        <svg viewBox="0 0 24 16" className="h-4 w-6">
          <rect width="24" height="16" fill="#c60b1e" />
          <rect y="5" width="24" height="6" fill="#ffc400" />
        </svg>
        <span className="hidden sm:inline">ES</span>
      </button>
      <button
        onClick={() => setLang("en")}
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
          lang === "en"
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
        title="English"
      >
        <svg viewBox="0 0 24 16" className="h-4 w-6">
          <rect width="24" height="16" fill="#fff" />
          <rect y="6" width="24" height="4" fill="#C8102E" />
          <rect x="10" width="4" height="16" fill="#C8102E" />
          <rect width="24" height="16" fill="#012169" />
          <path d="M0,0 L24,16 M24,0 L0,16" stroke="#fff" strokeWidth="4.5" />
          <path d="M0,0 L24,16 M24,0 L0,16" stroke="#C8102E" strokeWidth="3" />
          <rect x="10" width="4" height="16" fill="#fff" />
          <rect y="6" width="24" height="4" fill="#fff" />
        </svg>
        <span className="hidden sm:inline">EN</span>
      </button>
    </div>
  );
}
