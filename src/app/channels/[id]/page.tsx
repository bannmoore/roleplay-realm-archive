import database from "@/clients/database";
import Link from "next/link";
import { notFound } from "next/navigation";
import SyncChannelButton from "./SyncChannelButton";
import MessageCard from "./MessageCard";
import ExpandableMessageCard from "./ExpandableMessageCard";
import Alert from "@/app/components/Alert";
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

  const messages = await database.getRecentMessages(channel.id);

  return (
    <>
      <div className="mb-4">
        <h1 className="mb-4">{channel.name}</h1>
        <Link href={`/servers/${channel.serverId}`}>Back</Link>
      </div>

      <div className="my-4">
        <Alert />
      </div>

      <div className="text-left">
        <div className="flex justify-between my-4">
          <h2>Recent Posts</h2>
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

        <div className="mt-4 text-left">
          {messages.map((message) => {
            if (message.isThread) {
              return (
                <ExpandableMessageCard key={message.id} message={message} />
              );
            }

            return <MessageCard key={message.id} message={message} />;
          })}
        </div>
      </div>
    </>
  );
}
