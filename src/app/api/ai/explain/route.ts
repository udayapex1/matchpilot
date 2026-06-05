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

    const prompt = `As an expert matchmaker, write a short, precise explanation (under 50 words) of why ${customer.firstName} (${customer.age}, ${customer.designation}) is highly compatible with ${matchedCustomer.firstName} (${matchedCustomer.age}, ${matchedCustomer.designation}). Focus on shared values, complementary traits, and lifestyle synergy based on their demographics.`;

    const result = await model.generateContent(prompt);
    const explanation = result.response.text();

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to generate explanation' }, { status: 500 });
  }
}
