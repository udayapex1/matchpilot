import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const c = await cookies();
  c.delete('session');
  return NextResponse.json({ success: true });
}
