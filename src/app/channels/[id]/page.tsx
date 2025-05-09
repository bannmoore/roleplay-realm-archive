import database, { MessageWithDisplayData } from "@/clients/database";
import Link from "next/link";
import { notFound } from "next/navigation";
import SyncChannelButton from "./SyncChannelButton";
import MessageCard from "./MessageCard";
import ExpandableMessageCard from "./ExpandableMessageCard";
import Alert from "@/app/components/Alert";
import LoadMore from "./LoadMore";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const channel = await database.getChannel(id);

  if (!channel) {
    return notFound();
  }

  const messages = await database.getRecentMessages(channel.id, {
    limit: 2,
    offset: 0,
  });

  return (
    <div className="text-left">
      <div className="flex items-center justify-between my-4">
        <div>
          <h1>{channel.name}</h1>{" "}
          <Link href={`/servers/${channel.serverId}`} className="link">
            Back
          </Link>
        </div>
        <span>
          Last synced:{" "}
          {channel.lastSyncedAt
            ? channel.lastSyncedAt.toLocaleString()
            : "Never"}
          <div className="inline-block ml-4">
            <SyncChannelButton channel={channel} />
          </div>
        </span>
      </div>

      <div className="my-4">
        <Alert />
      </div>

      <div className="mt-4 text-left">
        <LoadMore
          loadMoreAction={loadMoreMessages}
          channelId={channel.id}
          initialOffset={2}
          limit={2}
        >
          <MessagesList messages={messages} />
        </LoadMore>
      </div>
    </div>
  );
}

function MessagesList({ messages }: { messages: MessageWithDisplayData[] }) {
  return messages.map((message) => {
    if (message.isThread) {
      return <ExpandableMessageCard key={message.id} message={message} />;
    }

    return <MessageCard key={message.id} message={message} />;
  });
}

async function loadMoreMessages(
  channelId: string,
  { limit, offset }: { limit: number; offset: number }
) {
  "use server";
  const messages = await database.getRecentMessages(channelId, {
    limit,
    offset,
  });

  const nextOffset = messages.length >= limit ? offset + limit : null;

  return [
    <MessagesList messages={messages} key={offset} />,
    nextOffset,
  ] as const;
}
