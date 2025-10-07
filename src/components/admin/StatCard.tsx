"use client";

export default function StatCard({ title, value, hint, delta }: { title: string; value: string | number; hint?: string; delta?: { value: string; positive?: boolean } }) {
  return (
    <div className="rounded-lg border p-4 bg-background/60">
      <div className="text-sm text-muted-foreground mb-1 flex items-center justify-between">
        <span>{title}</span>
        {delta && (
          <span className={`text-[11px] px-2 py-0.5 rounded-full ${delta.positive ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}`}>{delta.value}</span>
        )}
      </div>
      <div className="text-2xl font-semibold tracking-tight">{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}


