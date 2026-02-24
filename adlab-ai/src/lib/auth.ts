import "server-only";

import { compare, hash } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

const SESSION_COOKIE_NAME = "adlab_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  userId: string;
};

function getJwtSecret() {
  const jwtSecret =
    process.env.JWT_SECRET ??
    (process.env.NODE_ENV !== "production" ? "dev-insecure-secret-change-this" : undefined);
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is required.");
  }
  return new TextEncoder().encode(jwtSecret);
}

export async function hashPassword(password: string) {
  return hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash);
}

async function signSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getJwtSecret());
}

async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (typeof payload.userId !== "string") {
      return null;
    }
    return { userId: payload.userId };
  } catch {
    return null;
  }
}

export async function setSessionCookie(userId: string) {
  const token = await signSessionToken({ userId });
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const payload = await verifySessionToken(token);
  return payload?.userId ?? null;
}

export async function getAuthContext() {
  const userId = await getSessionUserId();
  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      workspaces: {
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
  });

  if (!user || user.workspaces.length === 0) {
    return null;
  }

  return {
    user,
    workspace: user.workspaces[0],
  };
}
