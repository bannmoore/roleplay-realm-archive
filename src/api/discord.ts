type DiscordTokenResponse = {
  token_type: "Bearer";
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
};

export async function exhangeAuthCodeForToken(
  code: string
): Promise<DiscordTokenResponse> {
  const response = await fetch(`${process.env.DISCORD_API_URL}/oauth2/token`, {
    method: "post",
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code ?? "",
      redirect_uri: `${process.env.BASE_URL}/auth/verify`,
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

export type DiscordUser = {
  id: string;
  // TODO:: hash, https://discord.com/developers/docs/reference#image-formatting
  username: string;
  avatar?: string;
  global_name: string;
};

export async function getDiscordUser(
  accessToken: string
): Promise<DiscordUser> {
  const response = await fetch(`${process.env.DISCORD_API_URL}/users/@me`, {
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  return response.json();
}

export type DiscordGuild = {
  id: string;
  name: string;
  icon: string;
};

export async function getDiscordGuild(
  id: string
): Promise<DiscordGuild | null> {
  const response = await fetch(`${process.env.DISCORD_API_URL}/guilds/${id}`, {
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

export async function getDiscordGuilds(): Promise<DiscordGuild[]> {
  const response = await fetch(
    `${process.env.DISCORD_API_URL}/users/@me/guilds`,
    {
      method: "get",
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        Accept: "application/json",
      },
    }
  );

  return response.json();
}

export type DiscordChannel = {
  id: string;
  guild_id: string;
  name: string;
  parent_id: string | null;
};

export async function getDiscordChannels(
  guildId: string
): Promise<DiscordChannel[]> {
  const response = await fetch(
    `${process.env.DISCORD_API_URL}/guilds/${guildId}/channels`,
    {
      method: "get",
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        Accept: "application/json",
      },
    }
  );

  return response.json();
}

export type DiscordMessage = {
  id: string;
  channel_id: string;
  author: DiscordUser;
  content?: string;
  timestamp: string;
};

export async function getDiscordMessages(
  channelId: string
): Promise<DiscordMessage[]> {
  const response = await fetch(
    `${process.env.DISCORD_API_URL}/channels/${channelId}/messages?limit=10`,
    {
      method: "get",
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        Accept: "application/json",
      },
    }
  );

  return response.json();
}
