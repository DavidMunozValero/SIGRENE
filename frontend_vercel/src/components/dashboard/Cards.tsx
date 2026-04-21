export function StatCard({
  label,
  value,
  delta,
  icon,
}: {
  label: string;
  value: string;
  delta?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-card p-5 shadow-glass border border-border/60 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-glow opacity-60" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
          {delta && <p className="mt-1 text-xs text-primary font-medium">{delta}</p>}
        </div>
        {icon && (
          <div className="h-10 w-10 rounded-xl bg-gradient-water grid place-items-center text-white shadow-aqua">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export function SectionCard({
  title,
  description,
  action,
  children,
}: {
  title: React.ReactNode;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-card border border-border/60 shadow-glass overflow-hidden">
      <div className="flex items-center justify-between gap-4 p-5 border-b border-border/60">
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && <p className="mt-1 text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
