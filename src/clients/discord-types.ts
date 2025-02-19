// https://discord.com/developers/docs/topics/oauth2#authorization-code-grant-access-token-response
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
  icon: string;
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
};
