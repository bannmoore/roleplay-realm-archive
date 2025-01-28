"use client";

import { FormEvent, useEffect, useState } from "react";
import { getChannelOptions, syncChannel } from "./actions";
import { DiscordGuildChannel } from "@/api/discord";

export function AddChannelForm({ serverId }: { serverId: string }) {
  const [channels, setChannels] = useState<DiscordGuildChannel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");

  useEffect(() => {
    getChannelOptions(serverId).then(setChannels);
  }, [serverId, setChannels]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    console.log(selectedChannelId);
    if (selectedChannelId) {
      syncChannel(selectedChannelId);
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

      <button type="submit">Add</button>
    </form>
  );
}
