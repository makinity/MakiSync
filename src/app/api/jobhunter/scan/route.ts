import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { spawn } from 'child_process';
import path from 'path';

export async function POST() {
  const { rows: configRows } = await pool.query('SELECT enabled FROM jobhunter_config WHERE id=1');
  if (!configRows[0]?.enabled) {
    return NextResponse.json({ error: 'JobHunter AI is disabled' }, { status: 400 });
  }

  const { rows: groups } = await pool.query(
    "SELECT * FROM jobhunter_groups WHERE status='active'"
  );
  if (groups.length === 0) {
    return NextResponse.json({ error: 'No active groups to scan' }, { status: 400 });
  }

  try {
    const servicePath = 'C:\\VA\\Website\\jobhunter-ai';
    const nodeExe = process.execPath; // Use the SAME node that's running Next.js

    const child = spawn(nodeExe, ['src/index.js', '--once'], {
      cwd: servicePath,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, PATH: process.env.PATH },
      windowsHide: true,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
      console.log(`[JobHunter] ${data.toString().trim()}`);
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
      console.error(`[JobHunter] ${data.toString().trim()}`);
    });

    child.on('error', (err) => {
      console.error('[JobHunter] Spawn error:', err.message);
    });

    child.on('exit', (code) => {
      console.log(`[JobHunter] Process exited with code ${code}`);
      if (code !== 0) {
        console.error('[JobHunter] stderr:', stderr?.slice(-500));
      }
    });

    return NextResponse.json({
      ok: true,
      message: `Scan started for ${groups.length} group(s). Check Telegram for notifications.`,
      groups: groups.map(g => ({ id: g.id, name: g.name })),
    });
  } catch (err: any) {
    console.error('[JobHunter] Route error:', err.message);
    return NextResponse.json({ error: 'Failed to start scan' }, { status: 500 });
  }
}
