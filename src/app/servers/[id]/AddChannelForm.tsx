"use client";

import { FormEvent, useEffect, useState } from "react";
import { getChannelOptions, syncChannel } from "./actions";
import { DiscordChannel } from "@/api/discord-types";

export function AddChannelForm({
  serverDiscordId,
  serverId,
}: {
  serverDiscordId: string;
  serverId: string;
}) {
  const [channels, setChannels] = useState<DiscordChannel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    getChannelOptions(serverDiscordId).then(setChannels);
  }, [serverDiscordId, setChannels]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSyncing(false);

    const channel = channels.find(
      (channel) => channel.id === selectedChannelId
    );

    if (selectedChannelId && channel) {
      setIsSyncing(true);
      await syncChannel(serverId, channel);
      setIsSyncing(false);
    }
  }

  function handleChange(event: React.FormEvent<HTMLSelectElement>) {
    setSelectedChannelId(event.currentTarget.value);
  }

  return (
    <form onSubmit={handleSubmit}>
      <select
        name="channel"
        value={selectedChannelId}
        onChange={handleChange}
        className="outline-none focus:outline-none bg-darkpurple-900 text-white placeholder:text-lightpurple-200 ring-transparent border border-lightpurple-400 transition-all ease-in disabled:opacity-50 disabled:pointer-events-none select-nonepy-2 px-2.5 py-2 ring shadow-sm rounded-lg duration-100 hover:border-lightpurple-100 hover:ring-none focus:border-lightpurple-100 focus:ring-none peer"
      >
        {channels.map((channel) => (
          <option key={channel.id} value={channel.id}>
            {channel.name}
          </option>
        ))}
      </select>

      <button type="submit" disabled={isSyncing}>
        Add
      </button>

      {isSyncing && <p>Doing the thing... please wait.</p>}
    </form>
  );
}
