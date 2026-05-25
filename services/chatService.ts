import axios from 'axios';
import { ChatRequest, ChatResponse } from '@/types';

export async function sendMessage(request: ChatRequest): Promise<ChatResponse> {
  const { data } = await axios.post<ChatResponse>('/api/chat', request, {
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
  });
  return data;
}
