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

    const prompt = `As a high-end executive matchmaker, write a highly personalized, compelling email introduction pitching ${matchedCustomer.firstName} to ${customer.firstName}. 
    
Details for ${customer.firstName}: Age ${customer.age}, ${customer.designation} at ${customer.company}, living in ${customer.city}.
Details for ${matchedCustomer.firstName}: Age ${matchedCustomer.age}, ${matchedCustomer.designation} at ${matchedCustomer.company}, living in ${matchedCustomer.city}.

Include how their profiles align. Keep the tone professional, exclusive, and warm.`;

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
    const intro = result.choices?.[0]?.message?.content || "";

    return NextResponse.json({ intro });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to generate intro' }, { status: 500 });
  }
}
