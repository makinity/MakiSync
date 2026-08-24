import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData().catch(() => null);

  if (!formData) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // pdf-parse reads a test file at import time which breaks in Next.js.
    // Import from the internal lib path to bypass that behaviour.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse/lib/pdf-parse.js') as typeof import('pdf-parse');
    const parsed = await pdfParse(buffer);
    const text = parsed.text?.trim();

    if (!text || text.length < 50) {
      return NextResponse.json(
        { error: 'Could not extract text from this PDF. Try a text-based PDF (not a scanned image).' },
        { status: 422 }
      );
    }

    return NextResponse.json({ text });
  } catch (err: any) {
    console.error('[ResumeFixer] PDF parse error:', err.message);
    return NextResponse.json(
      { error: 'Failed to read PDF. Make sure it is a valid, non-encrypted PDF.' },
      { status: 500 }
    );
  }
}
