// import api from "@/lib/config/axios";
// import rateLimiter from "@/lib/ratelimiter";
import api from "@/lib/config/axios";
import { User } from "@/types";
import bcrypt from "bcrypt";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

interface Admin {
  status: string;
  data: User;
}

export const authOptions: AuthOptions = {
  providers: [
    // Admin Authentication
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await api.get(`/api/users/${credentials.email}`);
          const user = response.data.data;

          const isPassword = await bcrypt.compare(
            credentials?.password,
            user.password!
          );

          if (
            credentials.email === user.email &&
            isPassword &&
            user.is_active
          ) {
            return {
              name: "user",
              id: user._id,
              email: user.email,
              role: user.role,
              current_branch_id: user.current_branch_id,
            };
          }

          return null;
        } catch (error) {
          console.error(error);
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

  // cookies: {  // need in https
  //   sessionToken: {
  //     name: isProd
  //       ? "__Secure-next-auth.session-token"
  //       : "next-auth.session-token",
  //     options: {
  //       httpOnly: true,
  //       sameSite: "lax",
  //       path: "/",
  //       secure: isProd,
  //     },
  //   },
  // },

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;
