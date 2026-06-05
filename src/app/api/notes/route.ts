import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { customerId, content } = await req.json();

    const note = await prisma.note.create({
      data: {
        customerId,
        content,
      },
    });

    return NextResponse.json({ success: true, note });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to save note' }, { status: 500 });
  }
}
