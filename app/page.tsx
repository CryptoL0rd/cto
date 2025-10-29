import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="space-y-4 text-center">
        <h2 className="text-glow-md bg-gradient-to-r from-[#8e66ff] via-[#ff6fd8] to-[#4facfe] bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
          Welcome to Cosmic
        </h2>
        <p className="mx-auto max-w-2xl text-base text-muted-foreground">
          A cosmic-themed full-stack monorepo built with Next.js 14, TypeScript,
          TailwindCSS, and FastAPI
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Frontend Stack</CardTitle>
            <CardDescription>
              Modern React with App Router and Tailwind
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>Next.js 14 with App Router</li>
              <li>TypeScript strict mode</li>
              <li>TailwindCSS v4 with cosmic theme</li>
              <li>React Query for data fetching</li>
              <li>Radix UI primitives</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Backend Stack</CardTitle>
            <CardDescription>Python FastAPI with async SQLite</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>FastAPI with Pydantic v2</li>
              <li>Async SQLite via aiosqlite</li>
              <li>Python 3.11+ runtime</li>
              <li>Deployed on Vercel</li>
              <li>Environment-based config</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>UI Components Demo</CardTitle>
          <CardDescription>
            Custom-designed UI primitives with the cosmic theme
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Buttons</h4>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="primary" size="sm">
                Small
              </Button>
              <Button variant="secondary" size="lg">
                Large
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Input</h4>
            <Input placeholder="Enter your cosmic message..." />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          Get started by editing{" "}
          <code className="rounded bg-muted px-2 py-1 font-mono text-xs text-foreground">
            app/page.tsx
          </code>
        </p>
      </div>
    </div>
  );
}
