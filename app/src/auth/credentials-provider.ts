import { CredentialsSignin, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { config } from "@/config";

/* https://authjs.dev/guides/testing */

class InvalidLoginError extends CredentialsSignin {
  code = "Invalid identifier or password";
}

export const testCredentialsProvider = Credentials({
  id: "password",
  name: "Password",
  credentials: {
    username: { label: "Username" },
    password: { label: "Password", type: "password" },
  },
  authorize: async (credentials) => {
    if (
      credentials.username === config.cypressUsername &&
      credentials.password === config.cypressPassword
    ) {
      return {
        id: config.cypressDiscordId,
        username: config.cypressDiscordUsername,
        global_name: "Test Cypress",
        isCredentialUser: true,
      };
    }
    throw new InvalidLoginError();
  },
});

// In a Cypress scenario, pass user from Credentials provider to session
// Ref: https://github.com/nextauthjs/next-auth/discussions/7033#discussioncomment-5448155
export function jwtCallback({ token, user }: { token: JWT; user: User }): JWT {
  if (config.enableCredentialAuth && user?.id === config.cypressDiscordId) {
    return { ...token, user };
  }
  return token;
}
