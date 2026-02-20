import { prisma } from "@/app/lib/prisma";
import NextAuth, { NextAuthOptions } from "next-auth";
import * as bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
  },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Missing required fields");
        }

        const admin = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!admin) {
          throw new Error("Unauthorized");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          admin.password || ""
        );

        if (!isPasswordValid) {
          throw new Error("Unauthorized");
        }

        return { id: admin.id, email: admin.email };
      },
        }),
    ],
    callbacks: {
        async signIn({ account, user }: any) {
          if (account?.provider === "credentials") {
            return !!user;
          }
          return false;
        },
        async jwt({ token, user }: any) {
          if (user) {
            token.id = user.id;
          }
          return token;
        },
        async session({ session, token }: any) {
          if (token) {
            const jwtToken = jwt.sign(
              { id: token.id },
              process.env.JWT_SECRET || "admin-secret-key",
              { expiresIn: "30d" }
            );
            session.data = {
              token: jwtToken,
            };
          }
          return session;
        },
      },
};
export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };