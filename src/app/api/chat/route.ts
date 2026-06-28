import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  if (!messages?.length) return NextResponse.json({ error: 'No messages' }, { status: 400 });

  const knowledge = await readFile(join(process.cwd(), 'public/knowledge.txt'), 'utf-8');

  const systemPrompt = `You are a helpful assistant for Mark Vencent Juntilla's portfolio website.
Answer questions based on the following knowledge base. Be concise and friendly.
If something is not in the knowledge base, say you don't have that information.

KNOWLEDGE BASE:
${knowledge}`;

  const groqMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m: { role: string; text: string }) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.text,
    })),
  ];

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({ model: 'llama-3.1-8b-instant', messages: groqMessages }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('Groq error:', JSON.stringify(data));
    return NextResponse.json({ reply: 'Sorry, I could not process that.' });
  }
  const reply = data.choices?.[0]?.message?.content ?? 'Sorry, I could not process that.';
  return NextResponse.json({ reply });
}
