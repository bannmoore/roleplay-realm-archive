import { CredentialsSignin, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";

const TEST_USERNAME = process.env.CYPRESS_USERNAME;
const TEST_PASSWORD = process.env.CYPRESS_PASSWORD;
const TEST_DISCORD_ID = "111111111111111111";
const TEST_DISCORD_USERNAME = "test_user";

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
      credentials.username === TEST_USERNAME &&
      credentials.password === TEST_PASSWORD
    ) {
      return {
        id: TEST_DISCORD_ID,
        username: TEST_DISCORD_USERNAME,
        global_name: "Test Cypress",
      };
    }
    throw new InvalidLoginError();
  },
});

// In a Cypress scenario, pass user from Credentials provider to session
// Ref: https://github.com/nextauthjs/next-auth/discussions/7033#discussioncomment-5448155
export function jwtCallback({ token, user }: { token: JWT; user: User }): JWT {
  if (process.env.NODE_ENV === "development" && user?.id === TEST_DISCORD_ID) {
    return { ...token, user, isTestUser: true };
  }
  return token;
}
