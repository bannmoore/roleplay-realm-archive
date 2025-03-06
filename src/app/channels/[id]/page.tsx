import database from "@/clients/database";
import Link from "next/link";
import { notFound } from "next/navigation";
import SyncChannelButton from "./SyncChannelButton";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const channel = await database.getChannelWithMetadata(id);

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

        <div className="mb-4">
          <div>Total messages: {channel.totalMessages}</div>
          <div>First message: {channel.firstMessageAt?.toDateString()}</div>
          <div>Last message: {channel.lastMessageAt?.toDateString()}</div>
        </div>

        <h2>Recent Posts</h2>

        <div className="mt-4 text-left">
          {messages.map((message) => (
            <div
              key={message.id}
              className="mb-4 bg-darkpurple-900 p-4 border border-darkpurple-500 shadow-sm rounded-lg"
            >
              <div className="flex mb-2">
                <span className="flex-1">{message.authorUsername}</span>
                <span>
                  {message.discordPublishedAt.toDateString()}{" "}
                  {message.discordPublishedAt.toLocaleTimeString()}
                </span>
              </div>
              <p>{message.content}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
