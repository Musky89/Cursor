import { getAuthContext } from "@/lib/auth";
import { analyzeBrand } from "@/lib/agents/brand-intel";
import { errorResponse, unauthorizedResponse } from "@/lib/http";
import { z } from "zod";

const requestSchema = z.object({
  url: z.string().min(3).max(500),
});

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();

  const body = await request.json().catch(() => ({}));
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return errorResponse("Provide a valid URL.", 400);

  try {
    const profile = await analyzeBrand(parsed.data.url);
    return Response.json({ profile });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Brand analysis failed.", 502);
  }
}
