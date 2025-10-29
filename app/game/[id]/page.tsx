'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGameState, useLocalPlayer } from '@/lib/hooks';
import GameBoard3x3 from '@/components/GameBoard3x3';
import GameBoardGomoku from '@/components/GameBoardGomoku';
import ChatPanel from '@/components/ChatPanel';
import InviteCodeDisplay from '@/components/InviteCodeDisplay';
import { cn } from '@/lib/utils';

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;
  const { playerId, isLoading: isLoadingPlayer } = useLocalPlayer();
  const { gameState, isLoading, error, refetch } = useGameState(gameId);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  // Fetch invite code from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storedCode = localStorage.getItem(`invite_code_${gameId}`);
      setInviteCode(storedCode);
    } catch (err) {
      console.error('Failed to load invite code:', err);
    }
  }, [gameId]);

  // Redirect to home if game not found
  useEffect(() => {
    if (error && error.message.includes('404')) {
      router.push('/');
    }
  }, [error, router]);

  // Show loading state
  if (isLoading || isLoadingPlayer || !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cosmic-500 mx-auto"></div>
          <p className="text-slate-400">Loading game...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-4xl">❌</div>
          <h2 className="text-2xl font-bold text-slate-200">Failed to Load Game</h2>
          <p className="text-slate-400">{error.message}</p>
          <button
            onClick={() => router.push('/')}
            className="text-cosmic-400 hover:text-cosmic-300 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const { game, players } = gameState;
  const isWaiting = game.status === 'waiting';
  const isActive = game.status === 'active';
  const isCompleted = game.status === 'completed';
  const isAbandoned = game.status === 'abandoned';

  const currentPlayer = players.find((p) => p.player_number === game.current_turn);
  const opponentPlayer = players.find((p) => p.id !== playerId);
  const isMyTurn = currentPlayer?.id === playerId;

  const getGameStatus = () => {
    if (isWaiting) {
      return {
        text: 'Waiting for opponent...',
        color: 'text-galaxy-400',
        icon: '⏳',
      };
    }

    if (isAbandoned) {
      return {
        text: 'Game Abandoned',
        color: 'text-slate-400',
        icon: '👋',
      };
    }

    if (isCompleted) {
      if (game.winner_id === playerId) {
        return {
          text: 'Victory! 🎉',
          color: 'text-cosmic-400 drop-shadow-glow-cosmic',
          icon: '🏆',
        };
      } else if (game.winner_id === null) {
        return {
          text: 'Draw',
          color: 'text-galaxy-400',
          icon: '🤝',
        };
      } else {
        return {
          text: 'Defeat',
          color: 'text-nebula-400',
          icon: '😔',
        };
      }
    }

    if (isActive) {
      return {
        text: 'In Progress',
        color: 'text-cosmic-400',
        icon: '🎮',
      };
    }

    return {
      text: 'Unknown',
      color: 'text-slate-400',
      icon: '❓',
    };
  };

  const status = getGameStatus();

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Left section - Game info */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="text-slate-400 hover:text-cosmic-400 transition-colors"
                aria-label="Back to home"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-200">
                  {game.mode === 'classic3' ? 'Classic 3×3' : 'Gomoku 5-in-a-row'}
                </h1>
                <p className={cn('text-sm font-semibold', status.color)}>
                  {status.icon} {status.text}
                </p>
              </div>
            </div>

            {/* Center section - Turn indicator */}
            {isActive && (
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'px-4 py-2 rounded-lg border transition-all duration-300',
                    isMyTurn
                      ? 'bg-cosmic-600/20 border-cosmic-500 animate-pulse-subtle'
                      : 'bg-slate-800/50 border-slate-700'
                  )}
                >
                  <p className="text-sm font-medium">
                    {isMyTurn ? (
                      <span className="text-cosmic-400">Your Turn</span>
                    ) : (
                      <span className="text-slate-400">
                        {opponentPlayer?.player_name || 'Opponent'}&apos;s Turn
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Right section - Invite code (only show when waiting) */}
            {isWaiting && inviteCode && (
              <div className="flex items-center gap-2">
                <div className="text-sm text-slate-400">Invite Code:</div>
                <code className="px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded text-cosmic-400 font-mono font-bold">
                  {inviteCode}
                </code>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Game board section */}
          <div className="flex-1 flex flex-col items-center">
            {/* Player info */}
            <div className="w-full max-w-2xl mb-6 grid grid-cols-2 gap-4">
              {/* Player 1 */}
              <div
                className={cn(
                  'p-4 rounded-lg border transition-all',
                  players[0]?.id === playerId
                    ? 'bg-cosmic-600/10 border-cosmic-500/50'
                    : 'bg-slate-800/30 border-slate-700/50'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cosmic-600 flex items-center justify-center text-white font-bold">
                    X
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {players[0]?.player_name || 'Player 1'}
                    </p>
                    {players[0]?.id === playerId && (
                      <p className="text-xs text-cosmic-400">(You)</p>
                    )}
                  </div>
                  {currentPlayer?.player_number === 1 && isActive && (
                    <div className="w-2 h-2 rounded-full bg-cosmic-400 animate-pulse"></div>
                  )}
                </div>
              </div>

              {/* Player 2 */}
              <div
                className={cn(
                  'p-4 rounded-lg border transition-all',
                  players[1]?.id === playerId
                    ? 'bg-nebula-600/10 border-nebula-500/50'
                    : 'bg-slate-800/30 border-slate-700/50'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-nebula-600 flex items-center justify-center text-white font-bold">
                    O
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {players[1]?.player_name || 'Waiting...'}
                    </p>
                    {players[1]?.id === playerId && (
                      <p className="text-xs text-nebula-400">(You)</p>
                    )}
                  </div>
                  {currentPlayer?.player_number === 2 && isActive && (
                    <div className="w-2 h-2 rounded-full bg-nebula-400 animate-pulse"></div>
                  )}
                </div>
              </div>
            </div>

            {/* Game Board */}
            <div className="w-full max-w-2xl">
              {game.mode === 'classic3' ? (
                <GameBoard3x3 gameState={gameState} playerId={playerId} onMoveComplete={refetch} />
              ) : (
                <GameBoardGomoku
                  gameState={gameState}
                  playerId={playerId}
                  onMoveComplete={refetch}
                />
              )}
            </div>

            {/* Show invite code display when waiting (mobile friendly) */}
            {isWaiting && inviteCode && (
              <div className="w-full max-w-md mt-8 lg:hidden">
                <InviteCodeDisplay code={inviteCode} />
              </div>
            )}
          </div>

          {/* Chat panel section - Desktop */}
          <div className="hidden lg:block w-96">
            <ChatPanel gameId={gameId} playerId={playerId} className="h-[600px]" />
          </div>

          {/* Chat panel section - Mobile (collapsible) */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="w-full mb-4 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg flex items-center justify-between hover:bg-slate-700/50 transition-colors"
            >
              <span className="text-slate-200 font-semibold">Chat</span>
              <svg
                className={cn(
                  'w-5 h-5 text-slate-400 transition-transform',
                  isChatOpen ? 'rotate-180' : ''
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isChatOpen && <ChatPanel gameId={gameId} playerId={playerId} className="h-[500px]" />}
          </div>
        </div>
      </main>
    </div>
  );
}
