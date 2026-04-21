import { Link } from "@tanstack/react-router";

export function Logo({ variant = "default" }: { variant?: "default" | "light" }) {
  const text = variant === "light" ? "text-white" : "text-foreground";
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-water shadow-aqua">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2" />
          <path d="M2 17c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2" />
          <path d="M2 7c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2" opacity="0.6" />
        </svg>
        <span className="absolute inset-0 rounded-xl bg-gradient-glow opacity-60 group-hover:opacity-100 transition-opacity" />
      </span>
      <span className={`font-bold text-lg tracking-tight ${text}`}>
        SIGRENE
      </span>
    </Link>
  );
}
