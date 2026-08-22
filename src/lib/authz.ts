import { NextResponse } from "next/server";
import type { UserRole } from "@prisma/client";
import { auth, STAFF_ROLES } from "@/auth";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) return null;
  return session.user;
}

export async function requireRole(role: UserRole) {
  const user = await requireAuth();
  return user?.role === role ? user : null;
}

export async function requireAnyRole(roles: readonly UserRole[] = STAFF_ROLES) {
  const user = await requireAuth();
  return user && roles.includes(user.role) ? user : null;
}

export async function requireApiRole(roles: readonly UserRole[] = STAFF_ROLES) {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    return { user: null, response: NextResponse.json({ error: "Authentication required" }, { status: 401 }) };
  }
  if (!roles.includes(session.user.role)) {
    return { user: null, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user: session.user, response: null };
}
