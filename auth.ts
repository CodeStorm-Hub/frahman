import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: {},
        password: {},
      },
      authorize: async (credentials) => {
        const username = process.env.AUTH_USERNAME;
        const hash = process.env.AUTH_PASSWORD_HASH;
        if (!username || !hash) return null;
        if (credentials.username !== username) return null;
        const ok = await bcrypt.compare(credentials.password as string, hash);
        if (!ok) return null;
        return { id: "owner", name: "Frahman Admin" };
      },
    }),
  ],
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth: session }) {
      return !!session?.user;
    },
  },
  session: { strategy: "jwt" },
});
