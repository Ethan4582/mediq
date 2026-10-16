"use client";

interface SettingsShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
  badge?: React.ReactNode;
}

export default function SettingsShell({
  title,
  description,
  children,
  badge,
}: SettingsShellProps) {
  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-muted/15">
      <div className="max-w-4xl mx-auto w-full py-10 px-6 sm:px-8 space-y-6">
        {/* Uniform Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-border/60">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          {badge && <div className="flex items-center gap-2 self-start sm:self-auto">{badge}</div>}
        </div>

        {/* Content Body */}
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}
