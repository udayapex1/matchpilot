import { NextResponse } from 'next/server';
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

    const prompt = `As an expert matchmaker, write a short, precise explanation (under 50 words) of why ${customer.firstName} (${customer.age}, ${customer.designation}) is highly compatible with ${matchedCustomer.firstName} (${matchedCustomer.age}, ${matchedCustomer.designation}). Focus on shared values, complementary traits, and lifestyle synergy based on their demographics.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "google/gemma-4-31b-it:free",
        "messages": [
          {
            "role": "user",
            "content": prompt
          }
        ],
        "reasoning": {"enabled": true}
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", errorText);
      throw new Error("Failed to generate from OpenRouter");
    }

    const result = await response.json();
    const explanation = result.choices?.[0]?.message?.content || "";

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to generate explanation' }, { status: 500 });
  }
}
