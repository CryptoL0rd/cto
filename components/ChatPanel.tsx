'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { useChatWebSocket } from '@/lib/useWebSocket';
import { sendMessage } from '@/lib/api';
import type { Message } from '@/lib/types';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ChatPanelProps {
  gameId: string;
  playerId: string | null;
  className?: string;
}

export default function ChatPanel({ gameId, playerId, className }: ChatPanelProps) {
  const { messages, isLoading, error, isConnected } = useChatWebSocket(gameId);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!messageText.trim() || !playerId || isSending) {
      return;
    }

    const text = messageText.trim();
    setMessageText('');
    setIsSending(true);

    try {
      await sendMessage({
        game_id: gameId,
        player_id: playerId,
        text,
      });
    } catch (err) {
      console.error('Failed to send message:', err);
      // Restore message text on error
      setMessageText(text);
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = (message: Message) => {
    const isOwnMessage = message.player_id === playerId;
    const isSystemMessage = message.message_type === 'system';

    if (isSystemMessage) {
      return (
        <div key={message.id} className="flex justify-center my-2">
          <div className="bg-slate-800/50 px-3 py-1.5 rounded-full text-xs text-slate-400 border border-slate-700/50">
            {message.content}
          </div>
        </div>
      );
    }

    return (
      <div
        key={message.id}
        className={cn('flex mb-3', isOwnMessage ? 'justify-end' : 'justify-start')}
      >
        <div
          className={cn(
            'max-w-[80%] rounded-lg px-4 py-2 break-words',
            isOwnMessage
              ? 'bg-cosmic-600 text-white rounded-br-none'
              : 'bg-slate-700 text-slate-100 rounded-bl-none'
          )}
        >
          <p className="text-sm">{message.content}</p>
          <p className={cn('text-xs mt-1', isOwnMessage ? 'text-cosmic-200' : 'text-slate-400')}>
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn(
        'flex flex-col bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800/30">
        <h3 className="text-lg font-semibold text-slate-200">Chat</h3>
      </div>

      {/* Messages container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
        style={{ minHeight: '300px', maxHeight: '500px' }}
      >
        {error && (
          <div className="text-center text-sm text-nebula-400 py-4">Failed to load messages</div>
        )}

        {!error && messages.length === 0 && !isLoading && (
          <div className="text-center text-sm text-slate-500 py-8">
            No messages yet. Start the conversation!
          </div>
        )}

        {messages.map(renderMessage)}

        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <div className="px-4 py-3 border-t border-slate-700/50 bg-slate-800/30">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            disabled={isSending || !playerId}
            className={cn(
              'flex-1 bg-slate-900/50 backdrop-blur-sm border rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-cosmic-500/50 focus:border-cosmic-500',
              'border-slate-700/50',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!messageText.trim() || isSending || !playerId}
            className="px-4"
          >
            {isSending ? (
              <span>Sending...</span>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
