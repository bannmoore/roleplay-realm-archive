import { DiscordUser } from "@/clients/discord-types";
import { Selectable } from "kysely";
import { Users } from "kysely-codegen";

export type UnsavedUser = {
  discordId: string;
  discordUsername: string;
};

export type User = UnsavedUser & {
  id: string;
};

export function userFromDbRow(row: Selectable<Users>): User {
  return {
    id: row.id,
    discordId: row.discord_id,
    discordUsername: row.discord_username,
  };
}

export function userFromDiscordUser(user: DiscordUser): UnsavedUser {
  return {
    discordId: user.id,
    discordUsername: user.username,
  };
}
