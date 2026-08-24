import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = 'You are a professional resume writer and career coach.\n\n' +
'Your task is to rewrite the provided resume so it is tailored to the specific job description given.\n\n' +
'Rules:\n' +
'- Align keywords and skills with the job description naturally\n' +
'- Strengthen bullet points to show measurable impact where possible\n' +
'- Improve clarity, grammar, and professional tone\n' +
'- Keep the same structure and sections as the original resume\n' +
'- NEVER invent or fabricate experience, skills, companies, or dates not in the original resume\n' +
'- Ensure the result is ATS-friendly\n' +
'- Keep bullets concise: maximum 4 bullet points per entry, each under 18 words\n' +
'- The total content must fit on ONE page of 8.5x13 inch (legal/long bond) paper\n\n' +
'The resume uses this EXACT section order:\n' +
'1. ABOUT ME (paragraph)\n' +
'2. EDUCATION (entries)\n' +
'3. PROJECTS (entries)\n' +
'4. WORK EXPERIENCE (entries)\n' +
'5. SKILLS + Tools (two-column)\n\n' +
'For entries sections:\n' +
'- "institution" = company/school name + date combined e.g. "Davao Del Sur State College | 2023-present"\n' +
'- "date" = leave as empty string "" always\n' +
'- "role" = bold job title or degree name\n' +
'- "bullets" = list of achievement bullets\n\n' +
'For the two-column section:\n' +
'- heading must be "SKILLS"\n' +
'- left.label = "SKILLS", left.items = array of skills\n' +
'- right.label = "Tools", right.columns = array of 2 arrays splitting tools evenly\n\n' +
'You MUST return ONLY a valid JSON object with no markdown, no explanation, no code fences.\n\n' +
'Schema:\n' +
'{\n' +
'  "name": "Full Name",\n' +
'  "title": "Job Title | Other Role",\n' +
'  "contact": { "phone": "...", "email": "...", "location": "..." },\n' +
'  "sections": [\n' +
'    { "heading": "ABOUT ME", "type": "paragraph", "content": "..." },\n' +
'    { "heading": "EDUCATION", "type": "entries", "entries": [{ "institution": "School | Year", "date": "", "role": "Degree", "bullets": ["..."] }] },\n' +
'    { "heading": "PROJECTS", "type": "entries", "entries": [{ "institution": "Project — context", "date": "", "role": "Role", "bullets": ["..."] }] },\n' +
'    { "heading": "WORK EXPERIENCE", "type": "entries", "entries": [{ "institution": "Company | Dates", "date": "", "role": "Title", "bullets": ["..."] }] },\n' +
'    { "heading": "SKILLS", "type": "two-column", "left": { "label": "SKILLS", "items": ["..."] }, "right": { "label": "Tools", "columns": [["Tool A", "Tool B"], ["Tool C", "Tool D"]] } }\n' +
'  ]\n' +
'}\n\n' +
'Return ONLY the JSON. No other text.';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { resume, jobDescription } = body;

  if (!resume || typeof resume !== 'string' || resume.trim().length < 50) {
    return NextResponse.json({ error: 'Resume text is required (minimum 50 characters)' }, { status: 400 });
  }

  if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length < 50) {
    return NextResponse.json({ error: 'Job description is required (minimum 50 characters)' }, { status: 400 });
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: 'AI service is not configured' }, { status: 500 });
  }

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: 'RESUME:\n' + resume.trim() + '\n\nJOB DESCRIPTION:\n' + jobDescription.trim(),
        },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('[ResumeFixer] Groq error:', JSON.stringify(data));
    return NextResponse.json({ error: 'AI service failed. Please try again.' }, { status: 500 });
  }

  const raw: string = data.choices?.[0]?.message?.content ?? '';

  // Strip any accidental markdown code fences
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    return NextResponse.json({ result: parsed });
  } catch {
    console.error('[ResumeFixer] JSON parse failed. Raw output:', raw.slice(0, 500));
    return NextResponse.json({ error: 'AI returned invalid data. Please try again.' }, { status: 500 });
  }
}
