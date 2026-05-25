'use client';

import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Message } from '@/types';
import { TypingIndicator } from './TypingIndicator';
import { DestinationCard } from './DestinationCard';
import { FlightCard } from './FlightCard';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: Message;
}

function renderContent(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export function ChatMessage({ message }: ChatMessageProps) {
  if (message.isLoading) {
    return <TypingIndicator />;
  }

  const isUser = message.role === 'user';
  const isError = message.type === 'error';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn('flex items-start gap-3', isUser && 'flex-row-reverse')}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
          isUser ? 'bg-surface-700 text-surface-200' : 'bg-brand-600 text-white'
        )}
      >
        {isUser ? 'T' : 'S'}
      </div>

      <div className={cn('flex flex-col gap-3 max-w-[80%]', isUser && 'items-end')}>
        {/* Bubble */}
        {message.content && (
          <div
            className={cn(
              'rounded-2xl px-4 py-3 text-sm leading-relaxed',
              isUser
                ? 'bg-brand-600 text-white rounded-tr-sm'
                : isError
                  ? 'bg-red-900/40 border border-red-800/50 text-red-300 rounded-tl-sm'
                  : 'bg-surface-800 border border-surface-700/50 text-surface-200 rounded-tl-sm prose-chat'
            )}
          >
            {isError && <AlertCircle className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />}
            {renderContent(message.content)}
          </div>
        )}

        {/* Destination Cards */}
        {message.recommendations && message.recommendations.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-2 max-w-full">
            {message.recommendations.map((dest) => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
          </div>
        )}

        {/* Flight Cards */}
        {message.flights && message.flights.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-2 max-w-full">
            {message.flights.map((flight) => (
              <FlightCard key={flight.flightNumber + flight.departureTime} flight={flight} />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-xs text-surface-600 px-1">
          {new Date(message.timestamp).toLocaleTimeString('es-PE', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </motion.div>
  );
}
