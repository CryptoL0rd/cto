import { PlaceholderCard } from '@/components/PlaceholderCard';

export default function Home() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
            Welcome to the Monorepo
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Next.js 14 with TypeScript, TailwindCSS, and Python API support
          </p>
        </header>

        <main className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <PlaceholderCard />
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm uppercase tracking-wide text-muted-foreground">Feature</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">TypeScript Strict</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Full type safety with strict mode enabled for better code quality.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm uppercase tracking-wide text-muted-foreground">Styling</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">Dark Theme</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Custom TailwindCSS theme with dark mode support via CSS variables.
            </p>
          </div>
        </main>

        <footer className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Run <code className="rounded bg-muted px-2 py-1 font-mono text-xs">npm run dev</code> to
            start developing
          </p>
        </footer>
      </div>
    </div>
  );
}
