import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateMatchScore } from '@/services/matching.service';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { notes: { orderBy: { createdAt: 'desc' } } },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Get matching candidates
    const candidates = await prisma.customer.findMany({
      where: {
        gender: customer.gender === 'Male' ? 'Female' : 'Male',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        age: true,
        city: true,
        designation: true,
        income: true,
        height: true,
        degree: true,
        diet: true,
        drinking: true,
        familyType: true,
        openToRelocate: true,
        wantKids: true,
        gender: true
      }
    });

    const matches = candidates.map(candidate => ({
      ...candidate,
      score: calculateMatchScore(customer, candidate as any)
    })).sort((a, b) => b.score - a.score).slice(0, 5); // top 5 matches

    return NextResponse.json({ customer, matches });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch customer details' }, { status: 500 });
  }
}
