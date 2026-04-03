import { NextResponse } from "next/server";
import { generateMarketAnalysis } from "@/lib/ai-engine";

export async function POST(request: Request) {
  const body = await request.json();
  const { industry, region } = body;

  if (!industry) {
    return NextResponse.json(
      { error: "Industry is required" },
      { status: 400 }
    );
  }

  await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));

  const result = generateMarketAnalysis(industry, region || "Global");
  return NextResponse.json(result);
}
