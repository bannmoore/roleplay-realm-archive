import { config } from "@/config";
import {
  DiscordChannel,
  DiscordGuild,
  DiscordGuildMember,
  DiscordMessage,
  DiscordUser,
} from "./discord-types";

let userToken: string | null = null;

class DiscordClient {
  private _apiUrl: string = "https://discord.com/api/v10";
  private _botToken: string;

  constructor({ botToken }: { botToken: string }) {
    this._botToken = botToken;
  }

  hasUserToken() {
    return !!userToken;
  }

  setUserToken(token: string | null) {
    userToken = token;
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

    const json = await response.json();

    if (json.message === "401: Unauthorized") {
      throw new Error("Bot unauthorized");
    }

    return json;
  }
}

const discord = Object.freeze(
  new DiscordClient({
    botToken: config.discordBotToken,
  })
);

export default discord;
