import database from "@/clients/database";
import discord from "@/clients/discord-client";
import { config } from "@/config";
import { redirect } from "@/util";

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

    if (state !== config.discordState) {
      throw new Error("Invalid state");
    }

    const tokenData = await discord.exhangeAuthCodeForToken(code);

    discord.setUserToken(tokenData.access_token);

    const discordUser = await discord.getUser();

    const { id } = await database.upsertUser({
      discordId: discordUser.id,
      discordUsername: discordUser.username,
    });

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

    await database.upsertSession({
      userId: id,
      token: tokenData.access_token,
      expiresAt,
    });

    const response = redirect("/auth/success");

    response.cookies.set("token", tokenData.access_token, {
      httpOnly: true,
      secure: config.env === "production",
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

    return redirect(`/auth/error?description=${message}`);
  }
}
