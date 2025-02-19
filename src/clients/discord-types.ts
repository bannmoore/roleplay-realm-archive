export type DiscordTokenResponse = {
  token_type: "Bearer";
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
};

// https://discord.com/developers/docs/resources/guild#guild-member-object
export type DiscordGuildMember = {
  user: DiscordUser;
};

export type DiscordUser = {
  id: string;
  // TODO:: hash, https://discord.com/developers/docs/reference#image-formatting
  username: string;
  avatar?: string;
  global_name: string;
  bot?: boolean;
};

export type DiscordGuild = {
  id: string;
  name: string;
  icon: string;
};

export type DiscordChannel = {
  id: string;
  guild_id: string;
  name: string;
  parent_id: string | null;
};

export type DiscordMessage = {
  id: string;
  channel_id: string;
  author: DiscordUser;
  content?: string;
  timestamp: string;
};
