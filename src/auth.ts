import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { config } from "./config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // trustHost is equired for Docker deployment
  // Ref: https://authjs.dev/getting-started/deployment#docker
  trustHost: true,
  providers: [
    Discord({
      clientId: config.discordClientId,
      clientSecret: config.discordClientSecret,
      authorization:
        "https://discord.com/api/oauth2/authorize?scope=identify+guilds",
    }),
  ],
  callbacks: {
    // Discord provider doesn't return user "id" field by default.
    // Ref: https://github.com/nextauthjs/next-auth/issues/7122
    async session({ session }) {
      if (session.user.image == null || session.user.image == undefined) {
        return session;
      }

      const url = new URL(session.user.image);
      const userId = url.pathname.split("/")[2];

      session.user.id = userId;

      return session;
    },
  },
});
