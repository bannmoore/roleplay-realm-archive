import { upsertSession, upsertUser } from "@/clients/database";
import { NextResponse } from "next/server";
import discord from "@/clients/discord-client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      throw new Error(
        searchParams.get("error_description") || "Unknown error from Discord"
      );
    }

    if (!code) {
      throw new Error("Missing code");
    }

    if (state !== process.env.DISCORD_STATE) {
      throw new Error("Invalid state");
    }

    const tokenData = await discord.exhangeAuthCodeForToken(code);

    discord.setUserToken(tokenData.access_token);

    const discordUser = await discord.getUser();

    const { id } = await upsertUser({
      discordId: discordUser.id,
      discordUsername: discordUser.username,
    });

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

    await upsertSession({
      userId: id,
      token: tokenData.access_token,
      expiresAt,
    });

    // TODO: issue - https://github.com/vercel/next.js/issues/54450
    const response = NextResponse.redirect(
      new URL("/auth/success", process.env.BASE_URL),
      {
        status: 302,
      }
    );

    response.cookies.set("token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: tokenData.expires_in,
      path: "/",
      sameSite: "strict",
    });

    return response;
  } catch (err) {
    console.error(err);

    // https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
    let message = "Unknown Error";
    if (err instanceof Error) message = err.message;

    return NextResponse.redirect(
      new URL(`/auth/error?description=${message}`, process.env.BASE_URL),
      {
        status: 302,
      }
    );
  }
}
