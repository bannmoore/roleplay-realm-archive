"use server";

import database from "@/clients/database";
import { DiscordChannel } from "@/clients/discord-types";
import discord from "@/clients/discord-client";
import { revalidatePath } from "next/cache";

export async function getChannelOptions(serverDiscordId: string) {
  const all = await discord.getChannels(serverDiscordId);
  return all.filter((c) => c.parent_id);
}

export async function syncChannel(serverId: string, channel: DiscordChannel) {
  const channelResult = await database.upsertChannel(serverId, {
    discordId: channel.id,
    name: channel.name,
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

  const messagesWithUsers: {
    discordId: string;
    authorId: string;
    content: string;
    discordPublishedAt: Date;
  }[] = messages.flatMap((message) => {
    const author = users.find((row) => row.discordId === message.author.id);
    const content = message.content?.replace(/<@[0-9]+>/, "").trim();

    return author && content
      ? [
          {
            discordId: message.id,
            authorId: author.id,
            content,
            discordPublishedAt: new Date(message.timestamp),
          },
        ]
      : [];
  });

  await database.upsertMessages(channelResult.id, messagesWithUsers);

  revalidatePath(`servers/${serverId}`, "page");
}
