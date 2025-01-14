import { upsertSession, upsertUser } from "@/api/database";
import { getMe, getToken } from "@/api/discord";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code) {
      throw new Error("Missing code");
    }

    if (state !== process.env.DISCORD_STATE) {
      throw new Error("Invalid state");
    }

    const tokenData = await getToken(code);
    const discordUserData = await getMe(tokenData.access_token);

    const { id } = await upsertUser({
      discordId: discordUserData.id,
      discordUsername: discordUserData.username,
    });

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

    await upsertSession({
      userId: id,
      token: tokenData.access_token,
      expiresAt,
    });

    const response = NextResponse.redirect(
      new URL("/auth/success", request.url)
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
    return NextResponse.redirect(new URL("/auth/error", request.url));
  }
}
