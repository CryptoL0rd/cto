"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card, {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import InviteCodeDisplay from "@/components/InviteCodeDisplay";
import { useState } from "react";

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  const handleValidation = () => {
    if (!inputValue) {
      setError("This field is required");
    } else if (inputValue.length < 3) {
      setError("Must be at least 3 characters");
    } else {
      setError("");
    }
  };

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold mb-6 gradient-text animate-float">
              Cosmic UI Kit
            </h1>
            <p className="text-xl text-slate-300">
              A comprehensive collection of reusable components with a stunning cosmic theme
            </p>
          </div>

          <div className="space-y-12">
            <section>
              <h2 className="text-3xl font-bold mb-6 text-cosmic-400">
                Buttons
              </h2>
              <Card>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-slate-300">
                      Variants
                    </h3>
                    <div className="flex flex-wrap gap-4">
                      <Button variant="primary">Primary Button</Button>
                      <Button variant="secondary">Secondary Button</Button>
                      <Button variant="outline">Outline Button</Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-slate-300">
                      Sizes
                    </h3>
                    <div className="flex flex-wrap items-center gap-4">
                      <Button size="sm">Small</Button>
                      <Button size="md">Medium</Button>
                      <Button size="lg">Large</Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-slate-300">
                      States
                    </h3>
                    <div className="flex flex-wrap gap-4">
                      <Button>Normal</Button>
                      <Button disabled>Disabled</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 text-cosmic-400">
                Input Fields
              </h2>
              <Card>
                <CardContent className="space-y-6">
                  <Input
                    label="Username"
                    placeholder="Enter your username"
                    helperText="Choose a unique username"
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="your@email.com"
                  />
                  <Input
                    label="Validation Example"
                    placeholder="Type at least 3 characters"
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      if (error) handleValidation();
                    }}
                    onBlur={handleValidation}
                    error={error}
                  />
                  <Input
                    label="Disabled Input"
                    placeholder="This is disabled"
                    disabled
                  />
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 text-cosmic-400">Cards</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Card</CardTitle>
                    <CardDescription>
                      A simple card with header and content
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">
                      This is a basic card component with glassmorphism styling
                      and backdrop blur effects.
                    </p>
                  </CardContent>
                </Card>

                <Card hoverable glowOnHover>
                  <CardHeader>
                    <CardTitle>Hoverable Card</CardTitle>
                    <CardDescription>Hover to see the glow effect</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">
                      This card has enhanced hover effects with cosmic glow.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Card with Footer</CardTitle>
                    <CardDescription>
                      Cards can have footers too
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">
                      Card content goes here with optional footer actions.
                    </p>
                  </CardContent>
                  <CardFooter className="justify-end gap-2">
                    <Button variant="outline" size="sm">
                      Cancel
                    </Button>
                    <Button size="sm">Confirm</Button>
                  </CardFooter>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 text-cosmic-400">
                Invite Code Display
              </h2>
              <div className="flex justify-center">
                <InviteCodeDisplay code="ABC-1234-XYZ" />
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 text-cosmic-400">
                Theme Colors
              </h2>
              <Card>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-slate-300">
                      Cosmic Palette
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      <div className="w-16 h-16 rounded bg-cosmic-500 flex items-center justify-center text-xs text-white">
                        500
                      </div>
                      <div className="w-16 h-16 rounded bg-cosmic-600 flex items-center justify-center text-xs text-white">
                        600
                      </div>
                      <div className="w-16 h-16 rounded bg-cosmic-700 flex items-center justify-center text-xs text-white">
                        700
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-slate-300">
                      Galaxy Palette
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      <div className="w-16 h-16 rounded bg-galaxy-500 flex items-center justify-center text-xs text-white">
                        500
                      </div>
                      <div className="w-16 h-16 rounded bg-galaxy-600 flex items-center justify-center text-xs text-white">
                        600
                      </div>
                      <div className="w-16 h-16 rounded bg-galaxy-700 flex items-center justify-center text-xs text-white">
                        700
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-slate-300">
                      Nebula Palette
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      <div className="w-16 h-16 rounded bg-nebula-500 flex items-center justify-center text-xs text-white">
                        500
                      </div>
                      <div className="w-16 h-16 rounded bg-nebula-600 flex items-center justify-center text-xs text-white">
                        600
                      </div>
                      <div className="w-16 h-16 rounded bg-nebula-700 flex items-center justify-center text-xs text-white">
                        700
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 text-cosmic-400">
                Animations
              </h2>
              <Card>
                <CardContent>
                  <div className="flex flex-wrap gap-6 items-center justify-center py-8">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-cosmic-gradient rounded-lg animate-pulse-glow mb-2"></div>
                      <p className="text-sm text-slate-400">Pulse Glow</p>
                    </div>
                    <div className="text-center">
                      <div className="w-24 h-24 bg-galaxy-gradient rounded-lg animate-float mb-2"></div>
                      <p className="text-sm text-slate-400">Float</p>
                    </div>
                    <div className="text-center">
                      <div className="w-24 h-24 bg-nebula-gradient rounded-lg animate-spin mb-2"></div>
                      <p className="text-sm text-slate-400">Spin</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </main>

      <footer className="text-center py-8 text-slate-400 border-t border-slate-800/50 mt-16">
        <p>Built with 💜 using Next.js and Tailwind CSS</p>
      </footer>
    </div>
  );
}
