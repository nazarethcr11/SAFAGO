'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Trash2, ArrowLeft } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { WelcomeScreen } from './WelcomeScreen';

export function ChatInterface() {
  const { messages, isLoading, sendUserMessage, clearChat } = useChat();
  const bottomRef = useAutoScroll(messages);

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-screen bg-surface-900">
      {/* Header */}
      <header className="glass border-b border-surface-800/60 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-surface-400 hover:text-surface-100 transition-colors p-1 rounded-lg hover:bg-surface-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Plane className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-none">SAFAGO</p>
              <p className="text-xs text-surface-500 mt-0.5">Asistente de viajes IA</p>
            </div>
          </div>
        </div>

        {hasMessages && (
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 text-xs text-surface-500 hover:text-surface-300 transition-colors px-2 py-1.5 rounded-lg hover:bg-surface-800"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Limpiar
          </button>
        )}
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          <WelcomeScreen onPromptSelect={sendUserMessage} />
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-6">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0">
        <ChatInput onSend={sendUserMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
