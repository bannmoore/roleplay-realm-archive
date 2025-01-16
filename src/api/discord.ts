type DiscordTokenResponse = {
  token_type: "Bearer";
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
};

export async function getToken(code: string): Promise<DiscordTokenResponse> {
  // TODO: v10
  const response = await fetch("https://discord.com/api/oauth2/token", {
    method: "post",
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code ?? "",
      redirect_uri: "http://localhost:3000/auth/verify",
      client_id: process.env.DISCORD_CLIENT_ID || "",
      client_secret: process.env.DISCORD_CLIENT_SECRET || "",
    }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const tokenPayload = await response.json();

  if (!tokenPayload.access_token) {
    throw new Error("Invalid token response");
  }

  return tokenPayload;
}

type DiscordUserResponse = {
  id: string;
  // TODO:: hash, https://discord.com/developers/docs/reference#image-formatting
  username: string;
  avatar: string;
  global_name: string;
};

export async function getMe(accessToken: string): Promise<DiscordUserResponse> {
  const response = await fetch("https://discord.com/api/users/@me", {
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  return response.json();
}

export type DiscordGuildResponse = {
  id: string;
  name: string;
  icon: string;
};

export async function getGuildAsBot(
  id: string
): Promise<DiscordGuildResponse | null> {
  console.log(`https://discord.com/api/guilds/${id}`);
  const response = await fetch(`https://discord.com/api/guilds/${id}`, {
    method: "get",
    headers: {
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      Accept: "application/json",
    },
  });

  if (response.status === 200) {
    return response.json();
  } else {
    return null;
  }
}

export async function getGuildsAsBot(): Promise<DiscordGuildResponse[]> {
  const response = await fetch("https://discord.com/api/users/@me/guilds", {
    method: "get",
    headers: {
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      Accept: "application/json",
    },
  });

  return response.json();
}
