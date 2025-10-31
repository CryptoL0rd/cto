'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import Pusher from 'pusher-js';
import GameBoard3x3 from '@/components/GameBoard3x3';
import { useLocalPlayer } from '@/lib/hooks';
import InviteCodeDisplay from '@/components/InviteCodeDisplay';

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;

  const [gameState, setGameState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { playerId, isLoading: playerLoading } = useLocalPlayer();

  const pusherRef = useRef<Pusher | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to load game state (wrapped in useCallback for stable reference)
  const fetchGameState = useCallback(async () => {
    try {
      const response = await fetch(`/api/game/state?game_id=${gameId}`);

      if (!response.ok) {
        throw new Error('Game not found');
      }

      const data = await response.json();
      console.log('[Game] State updated:', data);
      setGameState(data);
      setError('');
      setLoading(false);
    } catch (err) {
      console.error('[Game] Failed to fetch state:', err);
      setError('Failed to load game');
      setLoading(false);
    }
  }, [gameId]);

  // Initial load
  useEffect(() => {
    fetchGameState();
  }, [fetchGameState]);

  // Setup Pusher for real-time updates
  useEffect(() => {
    if (!gameId) return;

    console.log('[Pusher] Setting up for game:', gameId);

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!pusherKey || !pusherCluster) {
      console.warn('[Pusher] Not configured, using polling only');
      return;
    }

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
    });

    pusherRef.current = pusher;

    const channel = pusher.subscribe(`game-${gameId}`);

    // Listen for player joined event
    channel.bind('player-joined', (data: any) => {
      console.log('[Pusher] Player joined:', data);
      setGameState((prevState: any) => ({
        ...prevState,
        game: data.game,
        players: data.game.players,
      }));

      // Show notification
      alert('Opponent connected! Game is starting...');
    });

    // Listen for move made event
    channel.bind('move-made', (data: any) => {
      console.log('[Pusher] Move made:', data);
      setGameState((prevState: any) => ({
        ...prevState,
        game: data.game,
        moves: data.moves || prevState.moves,
      }));
    });

    // Listen for game finished event
    channel.bind('game-finished', (data: any) => {
      console.log('[Pusher] Game finished:', data);
      setGameState((prevState: any) => ({
        ...prevState,
        game: data.game,
      }));
    });

    pusher.connection.bind('connected', () => {
      console.log('[Pusher] Connected');
    });

    pusher.connection.bind('error', (err: any) => {
      console.error('[Pusher] Connection error:', err);
    });

    return () => {
      console.log('[Pusher] Cleaning up');
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [gameId]);

  // Polling for waiting status (fallback if Pusher doesn't work)
  useEffect(() => {
    if (!gameState || gameState.game?.status !== 'waiting') {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    console.log('[Polling] Starting for waiting game');

    pollingIntervalRef.current = setInterval(() => {
      console.log('[Polling] Checking game status...');
      fetchGameState();
    }, 5000); // Every 5 seconds

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [gameState?.game?.status, fetchGameState]);

  if (loading || playerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-xl">Loading game...</p>
        </div>
      </div>
    );
  }

  if (error || !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-center space-y-4">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-xl">Error loading game</p>
          <p className="text-gray-400">{error || 'Unknown error'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all"
          >
            ← Back to home
          </button>
        </div>
      </div>
    );
  }

  const { game, players } = gameState;
  const myPlayer = players.find((p: any) => p.id === playerId);
  const opponent = players.find((p: any) => p.id !== playerId);
  const isMyTurn = game.current_turn === myPlayer?.player_number;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl w-full space-y-6">
        {/* Header */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Крестики-Нолики 3×3</h1>

            <div className="flex items-center justify-center gap-6 text-sm flex-wrap">
              <div>
                <span className="text-gray-400">Код: </span>
                <code className="text-cosmic-400 font-mono font-bold text-lg">
                  {game.invite_code}
                </code>
              </div>

              {myPlayer && (
                <div>
                  <span className="text-gray-400">Вы: </span>
                  <span className="text-white font-semibold">
                    {myPlayer.player_name} ({myPlayer.player_number === 1 ? 'X' : 'O'})
                  </span>
                </div>
              )}

              {opponent && (
                <div>
                  <span className="text-gray-400">Противник: </span>
                  <span className="text-white font-semibold">
                    {opponent.player_name} ({opponent.player_number === 1 ? 'X' : 'O'})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Game Status */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-12">
          <div className="text-center">
            {game.status === 'waiting' ? (
              <>
                <div className="text-6xl mb-4">⏳</div>
                <h2 className="text-2xl font-bold text-white mb-2">Waiting for opponent...</h2>
                <p className="text-gray-400 mb-4">
                  Share the code:{' '}
                  <span className="text-cosmic-400 font-mono font-bold">{game.invite_code}</span>
                </p>
                <div className="inline-block animate-pulse text-sm text-gray-500">
                  Checking for opponent...
                </div>
                {game.invite_code && (
                  <div className="mt-4">
                    <InviteCodeDisplay code={game.invite_code} />
                  </div>
                )}
              </>
            ) : game.status === 'active' ? (
              <>
                <div className="text-6xl mb-4">🎮</div>
                <h2 className="text-2xl font-bold text-white mb-2">Game is active!</h2>
                {isMyTurn ? (
                  <p className="text-green-400 font-semibold">🟢 Your turn</p>
                ) : (
                  <p className="text-gray-400">⏳ Opponent&apos;s turn</p>
                )}
                {playerId && (
                  <div className="mt-6">
                    <GameBoard3x3
                      gameState={gameState}
                      playerId={playerId}
                      onMoveComplete={fetchGameState}
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">🏁</div>
                <h2 className="text-2xl font-bold text-white">Game finished!</h2>
                {game.winner_id && (
                  <p className="text-galaxy-400 font-bold mt-2">
                    🏆{' '}
                    {game.winner_id === playerId
                      ? 'You won!'
                      : `${opponent?.player_name} won!`}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/')}
            className="flex-1 px-6 py-3 bg-slate-800/50 hover:bg-slate-700/70 text-white rounded-xl font-semibold transition-all"
          >
            ← На главную
          </button>
        </div>
      </div>
    </div>
  );
}
