import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AppProviders } from "./providers";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Cosmic Control Center",
    template: "%s | Cosmic Control Center",
  },
  description:
    "A cosmic-themed monorepo starter featuring Next.js 14, TailwindCSS, and FastAPI.",
  keywords: ["nextjs", "fastapi", "tailwind", "react query", "cosmic ui"],
  authors: [{ name: "Cosmic UI" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const year = new Date().getFullYear();

  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <AppProviders>
          <div className="relative flex min-h-screen flex-col overflow-hidden">
            <div
              aria-hidden="true"
              className="cosmic-grid pointer-events-none absolute inset-0 -z-10 opacity-30"
            />

            <header className="border-border/60 bg-background/70 border-b backdrop-blur-xl">
              <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                    Cosmic Stack
                  </span>
                  <h1 className="text-glow-sm text-2xl font-semibold">
                    Cosmic Control Center
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Next.js 14 · TailwindCSS · FastAPI · React Query
                  </p>
                </div>
                <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
                  <Input
                    placeholder="Search the galaxy..."
                    className="w-full min-w-[220px] sm:w-64"
                  />
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm">
                      Launch Console
                    </Button>
                    <Button variant="ghost" size="sm">
                      <span className="text-xs uppercase tracking-widest">
                        ⌘K
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </header>

            <main className="flex-1">
              <div className="mx-auto w-full max-w-6xl px-6 py-10">
                <Card className="border-border/40 bg-background/80 mb-10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Project status</CardTitle>
                    <CardDescription>
                      A reusable shell to surface global information across
                      pages.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap items-center gap-4 py-0">
                    <Button size="sm" variant="primary">
                      Initialize Database
                    </Button>
                    <Button size="sm" variant="ghost">
                      View API schema
                    </Button>
                  </CardContent>
                </Card>
                {children}
              </div>
            </main>

            <footer className="border-border/60 bg-background/70 border-t backdrop-blur-xl">
              <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <p>© {year} Cosmic UI Monorepo</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button asChild variant="ghost" size="sm">
                    <a
                      href="https://nextjs.org/docs"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Next.js Docs
                    </a>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <a
                      href="https://fastapi.tiangolo.com"
                      target="_blank"
                      rel="noreferrer"
                    >
                      FastAPI Docs
                    </a>
                  </Button>
                </div>
              </div>
            </footer>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
