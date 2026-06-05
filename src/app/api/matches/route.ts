import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { customerId, matchedCustomerId, score, aiExplanation } = await req.json();

    const match = await prisma.match.create({
      data: {
        customerId,
        matchedCustomerId,
        score,
        aiExplanation,
      },
    });

    return NextResponse.json({ success: true, match });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Match already exists' }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Failed to save match' }, { status: 500 });
  }
}
