'use client';

import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Escribe tu destino o preferencias...',
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [value]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="glass border-t border-surface-800/60 px-4 py-4">
      <div className="max-w-3xl mx-auto">
        <div
          className={cn(
            'flex items-end gap-3 bg-surface-800 border rounded-2xl px-4 py-3 transition-all duration-200',
            disabled
              ? 'border-surface-700/50 opacity-60'
              : 'border-surface-700 hover:border-surface-600 focus-within:border-brand-600/60 focus-within:shadow-glow-blue'
          )}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            rows={1}
            className="flex-1 bg-transparent text-surface-100 placeholder-surface-500 text-sm resize-none outline-none leading-relaxed max-h-40 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={!value.trim() || disabled}
            className={cn(
              'flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200',
              value.trim() && !disabled
                ? 'bg-brand-600 text-white hover:bg-brand-700 active:scale-95'
                : 'bg-surface-700 text-surface-500 cursor-not-allowed'
            )}
          >
            <Send className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
        </div>
        <p className="text-center text-xs text-surface-600 mt-2">
          SAFAGO puede cometer errores. Verifica precios en la aerolínea antes de reservar.
        </p>
      </div>
    </div>
  );
}
