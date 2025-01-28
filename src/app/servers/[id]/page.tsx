import { getServer } from "@/api/database";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Channels } from "kysely-codegen";
import { Selectable } from "kysely";
import { getDiscordGuildChannels } from "@/api/discord";
import { AddChannelSection } from "./AddChannelSection";

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

  const channels: Selectable<Channels>[] = [];

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

      <AddChannelSection serverId={server.discord_id} />

      {channels.map((channel) => (
        <>TBD wheee</>
      ))}
    </>
  );
}
