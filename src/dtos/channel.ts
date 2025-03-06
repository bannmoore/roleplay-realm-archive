import { DiscordChannel } from "@/clients/discord-types";
import { Selectable } from "kysely";
import { Channels } from "kysely-codegen";

export type UnsavedChannel = {
  discordId: string;
  name: string;
};

export type Channel = UnsavedChannel & {
  id: string;
  serverId: string;

  // metadata
  totalMessages?: number;
  firstMessageAt?: Date;
  lastMessageAt?: Date;
};

export function channelFromDbRow(row: Selectable<Channels>): Channel {
  return {
    id: row.id,
    discordId: row.discord_id,
    serverId: row.server_id,
    name: row.name,
  };
}

export function channelFromDiscordChannel(
  channel: DiscordChannel
): UnsavedChannel {
  return {
    discordId: channel.id,
    name: channel.name,
  };
}
