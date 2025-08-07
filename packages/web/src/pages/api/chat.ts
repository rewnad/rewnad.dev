import type { APIRoute } from 'astro';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const POST: APIRoute = async ({ request }) => {
  const { messages } = await request.json();

  const result = streamText({
    model: openai('gpt-3.5-turbo'),
    messages,
  });

  return result.toTextStreamResponse();
};