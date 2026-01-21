import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../../../lib/prisma";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      authorization: { params: { scope: "read:user user:email" } },
      profile(profile: any) {
        const email =
          profile.email ??
          (profile.login && profile.id ? `${profile.id}+${profile.login}@users.noreply.github.com` : null);
        return {
          id: String(profile.id),
          name: profile.name ?? profile.login,
          email,
          image: profile.avatar_url,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "database" },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = (user as any).role ?? "ADMIN";
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      await prisma.user
        .update({ where: { id: user.id }, data: { role: "ADMIN" } })
        .catch(() => {});
    },
  },
};

export default NextAuth(authOptions);