'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Modal, { ModalHeader, ModalTitle, ModalContent } from '@/components/ui/Modal';

type GameMode = 'classic3' | 'gomoku';

export default function Home() {
  const router = useRouter();
  const [showModeModal, setShowModeModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateGame = async (mode: GameMode) => {
    setLoading(true);
    setError('');
    
    console.log('[CREATE GAME] Starting with mode:', mode);
    
    try {
      // Generate a random player name
      const playerName = `Игрок-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const url = '/api/game/create';
      console.log('[CREATE GAME] Fetching:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mode,
          player_name: playerName,
          is_ai_opponent: false
        }),
      });

      console.log('[CREATE GAME] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[CREATE GAME] Error response:', errorText);
        throw new Error('Failed to create game');
      }

      const data = await response.json();
      console.log('[CREATE GAME] Success:', data);
      
      if (data.player_id) {
        localStorage.setItem('player_id', data.player_id);
      }
      
      if (data.invite_code) {
        localStorage.setItem(`invite_code_${data.game.id}`, data.invite_code);
      }
      
      router.push(`/game/${data.game.id}`);
    } catch (err) {
      console.error('[CREATE GAME] Exception:', err);
      setError('Не удалось создать игру. Попробуйте снова.');
      setLoading(false);
    }
  };

  const handleJoinGame = async () => {
    if (!inviteCode.trim()) {
      setError('Введите код приглашения');
      return;
    }

    setLoading(true);
    setError('');

    console.log('[JOIN GAME] Starting with code:', inviteCode);

    try {
      // Generate a random player name
      const playerName = `Игрок-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const url = '/api/game/join';
      console.log('[JOIN GAME] Fetching:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          invite_code: inviteCode.toUpperCase(),
          player_name: playerName
        }),
      });

      console.log('[JOIN GAME] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[JOIN GAME] Error response:', errorText);
        if (response.status === 404) throw new Error('Игра не найдена');
        if (response.status === 409) throw new Error('Игра уже заполнена');
        throw new Error('Failed to join game');
      }

      const data = await response.json();
      console.log('[JOIN GAME] Success:', data);
      localStorage.setItem('player_id', data.player.id);
      router.push(`/game/${data.game_id}`);
    } catch (err) {
      console.error('[JOIN GAME] Exception:', err);
      setError(err instanceof Error ? err.message : 'Не удалось подключиться');
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-4">
            Крестики-Нолики
          </h1>
          <p className="text-xl text-gray-400">/ Гомоку</p>
        </div>

        <p className="text-gray-300 mb-8">
          Сыграйте в классические крестики-нолики 3×3 или в Гомоку (5 в ряд) на бесконечном поле
        </p>

        <div className="space-y-4">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => setShowModeModal(true)}
            disabled={loading}
          >
            🎮 Создать игру
          </Button>

          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => setShowJoinModal(true)}
            disabled={loading}
          >
            🔗 Подключиться
          </Button>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="grid grid-cols-3 gap-4 text-sm text-gray-400">
            <div>
              <div className="text-2xl mb-2">⚡</div>
              <div>Быстрый старт</div>
            </div>
            <div>
              <div className="text-2xl mb-2">💬</div>
              <div>Встроенный чат</div>
            </div>
            <div>
              <div className="text-2xl mb-2">🌌</div>
              <div>Космический дизайн</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Mode Selection Modal */}
      <Modal
        isOpen={showModeModal}
        onClose={() => {
          setShowModeModal(false);
          setError('');
        }}
      >
        <ModalHeader>
          <ModalTitle>Выберите режим игры</ModalTitle>
        </ModalHeader>
        <ModalContent>
          <div className="space-y-4">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => {
                setShowModeModal(false);
                handleCreateGame('classic3');
              }}
              disabled={loading}
            >
              <div className="text-left w-full">
                <div className="font-bold text-lg">Classic 3×3</div>
                <div className="text-sm opacity-80">Классические крестики-нолики</div>
              </div>
            </Button>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => {
                setShowModeModal(false);
                handleCreateGame('gomoku');
              }}
              disabled={loading}
            >
              <div className="text-left w-full">
                <div className="font-bold text-lg">Gomoku 5 в ряд</div>
                <div className="text-sm opacity-80">Бесконечное поле, 5 в линию</div>
              </div>
            </Button>

            {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
          </div>
        </ModalContent>
      </Modal>

      {/* Join Game Modal */}
      <Modal
        isOpen={showJoinModal}
        onClose={() => {
          setShowJoinModal(false);
          setInviteCode('');
          setError('');
        }}
      >
        <ModalHeader>
          <ModalTitle>Подключиться к игре</ModalTitle>
        </ModalHeader>
        <ModalContent>
          <div className="space-y-4">
            <Input
              label="Код приглашения"
              placeholder="Введите код (например, ABC123)"
              value={inviteCode}
              onChange={(e) => {
                setInviteCode(e.target.value.toUpperCase());
                setError('');
              }}
              maxLength={6}
              error={error}
            />

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleJoinGame}
              disabled={loading || !inviteCode.trim()}
            >
              {loading ? 'Подключение...' : 'Подключиться'}
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </main>
  );
}
