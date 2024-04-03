import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  // apiKey: process.env.OPENAI_API_KEY,
  // apiKey: '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'
});

export const runtime = 'edge';

export async function POST(req: Request) {
  // Wrap with a try/catch to handle API errors
  try {
    const { messages } = await req.json();

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages,
    });

    const stream = OpenAIStream(response);

    return new StreamingTextResponse(stream);
  } catch (error) {
    // Check if the error is an APIError
    if (error instanceof OpenAI.APIError) {
      const { name, status, headers, message } = error;
      return NextResponse.json({ name, status, headers, message }, { status });
    } else {
      throw error;
    }
  }
}
