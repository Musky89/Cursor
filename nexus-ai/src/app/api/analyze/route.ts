import { NextResponse } from "next/server";
import { generateRevenueAnalysis } from "@/lib/ai-engine";

export async function POST(request: Request) {
  const body = await request.json();
  const { businessDescription, revenue, industry } = body;

  if (!businessDescription || !revenue || !industry) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));

  const result = generateRevenueAnalysis(businessDescription, revenue, industry);
  return NextResponse.json(result);
}
