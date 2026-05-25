import { useEffect, useRef } from 'react';
import { Message } from '@/types';

export function useAutoScroll(messages: Message[]) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return bottomRef;
}
