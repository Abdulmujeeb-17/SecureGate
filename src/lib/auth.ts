import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

/**
 * NextAuth configuration for SecureGate.
 *
 * Session Strategy: JWT
 * Rationale: JWT is stateless — no session table needed in the database.
 * For a focused auth app like SecureGate, this reduces database load and
 * simplifies the schema. JWTs are signed with NEXTAUTH_SECRET and verified
 * on each request without a DB roundtrip.
 *
 * Trade-off: Cannot revoke individual sessions server-side without additional
 * infrastructure (e.g., a token blacklist). Acceptable for this scope.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        // Look up user by email
        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        // User not found — return generic error (no email enumeration)
        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        // Compare hashed password using bcryptjs
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error("Please verify your email before signing in");
        }

        // Return user object for JWT token
        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
