import { NextResponse } from "next/server";
import { generatePricingAnalysis } from "@/lib/ai-engine";

export async function POST(request: Request) {
  const body = await request.json();
  const { product, currentPrice, market } = body;

  if (!product || !currentPrice || !market) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));

  const result = generatePricingAnalysis(product, currentPrice, market);
  return NextResponse.json(result);
}
