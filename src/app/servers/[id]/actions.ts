"use server";

import database, { Message, Unsaved } from "@/clients/database";
import type { DiscordChannel } from "@/clients/discord";
import discord from "@/clients/discord";
import { revalidatePath } from "next/cache";

export async function getChannelOptions(serverDiscordId: string) {
  const all = await discord.getChannels(serverDiscordId);
  return all.filter((c) => c.parent_id);
}

export async function syncChannel(serverId: string, channel: DiscordChannel) {
  const channelResult = await database.upsertChannel({
    discordId: channel.id,
    name: channel.name,
    serverId,
    active: true,
  });

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

  const users = await database.getUsers(authors.map((author) => author.id));

  const messagesWithUsers: Unsaved<Message>[] = messages.flatMap((message) => {
    const author = users.find((row) => row.discordId === message.author.id);
    const content = message.content?.replace(/<@[0-9]+>/, "").trim();

    return author && content
      ? [
          {
            channelId: channelResult.id,
            discordId: message.id,
            authorId: author.id,
            content,
            discordPublishedAt: new Date(message.timestamp),
            isThread: !!message.thread,
            threadId: null,
          },
        ]
      : [];
  });

  await database.upsertMessages(messagesWithUsers);

  revalidatePath(`servers/${serverId}`, "page");
}
