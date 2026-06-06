import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";

export const DB_NAME = "cookaro";

// Emails listed here are promoted to the "admin" role. Comma-separated.
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function defaultRoleFor(email: string): "user" | "admin" {
  return ADMIN_EMAILS.includes(email.toLowerCase()) ? "admin" : "user";
}

/**
 * Resolve the user's role from MongoDB, assigning a default role the first
 * time we see them. Every user therefore has a persisted role, which is what
 * the RBAC layer reads from the session.
 */
async function resolveRole(email: string): Promise<"user" | "admin"> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const users = db.collection("users");

  const existing = await users.findOne({ email });
  if (existing?.role) return existing.role as "user" | "admin";

  const role = defaultRoleFor(email);
  // Persist the role onto the adapter-managed user document.
  await users.updateOne({ email }, { $set: { role } }, { upsert: true });
  return role;
}

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise, { databaseName: DB_NAME }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      checks: ["none"], // Fix for Vercel OAuthCallback error
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.email = profile.email;
        token.name = profile.name;
        token.picture = (profile as any).picture;
      }

      // Resolve the role once (at sign-in, or if it is missing from the token).
      if (token.email && !token.role) {
        token.role = await resolveRole(token.email as string);
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email ?? "";
        session.user.name = token.name ?? "";
        session.user.image = token.picture ?? "";
        session.user.role = (token.role as "user" | "admin") ?? "user";
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};
