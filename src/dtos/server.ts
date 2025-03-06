import { DiscordGuild } from "@/clients/discord-types";
import { Selectable } from "kysely";
import { Servers } from "kysely-codegen";

export type UnsavedServer = {
  discordId: string;
  name: string;
  iconHash?: string;
};

export type Server = UnsavedServer & {
  id: string;
};

export function serverFromDbRow(row: Selectable<Servers>): Server {
  return {
    id: row.id,
    discordId: row.discord_id,
    name: row.name,
    iconHash: row.icon_hash || undefined,
  };
}

export function serverFromDiscordGuild(guild: DiscordGuild): UnsavedServer {
  return {
    discordId: guild.id,
    name: guild.name,
    iconHash: guild.icon,
  };
}
