import { ChatResponse, ConversationState } from '@/types';
import { processConversation } from './conversationalEngine';

export async function getMockResponse(
  message: string,
  state: ConversationState
): Promise<{ response: ChatResponse; newState: ConversationState }> {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 900 + Math.random() * 600));

  return processConversation(message, state);
}
