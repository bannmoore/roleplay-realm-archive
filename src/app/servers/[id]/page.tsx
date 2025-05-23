import database from "@/clients/database";
import { notFound } from "next/navigation";
import Image from "next/image";
import { AddChannelSection } from "./AddChannelSection";
import Link from "next/link";
import Alert from "@/app/components/Alert";
import { checkAuthenticated } from "@/util";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await checkAuthenticated();

  if (!user) {
    return notFound();
  }
  const id = (await params).id;
  const server = await database.getServer(id);

  if (!server) {
    return notFound();
  }

  const channels = await database.getChannels({
    serverId: server.id,
    userId: user.id,
  });

  return (
    <>
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <h1>{server.name}</h1>
          <Link href={`/`} className="link">
            Back
          </Link>
        </div>
        <Image
          className="rounded-full mx-auto"
          src={`https://cdn.discordapp.com/icons/${server.discordId}/${server.iconHash}.png`}
          alt={`${server.name} icon`}
          width={100}
          height={100}
        />
      </div>

      <div className="my-4">
        <Alert />
      </div>

      <AddChannelSection
        serverDiscordId={server.discordId}
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
