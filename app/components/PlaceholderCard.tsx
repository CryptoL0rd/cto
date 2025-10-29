export function PlaceholderCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <p className="text-sm uppercase tracking-wide text-muted-foreground">Placeholder</p>
      <h2 className="mt-2 text-xl font-semibold text-foreground">Reusable Component</h2>
      <p className="mt-3 text-sm text-muted-foreground">
        Build shared UI primitives inside <code className="font-mono">@/components</code> and import
        them throughout the application.
      </p>
    </div>
  );
}
