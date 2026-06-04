import { NextRequest, NextResponse } from 'next/server';
import { ChatRequest, ConversationState } from '@/types';
import { createInitialState } from '@/lib/conversationalEngine';
import { runConversationPipeline } from '@/lib/ai/pipeline';

export async function POST(request: NextRequest) {
  let body: ChatRequest;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ type: 'error', content: 'Solicitud inválida' }, { status: 400 });
  }

  const { message, conversationState, messageHistory } = body;

  if (!message?.trim()) {
    return NextResponse.json({ type: 'error', content: 'Mensaje requerido' }, { status: 400 });
  }

  const state: ConversationState = conversationState ?? createInitialState();

  try {
    const response = await runConversationPipeline(
      message,
      state,
      messageHistory ?? []
    );
    return NextResponse.json(response);
  } catch (error) {
    console.error('[SAFAGO] Unhandled error in /api/chat:', error);
    return NextResponse.json(
      { type: 'error', content: 'Error interno del servidor. Por favor intenta de nuevo.' },
      { status: 500 }
    );
  }
}
