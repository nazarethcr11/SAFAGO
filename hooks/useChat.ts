'use client';

import { useCallback } from 'react';
import { useChatStore } from '@/store/chatStore';
import { sendMessage } from '@/services/chatService';

/** Heuristic: will this message likely trigger a flight search? */
function willTriggerFlightSearch(
  content: string,
  stage: string,
  hasConfirmedDest: boolean
): boolean {
  if (!hasConfirmedDest) return false;
  if (stage !== 'date_selection' && stage !== 'destination_selection') return false;

  const lower = content.toLowerCase();
  const hasDate =
    /\d{1,2}\s+(de\s+)?\w+|\bde\b.*\bal\b|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre/i.test(
      lower
    );
  const hasOrigin =
    /lima|bogot|santiago|buenos aires|quito|medellin|medell[ií]n|caracas|miami|madrid|barcelona/i.test(
      lower
    );
  return hasDate || hasOrigin;
}

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

      // Detect whether this will trigger a flight search → use special loading animation
      const isFlightSearch = willTriggerFlightSearch(
        content,
        conversationState.stage,
        conversationState.confirmedDestination !== null
      );
      const loadingId = addLoadingMessage(isFlightSearch ? 'searching_flights' : 'thinking');
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
        } else {
          console.warn('[SAFAGO] Respuesta sin conversationState — el estado de conversación no se actualizó.');
        }
      } catch (err) {
        console.error('[SAFAGO] Error en sendUserMessage:', err);
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
    [
      isLoading,
      sessionId,
      conversationState,
      addMessage,
      addLoadingMessage,
      updateMessage,
      setLoading,
      setConversationState,
    ]
  );

  return { messages, isLoading, conversationState, sendUserMessage, clearChat };
}
