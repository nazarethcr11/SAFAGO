'use client';

import { useCallback } from 'react';
import { useChatStore } from '@/store/chatStore';
import { sendMessage } from '@/services/chatService';

export function useChat() {
  const {
    messages,
    sessionId,
    isLoading,
    conversationState,
    addMessage,
    addLoadingMessage,
    updateMessage,
    setLoading,
    setConversationState,
    clearChat,
  } = useChatStore();

  const sendUserMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      addMessage({ role: 'user', content });
      const loadingId = addLoadingMessage();
      setLoading(true);

      try {
        const response = await sendMessage({
          message: content,
          sessionId,
          conversationState,
        });

        updateMessage(loadingId, {
          content: response.content,
          isLoading: false,
          type: response.type,
          recommendations: response.recommendations,
          flights: response.flights,
        });

        if (response.conversationState) {
          setConversationState(response.conversationState);
        }
      } catch {
        updateMessage(loadingId, {
          content:
            'Lo siento, ocurrió un error al conectar con el servidor. Por favor intenta de nuevo.',
          isLoading: false,
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    },
    [isLoading, sessionId, conversationState, addMessage, addLoadingMessage, updateMessage, setLoading, setConversationState]
  );

  return { messages, isLoading, conversationState, sendUserMessage, clearChat };
}
