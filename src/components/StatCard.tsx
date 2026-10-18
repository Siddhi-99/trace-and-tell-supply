import type { LucideIcon } from "lucide-react";

export function StatCard({ label, value, icon: Icon, tone, loading }: {
  label: string; value: number; icon: LucideIcon; tone: string; loading?: boolean;
}) {
  return (
    <div className="card p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className={`grid h-9 w-9 place-items-center rounded-lg ${tone}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      {loading ? <div className="skeleton mt-3 h-8 w-16" /> : <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>}
    </div>
  );
}
