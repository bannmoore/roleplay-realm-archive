import { config } from "@/config";
import {
  DiscordChannel,
  DiscordGuild,
  DiscordGuildMember,
  DiscordMessage,
  DiscordTokenResponse,
  DiscordUser,
} from "./discord-types";

let userToken: string | null = null;

class DiscordClient {
  private _apiUrl: string = "https://discord.com/api/v10";
  private _baseUrl: string;
  private _botToken: string;
  private _clientId: string;
  private _clientSecret: string;

  constructor({
    baseUrl,
    botToken,
    clientId,
    clientSecret,
  }: {
    baseUrl: string;
    botToken: string;
    clientId: string;
    clientSecret: string;
  }) {
    this._baseUrl = baseUrl;
    this._botToken = botToken;
    this._clientId = clientId;
    this._clientSecret = clientSecret;
  }

  hasUserToken() {
    return !!userToken;
  }

  setUserToken(token: string | null) {
    userToken = token;
  }

  async exhangeAuthCodeForToken(code: string): Promise<DiscordTokenResponse> {
    const response = await fetch(`${this._apiUrl}/oauth2/token`, {
      method: "post",
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code ?? "",
        redirect_uri: `${this._baseUrl}/auth/verify`,
        client_id: this._clientId,
        client_secret: this._clientSecret,
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

  async getGuildMembers(guildId: string): Promise<DiscordUser[]> {
    const response: DiscordGuildMember[] = await this.getWithBotAuth(
      `/guilds/${guildId}/members?limit=100`
    );

    return response
      .map((member) => member.user)
      .filter((member) => !member.bot);
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

    const response = await fetch(`${this._apiUrl}${path}`, {
      method: "get",
      headers: {
        Authorization: `Bearer ${userToken}`,
        Accept: "application/json",
      },
    });

    return response.json();
  }

  private async getWithBotAuth(path: string) {
    const response = await fetch(`${this._apiUrl}${path}`, {
      method: "get",
      headers: {
        Authorization: `Bot ${this._botToken}`,
        Accept: "application/json",
      },
    });

    return response.json();
  }
}

const discord = Object.freeze(
  new DiscordClient({
    baseUrl: config.baseUrl,
    botToken: config.discordBotToken,
    clientId: config.discordClientId,
    clientSecret: config.discordClientSecret,
  })
);

export default discord;
