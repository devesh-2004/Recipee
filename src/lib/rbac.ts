import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type Role = "user" | "admin";

export interface CurrentUser {
  email: string;
  role: Role;
}

/**
 * Read the authenticated user (email + role) from the server session.
 * Returns null when there is no valid session.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return null;
  return { email, role: (session.user.role as Role) || "user" };
}

/** Standard 401 response for unauthenticated requests. */
export function unauthorized() {
  return NextResponse.json(
    { error: "Authentication required" },
    { status: 401 }
  );
}

/** Standard 403 response for authenticated-but-not-allowed requests. */
export function forbidden() {
  return NextResponse.json(
    { error: "You do not have permission to access this resource" },
    { status: 403 }
  );
}

/**
 * Resolve which user's data the caller is allowed to operate on.
 *
 * - Regular users are always scoped to their OWN email; any `requested`
 *   email that differs from theirs is rejected (returns null).
 * - Admins may target any `requested` email, falling back to their own.
 *
 * Returns the allowed email, or null when the request is forbidden.
 */
export function resolveTargetEmail(
  user: CurrentUser,
  requested?: string | null
): string | null {
  if (user.role === "admin") {
    return requested?.trim() || user.email;
  }

  if (!requested || requested.trim().toLowerCase() === user.email.toLowerCase()) {
    return user.email;
  }

  // A non-admin tried to act on someone else's data.
  return null;
}
