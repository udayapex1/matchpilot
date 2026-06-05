import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { customerId, matchedCustomerId } = await req.json();

    const [customer, matchedCustomer] = await Promise.all([
      prisma.customer.findUnique({ where: { id: customerId } }),
      prisma.customer.findUnique({ where: { id: matchedCustomerId } }),
    ]);

    if (!customer || !matchedCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `As a high-end executive matchmaker, write a highly personalized, compelling email introduction pitching ${matchedCustomer.firstName} to ${customer.firstName}. 
    
Details for ${customer.firstName}: Age ${customer.age}, ${customer.designation} at ${customer.company}, living in ${customer.city}.
Details for ${matchedCustomer.firstName}: Age ${matchedCustomer.age}, ${matchedCustomer.designation} at ${matchedCustomer.company}, living in ${matchedCustomer.city}.

Include how their profiles align. Keep the tone professional, exclusive, and warm.`;

    const result = await model.generateContent(prompt);
    const intro = result.response.text();

    return NextResponse.json({ intro });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to generate intro' }, { status: 500 });
  }
}
