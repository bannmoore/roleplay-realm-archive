import database from "@/clients/database";
import Link from "next/link";
import { notFound } from "next/navigation";
import SyncChannelButton from "./SyncChannelButton";
import MessageCard from "./MessageCard";
import ExpandableMessageCard from "./ExpandableMessageCard";
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

      <div className="text-left">
        <SyncChannelButton channel={channel} />

        <h2>Recent Posts</h2>

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
