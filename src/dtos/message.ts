import { DiscordMessage } from "@/clients/discord-types";
import { Selectable } from "kysely";
import { Messages } from "kysely-codegen";

export type UnsavedMessage = {
  authorId: string;
  discordId: string;
  discordPublishedAt: Date;
  content?: string;
};

export type Message = UnsavedMessage & {
  id: string;
  channelId: string;
  authorUsername?: string;
};

export function messageFromDbRow(row: Selectable<Messages>): Message {
  return {
    id: row.id,
    channelId: row.channel_id,
    authorId: row.author_id,
    discordId: row.discord_id,
    content: row.content || undefined,
    discordPublishedAt: row.discord_published_at,
  };
}

export function messageFromDiscordMessage(
  message: DiscordMessage,
  authorId: string
): UnsavedMessage {
  return {
    authorId,
    discordId: message.id,
    content: message.content || undefined,
    discordPublishedAt: new Date(message.timestamp),
  };
}
