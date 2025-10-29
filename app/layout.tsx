import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Cosmic Tic-Tac-Toe",
  description:
    "Challenge your friends in classic 3×3 or Gomoku 5-in-a-row. Experience the cosmic battlefield with stunning visuals and modern gameplay.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-starfield-gradient`}
      >
        <div className="starfield" aria-hidden="true" />
        <div className="relative z-10">
          <ToastProvider>{children}</ToastProvider>
        </div>
      </body>
    </html>
  );
}
