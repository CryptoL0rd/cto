'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Error Boundary]', error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-red-400 mb-4">Что-то пошло не так</h1>
        <p className="text-gray-400 mb-6">{error.message || 'Произошла неожиданная ошибка'}</p>
        <div className="flex gap-4">
          <Button onClick={reset} className="flex-1">
            Попробовать снова
          </Button>
          <Button
            variant="secondary"
            onClick={() => (window.location.href = '/')}
            className="flex-1"
          >
            На главную
          </Button>
        </div>
      </Card>
    </main>
  );
}
