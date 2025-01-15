"use client";

import { getChannelById } from "@/actions";
import { DiscordGuildResponse } from "@/api/discord";
import Image from "next/image";
import { FormEvent, useState } from "react";

export function GetGuildForm() {
  const [id, setId] = useState("");
  const [searched, setSearched] = useState(false);
  const [guild, setGuild] = useState<DiscordGuildResponse | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const searchedGuild = await getChannelById(id);
    if (searchedGuild) {
      setGuild(searchedGuild);
    }

    setSearched(true);
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="text-left">
        <div className="mb-4">
          <label htmlFor="guildId" className="block mb-2">
            Enter a server id:
          </label>
          <input
            id="guildId"
            name="guildId"
            type="text"
            placeholder="0000000000000000000"
            required
            value={id}
            onChange={(event: React.FormEvent<HTMLInputElement>) =>
              setId(event.currentTarget.value)
            }
            className="w-full outline-none focus:outline-none bg-darkpurple-900 text-white placeholder:text-lightpurple-200 ring-transparent border border-lightpurple-400 transition-all ease-in disabled:opacity-50 disabled:pointer-events-none select-nonepy-2 px-2.5 py-2 ring shadow-sm rounded-lg duration-100 hover:border-lightpurple-100 hover:ring-none focus:border-lightpurple-100 focus:ring-none peer"
          />
        </div>
        <button type="submit" className="w-full">
          Search
        </button>
      </form>

      {guild && (
        <div className="mt-12">
          <Image
            className="mx-auto rounded-full mb-4"
            src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
            alt={`${guild.name} icon`}
            width={100}
            height={100}
          />
          <h2 className="mb-4">{guild.name}</h2>
          <button type="button">Add</button>
        </div>
      )}

      {searched && !guild && (
        <div className="mt-12">
          <h2>Server Not Found</h2>

          <p>
            Either it doesn&apos;t exist, or the Bot doesn&apos;t have access to
            it.
          </p>
        </div>
      )}
    </>
  );
}
