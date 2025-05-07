import database from "@/clients/database";
import { SyncServersButton } from "@/app/home/SyncServersButton";
import Image from "next/image";
import Link from "next/link";
import { checkAuthenticated } from "@/util";
import { notFound } from "next/navigation";
import Alert from "./components/Alert";

export default async function HomePage() {
  const user = await checkAuthenticated();

  if (!user) {
    return notFound();
  }

  const servers = await database.getServers(user.id);

  return (
    <>
      <div className="flex items-center justify-between my-4">
        <h1>Servers</h1>
        <div className="inline-block ml-4">
          <Link href="/help/about-the-bot" className="link mr-4">
            What&apos;s this?
          </Link>
          <SyncServersButton />
        </div>
      </div>

      <div className="my-4">
        <Alert />
      </div>

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
    </>
  );
}
