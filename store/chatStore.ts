'use client';

import { create } from 'zustand';
import { Message, ConversationState } from '@/types';
import { createInitialState } from '@/lib/conversationalEngine';
import { v4 as uuidv4 } from 'uuid';

interface ChatStore {
  messages: Message[];
  sessionId: string;
  isLoading: boolean;
  conversationState: ConversationState;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  addLoadingMessage: () => string;
  removeMessage: (id: string) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  setLoading: (loading: boolean) => void;
  setConversationState: (state: ConversationState) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  sessionId: uuidv4(),
  isLoading: false,
  conversationState: createInitialState(),

  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { ...message, id: uuidv4(), timestamp: new Date() },
      ],
    })),

  addLoadingMessage: () => {
    const id = uuidv4();
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          isLoading: true,
        },
      ],
    }));
    return id;
  },

  removeMessage: (id) =>
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== id),
    })),

  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setConversationState: (conversationState) => set({ conversationState }),

  clearChat: () =>
    set({
      messages: [],
      isLoading: false,
      conversationState: createInitialState(),
    }),
}));
