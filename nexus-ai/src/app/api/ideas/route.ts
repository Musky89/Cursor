import { NextResponse } from "next/server";
import { generateBusinessIdeas } from "@/lib/ai-engine";

export async function POST(request: Request) {
  const body = await request.json();
  const { skills, budget, interests } = body;

  if (!skills || !budget || !interests) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  await new Promise((r) => setTimeout(r, 2000 + Math.random() * 1000));

  const result = generateBusinessIdeas(skills, budget, interests);
  return NextResponse.json(result);
}
