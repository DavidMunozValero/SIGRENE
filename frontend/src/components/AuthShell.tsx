import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { CookieBanner } from "./CookieBanner";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden pb-24 lg:pb-28">
      {/* Aquatic backdrop */}
      <div className="absolute inset-0 bg-gradient-deep" />
      <div className="absolute inset-0 opacity-40 animate-ripple"
        style={{
          backgroundImage:
            "radial-gradient(50% 30% at 20% 20%, oklch(0.78 0.14 195 / 0.5), transparent 60%), radial-gradient(40% 30% at 80% 70%, oklch(0.85 0.1 190 / 0.4), transparent 60%)",
        }}
      />
      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="px-6 pt-6">
          <Logo variant="light" />
        </div>
        <div className="flex flex-1 items-center justify-center px-4 py-10">
          <div className="w-full max-w-md">
            <div className="glass rounded-3xl p-8 shadow-elevated">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
              {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
              <div className="mt-6">{children}</div>
            </div>
            {footer && <div className="mt-6 text-center text-sm text-white/80">{footer}</div>}
          </div>
        </div>
        <div className="px-6 pb-6 text-center text-xs text-white/60">
          <Link to="/" className="hover:text-white transition-colors">← Volver a la web</Link>
        </div>
      </div>
      <CookieBanner />
    </div>
  );
}
