import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { config } from "../config";
import { Provider } from "next-auth/providers";
import { jwtCallback, testCredentialsProvider } from "./credentials-provider";
import discord from "@/clients/discord";

const providers: Provider[] = [
  Discord({
    clientId: config.discordClientId,
    clientSecret: config.discordClientSecret,
    authorization:
      "https://discord.com/api/oauth2/authorize?scope=identify+guilds",
  }),
];

if (process.env.NODE_ENV === "development") {
  providers.push(testCredentialsProvider);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  // trustHost is equired for Docker deployment
  // Ref: https://authjs.dev/getting-started/deployment#docker
  trustHost: true,
  // Google flags the original path as a security risk, so we use a custom path
  // Ref: https://github.com/nextauthjs/next-auth/discussions/7238
  basePath: "/api/nextauth",
  providers,
  callbacks: {
    jwt: jwtCallback,
    async session({ session, token }) {
      // Short-circuit for e2e test user
      if (process.env.NODE_ENV === "development" && token.isTestUser) {
        session.user = {
          ...session.user,
          ...token.user,
        };
        return session;
      }

      // Discord provider doesn't return user "id" field by default.
      // Ref: https://github.com/nextauthjs/next-auth/issues/7122
      if (session.user.image == null || session.user.image == undefined) {
        return session;
      }

      const url = new URL(session.user.image);
      const userId = url.pathname.split("/")[2];

      session.user.id = userId;

      return session;
    },
    async signIn({ user, account }) {
      if (!account?.access_token) {
        throw new Error("Unable to authenticate with Discord");
      }
      const discordCoreServerId = config.discordCoreServerId;

      const guilds = await discord.getUserGuilds({
        userToken: account.access_token,
      });

      if (!guilds.find((guild) => guild.id === discordCoreServerId)) {
        console.error("Attempted invalid sign-in:", user);
        throw new Error(
          "Could not verify server membership. Please contact an admin."
        );
      }

      return true;
    },
  },
});
