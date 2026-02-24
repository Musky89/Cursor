import { getAuthContext } from "@/lib/auth";
import { errorResponse, parseJsonBody, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validators";

export async function GET() {
  const auth = await getAuthContext();
  if (!auth) {
    return unauthorizedResponse();
  }

  const products = await prisma.product.findMany({
    where: { workspaceId: auth.workspace.id },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ products });
}

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) {
    return unauthorizedResponse();
  }

  const parsedBody = await parseJsonBody(request, productSchema);
  if (!parsedBody.ok) {
    return parsedBody.response;
  }

  const { name, description, price, marginPct, landingUrl } = parsedBody.data;
  const normalizedUrl = landingUrl.trim();

  if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
    return errorResponse("landingUrl must include http:// or https://");
  }

  const product = await prisma.product.create({
    data: {
      workspaceId: auth.workspace.id,
      name,
      description,
      price,
      marginPct,
      landingUrl: normalizedUrl,
    },
  });

  return Response.json({ product }, { status: 201 });
}
