import database from "@/clients/database";
import { RefreshServersButton } from "@/app/home/RefreshServersButton";
import Image from "next/image";
import Link from "next/link";
import { checkAuthenticated } from "@/util";
import { notFound } from "next/navigation";

export default async function HomePage() {
  const user = await checkAuthenticated();

  if (!user) {
    return notFound();
  }

  const servers = await database.getServers(user.id);

  return (
    <>
      {servers.map((server) => (
        <Link
          key={server.id}
          href={`/servers/${server.id}`}
          className="mb-4 flex items-center bg-darkpurple-900 p-4 border border-darkpurple-500 shadow-sm rounded-lg hover:bg-darkpurple-800 transition-all ease-in"
        >
          <Image
            className="rounded-full mr-4"
            src={`https://cdn.discordapp.com/icons/${server.discordId}/${server.iconHash}.png`}
            alt={`${server.name} icon`}
            width={60}
            height={60}
          />
          <div>{server.name}</div>
        </Link>
      ))}

      <RefreshServersButton />
    </>
  );
}
