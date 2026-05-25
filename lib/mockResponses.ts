import { ChatResponse, ConversationState } from '@/types';
import { processConversation } from './conversationalEngine';

export async function getMockResponse(
  message: string,
  state: ConversationState
): Promise<{ response: ChatResponse; newState: ConversationState }> {
  // Compute result first so we can tailor the delay to the response type
  const result = processConversation(message, state);

  // Flight searches get a longer "realistic search" delay (cycling messages play during this)
  const isFlight = result.response.type === 'flights';
  const delay = isFlight
    ? 2800 + Math.random() * 600  // 2.8 – 3.4 s  — feels like a real search
    : 800  + Math.random() * 500; // 0.8 – 1.3 s  — normal conversation

  await new Promise((r) => setTimeout(r, delay));
  return result;
}
