import { config } from "@/config";

let userToken: string | null = null;

class DiscordClient {
  private _apiUrl: string;
  private _botToken: string;

  constructor({ apiUrl, botToken }: { apiUrl: string; botToken: string }) {
    this._apiUrl = apiUrl;
    this._botToken = botToken;
  }

  hasUserToken() {
    return !!userToken;
  }

  setUserToken(token: string | null) {
    userToken = token;
  }

  async getUserGuilds({
    userToken,
  }: {
    userToken: string;
  }): Promise<DiscordGuild[]> {
    return this.getWithUserAuth(`/users/@me/guilds`, {
      userToken,
    });
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

  async getMessage({
    channelId,
    messageId,
  }: {
    channelId: string;
    messageId: string;
  }): Promise<DiscordMessage> {
    return this.getWithBotAuth(`/channels/${channelId}/messages/${messageId}`);
  }

  async getMessages(
    channelId: string,
    { beforeId, afterId }: { beforeId?: string; afterId?: string } = {}
  ): Promise<DiscordMessage[]> {
    let qs = `/channels/${channelId}/messages?limit=100`;

    if (beforeId && afterId) {
      throw new Error("Cannot use both beforeId and afterId");
    }

    if (beforeId) {
      qs = `${qs}&before=${beforeId}`;
    }

    if (afterId) {
      qs = `${qs}&after=${afterId}`;
    }

    return this.getWithBotAuth(qs);
  }

  async getThreadMessages(
    parentMessageId: string,
    { beforeId }: { beforeId?: string } = {}
  ): Promise<DiscordMessage[]> {
    let qs = `/channels/${parentMessageId}/messages?limit=100`;

    if (beforeId) {
      qs = `${qs}&before=${beforeId}`;
    }

    return this.getWithBotAuth(qs);
  }

  async downloadAttachment(discordAttachment: DiscordMessageAttachment) {
    const response = await fetch(discordAttachment.url);
    const buf = await response.arrayBuffer();
    return buf;
  }

  private async getWithUserAuth(
    path: string,
    { userToken }: { userToken: string }
  ) {
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
    apiUrl: config.discordApiUrl,
    botToken: config.discordBotToken,
  })
);

export default discord;

// https://discord.com/developers/docs/resources/guild#guild-member-object
export type DiscordGuildMember = {
  user: DiscordUser;
};

// https://discord.com/developers/docs/resources/user#users-resource
export type DiscordUser = {
  id: string;
  // TODO:: hash, https://discord.com/developers/docs/reference#image-formatting
  username: string;
  avatar?: string;
  global_name: string;
  bot?: boolean;
};

// https://discord.com/developers/docs/resources/guild#guild-resource
export type DiscordGuild = {
  id: string;
  name: string;
  icon?: string;
};

// https://discord.com/developers/docs/resources/channel#channels-resource
export type DiscordChannel = {
  id: string;
  guild_id: string;
  name: string;
  parent_id: string | null;
};

// https://discord.com/developers/docs/resources/message#messages-resource
export type DiscordMessage = {
  id: string;
  channel_id: string;
  author: DiscordUser;
  content?: string;
  timestamp: string;
  thread?: DiscordChannel;
  attachments: DiscordMessageAttachment[];
};

// https://discord.com/developers/docs/resources/message#attachment-object
export type DiscordMessageAttachment = {
  id: string;
  filename: string;
  content_type: string;
  size: number;
  url: string;
  width?: number;
  height?: number;
};
