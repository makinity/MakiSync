import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

/* Allowed origins — add your Shopify store URL here */
const ALLOWED_ORIGINS = [
  'https://maki-sync.vercel.app',
  'https://maki-practice-store.myshopify.com',
  'http://127.0.0.1:9292',  /* Local Shopify dev server */
];

function corsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

/* Handle CORS preflight */
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  const headers = corsHeaders(origin);

  const { messages } = await req.json();
  if (!messages?.length) {
    return NextResponse.json({ error: 'No messages' }, { status: 400, headers });
  }

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
    body: JSON.stringify({ model: 'openai/gpt-oss-20b', messages: groqMessages }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('Groq error:', JSON.stringify(data));
    return NextResponse.json({ reply: 'Sorry, I could not process that.' }, { headers });
  }

  const reply = data.choices?.[0]?.message?.content ?? 'Sorry, I could not process that.';
  return NextResponse.json({ reply }, { headers });
}
