import { getServers } from "@/api/database";
import { RefreshServersButton } from "@/components/RefreshServersButton";
import { Selectable } from "kysely";
import { Servers } from "kysely-codegen";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";

export default async function HomePage() {
  let servers: Selectable<Servers>[] = [];
  const token = (await cookies()).get("token")?.value;

  if (token) {
    servers = await getServers();
  }

  return (
    <>
      {servers.map((s) => (
        <Link
          key={s.id}
          href={`/servers/${s.id}`}
          className="mb-4 flex items-center bg-darkpurple-900 p-4 border border-darkpurple-500 shadow-sm rounded-lg hover:bg-darkpurple-800 transition-all ease-in"
        >
          <Image
            className="rounded-full mr-4"
            src={`https://cdn.discordapp.com/icons/${s.discord_id}/${s.icon_hash}.png`}
            alt={`${s.name} icon`}
            width={60}
            height={60}
          />
          <div>{s.name}</div>
        </Link>
      ))}

      <RefreshServersButton />
    </>
  );
}
