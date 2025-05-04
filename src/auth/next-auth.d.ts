import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id?: string;
    username: string;
    global_name: string;
  }

  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id?: string;
      username: string;
      global_name: string;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    user?: {
      id?: string;
      username: string;
      global_name: string;
    };
    isTestUser?: boolean;
  }
}
