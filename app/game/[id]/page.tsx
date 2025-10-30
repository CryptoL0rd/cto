'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;
  
  const [game, setGame] = useState<any>(null);

  useEffect(() => {
    console.log('[Game Page] Loaded with ID:', gameId);
    
    // Загрузить из localStorage
    const stored = localStorage.getItem(`game_${gameId}`);
    if (stored) {
      try {
        const gameData = JSON.parse(stored);
        console.log('[Game Page] Game data:', gameData);
        setGame(gameData);
      } catch (e) {
        console.error('[Game Page] Parse error:', e);
      }
    } else {
      console.log('[Game Page] No game in localStorage');
    }
  }, [gameId]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-4xl w-full space-y-6">
        {/* Header */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              🎮 Игра
            </h1>
            
            {game ? (
              <div className="space-y-4">
                <div className="text-gray-300">
                  <p className="text-sm text-gray-400 mb-2">Код приглашения:</p>
                  <code className="text-2xl font-mono font-bold text-purple-400 bg-purple-500/20 px-4 py-2 rounded-lg inline-block">
                    {game.invite_code}
                  </code>
                </div>
                
                <div className="flex items-center justify-center gap-4 text-sm">
                  <div className="bg-white/5 px-4 py-2 rounded-lg">
                    <span className="text-gray-400">Режим: </span>
                    <span className="text-white font-semibold">
                      {game.mode === 'classic3' ? '3×3' : 'Гомоку'}
                    </span>
                  </div>
                  
                  <div className="bg-white/5 px-4 py-2 rounded-lg">
                    <span className="text-gray-400">Статус: </span>
                    <span className="text-green-400 font-semibold">
                      {game.status === 'waiting' ? 'Ожидание' : 'Игра'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-400">
                <p>Загрузка игры...</p>
                <p className="text-sm mt-2">ID: {gameId}</p>
              </div>
            )}
          </div>
        </div>

        {/* Game Board Placeholder */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12">
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-white">
              Игровое поле
            </h2>
            <p className="text-gray-400">
              Здесь будет доска для игры
            </p>
            {game && (
              <p className="text-sm text-gray-500">
                Следующий ход: <span className="text-purple-400 font-bold">{game.next_turn || 'X'}</span>
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/')}
            className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all"
          >
            ← Выйти
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all"
          >
            🔄 Обновить
          </button>
        </div>
      </div>
    </div>
  );
}
