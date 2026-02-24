import { ZodSchema } from "zod";

export function errorResponse(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export async function parseJsonBody<T>(request: Request, schema: ZodSchema<T>) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return {
      ok: false as const,
      response: errorResponse(parsed.error.issues[0]?.message ?? "Invalid request body"),
    };
  }

  return {
    ok: true as const,
    data: parsed.data,
  };
}

export function unauthorizedResponse() {
  return errorResponse("Unauthorized", 401);
}
