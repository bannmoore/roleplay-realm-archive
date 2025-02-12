"use server";

import { upsertChannel, upsertMessages, upsertUsers } from "@/clients/database";
import { DiscordChannel, DiscordMessage } from "@/clients/discord-types";
import discord from "@/clients/discord-client";
import { Selectable } from "kysely";
import { Users } from "kysely-codegen";

export async function getChannelOptions(serverDiscordId: string) {
  const all = await discord.getChannels(serverDiscordId);
  return all.filter((c) => c.parent_id);
}

export type MessageWithUser = DiscordMessage & {
  author_user?: Selectable<Users>;
};

export async function syncChannel(serverId: string, channel: DiscordChannel) {
  const channelResult = await upsertChannel(serverId, channel);

  if (!channelResult) {
    throw new Error("Failed to insert channel.");
  }

  const messages = await discord.getMessages(channel.id);
  const authors = messages
    .filter(
      (message, index, self) =>
        self.findIndex((m) => m.author.id === message.author.id) === index
    )
    .map((message) => message.author);

  const usersResult = await upsertUsers(authors);

  const messagesWithUsers: MessageWithUser[] = messages
    .map((message) => ({
      ...message,
      content: message.content?.replace(/<@[0-9]+>/, "").trim(),
      author_user: usersResult.find(
        (row) => row.discord_id === message.author.id
      ),
    }))
    .filter((message) => message.author_user && message.content);

  await upsertMessages(channelResult.id, messagesWithUsers);

  return;
}
