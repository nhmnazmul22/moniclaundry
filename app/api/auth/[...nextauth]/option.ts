import api from "@/lib/config/axios";
import { User } from "@/types";
import bcrypt from "bcrypt";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

interface Admin {
  status: string;
  data: User;
}

const isProd = process.env.NODE_ENV === "production";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const response = await api.get(`/api/users/${credentials.email}`);
          const user = response.data.data;

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password!
          );

          if (isPasswordCorrect && user.is_active) {
            return {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              is_active: user.is_active,
              current_branch_id: user.current_branch_id,
            };
          }

          return null;
        } catch (error) {
          console.error("Login error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.is_active = user.is_active;
        token.current_branch_id = user.current_branch_id;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          name: token.name,
          email: token.email,
          role: token.role,
          is_active: token.is_active,
          current_branch_id: token.current_branch_id,
        };
      }
      return session;
    },
  },

  cookies: {
    sessionToken: {
      name: isProd
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProd,
      },
    },
  },

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;
