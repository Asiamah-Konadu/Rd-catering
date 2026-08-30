import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { UserRole } from "@prisma/client";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const STAFF_ROLES: UserRole[] = [
  "ADMIN",
  "MENU_MANAGER",
  "ORDER_HANDLER",
  "DELIVERY_AGENT",
];

function isStaffRole(value: unknown): value is UserRole {
  return typeof value === "string" && STAFF_ROLES.includes(value as UserRole);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "rd-catering-fallback-secret-key-min-32-chars",
  trustHost: true,
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const email =
            typeof credentials?.email === "string"
              ? credentials.email.trim().toLowerCase()
              : "";
          const password =
            typeof credentials?.password === "string"
              ? credentials.password
              : "";

          if (!email || !password) return null;

          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            console.log(`[AUTH] User not found: ${email}`);
            return null;
          }

          if (!user.isActive || !user.passwordHash || !STAFF_ROLES.includes(user.role)) {
            console.log(`[AUTH] User ${email} inactive or non-staff role: ${user.role}`);
            return null;
          }

          const isValidPassword = await compare(password, user.passwordHash);
          if (!isValidPassword) {
            console.log(`[AUTH] Invalid password attempt for: ${email}`);
            return null;
          }

          return { id: user.id, name: user.name, email: user.email, role: user.role };
        } catch (err) {
          console.error("[AUTH] Exception during authorize:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && typeof token.id === "string" && isStaffRole(token.role)) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
});
