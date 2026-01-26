import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role?: string;
    is_active?: string;
    current_branch_id?: [string];
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role?: string;
      is_active?: string;
      current_branch_id?: [string];
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    role?: string;
    is_active?: string;
    current_branch_id?: [string];
  }
}
