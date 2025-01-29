import { getChannels, getServer } from "@/api/database";
import { notFound } from "next/navigation";
import Image from "next/image";
import { AddChannelSection } from "./AddChannelSection";
import Link from "next/link";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const server = await getServer(id);

  if (!server) {
    return notFound();
  }

  const channels = await getChannels(server.id);

  return (
    <>
      <div className="mb-4">
        <h1 className="mb-4">{server.name}</h1>
        <Image
          className="rounded-full mx-auto"
          src={`https://cdn.discordapp.com/icons/${server.discord_id}/${server.icon_hash}.png`}
          alt={`${server.name} icon`}
          width={100}
          height={100}
        />
      </div>

      <AddChannelSection
        serverDiscordId={server.discord_id}
        serverId={server.id}
      />

      <div className="mt-4">
        {channels.map((channel) => (
          <Link
            key={channel.id}
            href={`/channels/${channel.id}`}
            className="mb-4 flex items-center bg-darkpurple-900 p-4 border border-darkpurple-500 shadow-sm rounded-lg hover:bg-darkpurple-800 transition-all ease-in"
          >
            {channel.name}
          </Link>
        ))}
      </div>
    </>
  );
}
