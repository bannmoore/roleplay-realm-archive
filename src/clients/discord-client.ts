import {
  DiscordChannel,
  DiscordGuild,
  DiscordMessage,
  DiscordTokenResponse,
  DiscordUser,
} from "./discord-types";

let userToken: string | null = null;

class DiscordClient {
  private apiUrl: string = "https://discord.com/api/v10";
  private botToken: string;

  constructor({ botToken }: { botToken: string }) {
    this.botToken = botToken;
  }

  hasUserToken() {
    return !!userToken;
  }

  setUserToken(token: string | null) {
    userToken = token;
  }

  async exhangeAuthCodeForToken(code: string): Promise<DiscordTokenResponse> {
    const response = await fetch(`${this.apiUrl}/oauth2/token`, {
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

  async getUser(): Promise<DiscordUser> {
    return this.getWithUserAuth("/users/@me");
  }

  async getGuild(id: string): Promise<DiscordGuild | null> {
    return this.getWithBotAuth(`/guilds/${id}`);
  }

  async getGuilds(): Promise<DiscordGuild[]> {
    return this.getWithBotAuth("/users/@me/guilds");
  }

  async getChannels(guildId: string): Promise<DiscordChannel[]> {
    return this.getWithBotAuth(`/guilds/${guildId}/channels`);
  }

  async getMessages(channelId: string): Promise<DiscordMessage[]> {
    return this.getWithBotAuth(`/channels/${channelId}/messages?limit=10`);
  }

  private async getWithUserAuth(path: string) {
    if (!userToken) {
      console.error("Discord Client: Unauthenticated");
      return null;
    }

    const response = await fetch(`${process.env.DISCORD_API_URL}${path}`, {
      method: "get",
      headers: {
        Authorization: `Bearer ${userToken}`,
        Accept: "application/json",
      },
    });

    return response.json();
  }

  private async getWithBotAuth(path: string) {
    const response = await fetch(`${process.env.DISCORD_API_URL}${path}`, {
      method: "get",
      headers: {
        Authorization: `Bot ${this.botToken}`,
        Accept: "application/json",
      },
    });

    return response.json();
  }
}

const discord = Object.freeze(
  new DiscordClient({
    botToken: process.env.DISCORD_BOT_TOKEN || "",
  })
);

export default discord;
