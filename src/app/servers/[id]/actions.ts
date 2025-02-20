"use server";

import database, { MessageWithUser } from "@/clients/database";
import { DiscordChannel } from "@/clients/discord-types";
import discord from "@/clients/discord-client";
import { revalidatePath } from "next/cache";

export async function getChannelOptions(serverDiscordId: string) {
  const all = await discord.getChannels(serverDiscordId);
  return all.filter((c) => c.parent_id);
}

export async function syncChannel(serverId: string, channel: DiscordChannel) {
  const channelResult = await database.upsertChannel(serverId, channel);

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

  const messagesWithUsers: MessageWithUser[] = messages.flatMap((m) => {
    const author = users.find((row) => row.discord_id === m.author.id);
    const content = m.content?.replace(/<@[0-9]+>/, "").trim();

    console.log(author, content);

    return author && content
      ? [
          {
            ...m,
            content: m.content?.replace(/<@[0-9]+>/, "").trim(),
            author_user: author,
          },
        ]
      : [];
  });

  await database.upsertMessages(channelResult.id, messagesWithUsers);

  revalidatePath(`servers/${serverId}`, "page");
}
