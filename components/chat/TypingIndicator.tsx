'use client';

import { useEffect, useState } from 'react';
import { LoadingDots } from '@/components/ui/LoadingDots';

const FLIGHT_MESSAGES = [
  '✈️ Buscando vuelos...',
  '🔍 Comparando precios y escalas...',
  '📅 Revisando disponibilidad...',
  '💺 Encontrando las mejores rutas...',
  '⚡ Casi listo...',
];

interface TypingIndicatorProps {
  variant?: 'thinking' | 'searching_flights';
}

export function TypingIndicator({ variant = 'thinking' }: TypingIndicatorProps) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (variant !== 'searching_flights') return;
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % FLIGHT_MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [variant]);

  return (
    <div className="flex items-start gap-3 animate-fade-in">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white">
        S
      </div>

      {variant === 'searching_flights' ? (
        <div className="bg-surface-800 border border-surface-700/50 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-3 min-w-[220px]">
          <LoadingDots />
          <span key={msgIndex} className="text-sm text-surface-300 animate-fade-in">
            {FLIGHT_MESSAGES[msgIndex]}
          </span>
        </div>
      ) : (
        <div className="bg-surface-800 border border-surface-700/50 rounded-2xl rounded-tl-sm px-4 py-3">
          <LoadingDots />
        </div>
      )}
    </div>
  );
}
