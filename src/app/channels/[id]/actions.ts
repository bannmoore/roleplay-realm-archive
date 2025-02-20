"use server";

import database, { MessageWithUser } from "@/clients/database";
import discord from "@/clients/discord-client";
import { Selectable } from "kysely";
import { Channels } from "kysely-codegen";
import { revalidatePath } from "next/cache";

export async function syncChannel({
  channel,
}: {
  channel: Selectable<Channels>;
}) {
  const authorUsers = await database.getServerUsers(channel.server_id);

  const oldestMessage = await database.getOldestMessage(channel.id);
  let oldestMessageId = oldestMessage?.discord_id;
  let isSyncing = true;

  while (isSyncing) {
    const newMessages = await discord.getMessages(channel.discord_id, {
      beforeId: oldestMessageId,
    });

    if (!newMessages.length) {
      isSyncing = false;
      break;
    }

    const newMessagesWithUsers: MessageWithUser[] = newMessages.flatMap((m) => {
      const author = authorUsers.find((row) => row.discord_id === m.author.id);
      const content = m.content?.replace(/<@[0-9]+>/, "").trim();

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

    if (newMessagesWithUsers.length) {
      await database.upsertMessages(channel.id, newMessagesWithUsers);
    }

    oldestMessageId = newMessages[newMessages.length - 1].id;

    await sleep(1000);
  }

  revalidatePath(`channels/${channel.id}`, "page");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
