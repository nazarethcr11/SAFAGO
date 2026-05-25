import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { ChatRequest, ChatResponse } from '@/types';
import { getMockResponse } from '@/lib/mockResponses';
import { createInitialState } from '@/lib/conversationalEngine';

export async function POST(request: NextRequest) {
  let body: ChatRequest;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ type: 'error', content: 'Solicitud inválida' }, { status: 400 });
  }

  const { message, sessionId, conversationState } = body;

  if (!message?.trim()) {
    return NextResponse.json({ type: 'error', content: 'Mensaje requerido' }, { status: 400 });
  }

  const state = conversationState ?? createInitialState();
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  // Dev mode: use in-process conversational engine
  if (!webhookUrl) {
    const { response, newState } = await getMockResponse(message, state);
    return NextResponse.json({ ...response, conversationState: newState });
  }

  try {
    const { data } = await axios.post<ChatResponse>(
      webhookUrl,
      { message, sessionId, conversationState: state },
      { timeout: 30000, headers: { 'Content-Type': 'application/json' } }
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error('[SAFAGO] N8N Webhook error:', error);

    // Fallback to mock engine if N8N fails
    const { response, newState } = await getMockResponse(message, state);
    return NextResponse.json({ ...response, conversationState: newState });
  }
}
