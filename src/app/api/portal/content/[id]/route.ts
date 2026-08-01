import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { ContentService } from '@/services/content.service';
import { updateContentSchema } from '@/lib/validations/content.schema';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyToken(req.cookies.get(COOKIE_NAME)?.value ?? '');
  if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const item = await ContentService.get(id);
  if (!item) return NextResponse.json({ success: false, message: 'Content not found' }, { status: 404 });

  return NextResponse.json({ success: true, data: item });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyToken(req.cookies.get(COOKIE_NAME)?.value ?? '');
  if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateContentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: 'Validation failed', errors: parsed.error.flatten() }, { status: 422 });
  }

  const updated = await ContentService.update(id, parsed.data);
  if (!updated) return NextResponse.json({ success: false, message: 'Content not found' }, { status: 404 });

  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyToken(req.cookies.get(COOKIE_NAME)?.value ?? '');
  if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  await ContentService.softDelete(id);
  return NextResponse.json({ success: true, message: 'Content deleted' });
}
