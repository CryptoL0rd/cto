'use client';

import { useParams, useRouter } from 'next/navigation';
import GameBoard3x3 from '@/components/GameBoard3x3';
import { useLocalPlayer } from '@/lib/hooks';
import { useGameStateWebSocket } from '@/lib/useWebSocket';
import InviteCodeDisplay from '@/components/InviteCodeDisplay';

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;

  const { playerId, isLoading: playerLoading } = useLocalPlayer();
  const {
    gameState,
    isLoading: gameLoading,
    error,
    refetch,
    isConnected,
  } = useGameStateWebSocket(gameId, playerId);

  if (playerLoading || gameLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-xl">Загрузка игры...</p>
        </div>
      </div>
    );
  }

  if (error || !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-center space-y-4">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-xl">Ошибка загрузки игры</p>
          <p className="text-gray-400">{error?.message || 'Неизвестная ошибка'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all"
          >
            ← На главную
          </button>
        </div>
      </div>
    );
  }

  const { game, players } = gameState;
  const isWaiting = game.status === 'waiting';
  const isActive = game.status === 'active';
  const isFinished = game.status === 'completed' || game.status === 'abandoned';

  // Get current player info
  const currentPlayer = players.find((p) => p.id === playerId);
  const opponent = players.find((p) => p.id !== playerId);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl w-full space-y-6">
        {/* Header */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Крестики-Нолики 3×3</h1>

            <div className="flex items-center justify-center gap-6 text-sm flex-wrap">
              {game.invite_code && (
                <div>
                  <span className="text-gray-400">Код: </span>
                  <code className="text-cosmic-400 font-mono font-bold">{game.invite_code}</code>
                </div>
              )}

              {currentPlayer && (
                <div>
                  <span className="text-gray-400">Вы: </span>
                  <span
                    className={`font-bold ${
                      currentPlayer.player_number === 1 ? 'text-cosmic-400' : 'text-nebula-400'
                    }`}
                  >
                    {currentPlayer.player_name} ({currentPlayer.player_number === 1 ? 'X' : 'O'})
                  </span>
                </div>
              )}

              {opponent && (
                <div>
                  <span className="text-gray-400">Противник: </span>
                  <span
                    className={`font-bold ${
                      opponent.player_number === 1 ? 'text-cosmic-400' : 'text-nebula-400'
                    }`}
                  >
                    {opponent.player_name} ({opponent.player_number === 1 ? 'X' : 'O'})
                  </span>
                </div>
              )}

              {game.winner_id && (
                <div className="text-galaxy-400 font-bold">
                  🏆{' '}
                  {game.winner_id === playerId
                    ? 'Вы победили!'
                    : `${opponent?.player_name} победил!`}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
          {isWaiting ? (
            <div className="text-center py-16 space-y-4">
              <div className="text-6xl mb-4">⏳</div>
              <h2 className="text-2xl font-bold text-white">Ожидание второго игрока...</h2>
              <p className="text-gray-400">Поделитесь кодом приглашения с другом</p>
              {game.invite_code && (
                <div className="mt-4">
                  <InviteCodeDisplay code={game.invite_code} />
                </div>
              )}
            </div>
          ) : (isActive || isFinished) && playerId ? (
            <GameBoard3x3 gameState={gameState} playerId={playerId} onMoveComplete={refetch} />
          ) : (
            <div className="text-center py-16 text-gray-400">
              <div className="text-6xl mb-4">❓</div>
              <p>Невозможно загрузить игру</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/')}
            className="flex-1 px-6 py-3 bg-slate-800/50 hover:bg-slate-700/70 text-white rounded-xl font-semibold transition-all"
          >
            ← На главную
          </button>
          {isFinished && (
            <button
              onClick={() => router.push('/')}
              className="flex-1 px-6 py-3 bg-cosmic-600 hover:bg-cosmic-700 text-white rounded-xl font-semibold transition-all"
            >
              Новая игра
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
