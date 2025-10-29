import CosmicButton from "@/components/CosmicButton";

export default function Home() {
  return (
    <div className="min-h-screen bg-starfield-gradient">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-6 gradient-text">
            Welcome to the Cosmic Monorepo
          </h1>
          <p className="text-xl mb-8 text-slate-300">
            A Next.js 14 + FastAPI monorepo with a beautiful cosmic theme
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="card-cosmic">
              <h3 className="text-2xl mb-3 text-cosmic-600 dark:text-cosmic-400">
                ⚡ Next.js 14
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Modern React framework with App Router and TypeScript
              </p>
            </div>

            <div className="card-cosmic">
              <h3 className="text-2xl mb-3 text-galaxy-600 dark:text-galaxy-400">
                🐍 FastAPI
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                High-performance Python backend with Pydantic validation
              </p>
            </div>

            <div className="card-cosmic">
              <h3 className="text-2xl mb-3 text-nebula-600 dark:text-nebula-400">
                🎨 Cosmic Theme
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Beautiful gradients and custom color palettes
              </p>
            </div>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <CosmicButton variant="cosmic">Get Started</CosmicButton>
            <CosmicButton variant="galaxy">View Docs</CosmicButton>
          </div>

          <div className="mt-16 card-cosmic text-left">
            <h2 className="text-3xl font-bold mb-4">Quick Start</h2>
            <div className="space-y-4 text-slate-600 dark:text-slate-300">
              <div>
                <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">
                  1. Install dependencies
                </h3>
                <code className="block bg-slate-100 dark:bg-slate-900 p-3 rounded">
                  npm install
                </code>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">
                  2. Start development server
                </h3>
                <code className="block bg-slate-100 dark:bg-slate-900 p-3 rounded">
                  npm run dev
                </code>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">
                  3. Edit this page
                </h3>
                <code className="block bg-slate-100 dark:bg-slate-900 p-3 rounded">
                  app/page.tsx
                </code>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-8 text-slate-400">
        <p>Built with 💜 using Next.js and FastAPI</p>
      </footer>
    </div>
  );
}
