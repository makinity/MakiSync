import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { ClientService } from '@/services/client.service';
import { z } from 'zod';

const updateClientSchema = z.object({
  business_name: z.string().min(1).max(200).optional(),
  industry: z.string().max(100).optional(),
  logo_url: z.string().url().optional(),
  brand_color_primary: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  brand_color_secondary: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  notes: z.string().max(1000).optional(),
  is_active: z.boolean().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyToken(req.cookies.get(COOKIE_NAME)?.value ?? '');
  if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const client = await ClientService.getClient(id);
  if (!client) return NextResponse.json({ success: false, message: 'Client not found' }, { status: 404 });

  return NextResponse.json({ success: true, data: client });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyToken(req.cookies.get(COOKIE_NAME)?.value ?? '');
  if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateClientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: 'Validation failed', errors: parsed.error.flatten() }, { status: 422 });
  }

  const updated = await ClientService.updateClient(id, parsed.data);
  if (!updated) return NextResponse.json({ success: false, message: 'Client not found' }, { status: 404 });

  return NextResponse.json({ success: true, data: updated });
}
