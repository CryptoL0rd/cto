import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Крестики-Нолики / Гомоку',
  description: 'Multiplayer Tic-Tac-Toe and Gomoku game with cosmic design',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-cosmic-gradient min-h-screen">{children}</body>
    </html>
  );
}
