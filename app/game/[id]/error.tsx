'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Game Page Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
        <h1 className="text-3xl font-bold text-red-400 mb-4">
          Ошибка загрузки игры
        </h1>
        <p className="text-gray-300 mb-6">
          {error.message || 'Произошла неожиданная ошибка'}
        </p>
        <div className="flex gap-4">
          <button
            onClick={reset}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            Попробовать снова
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg"
          >
            На главную
          </button>
        </div>
      </div>
    </div>
  );
}
