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
        <Link href={`/servers/${channel.server_id}`}>Back</Link>
      </div>

      <div className="text-left">
        <SyncChannelButton channel={channel} />

        <div className="mb-4">
          <div>Total messages: {channel.total_messages}</div>
          <div>First message: {channel.first_message_at?.toDateString()}</div>
          <div>Last message: {channel.last_message_at?.toDateString()}</div>
        </div>

        <h2>Recent Posts</h2>

        <div className="mt-4 text-left">
          {messages.map((message) => (
            <div
              key={message.id}
              className="mb-4 bg-darkpurple-900 p-4 border border-darkpurple-500 shadow-sm rounded-lg"
            >
              <div className="flex mb-2">
                <span className="flex-1">{message.discord_username}</span>
                <span>
                  {message.discord_published_at.toDateString()}{" "}
                  {message.discord_published_at.toLocaleTimeString()}
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
