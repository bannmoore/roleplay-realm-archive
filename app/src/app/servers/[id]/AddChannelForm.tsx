"use client";

import { FormEvent, useContext, useEffect, useState } from "react";
import { getChannelOptions, createAndSyncChannel } from "./actions";
import type { DiscordChannel } from "@/clients/discord";
import { AlertContext } from "@/app/components/AlertContext";
import { AlertInfo } from "@/app/components/Alert";

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
  const { setAlert } = useContext(AlertContext);

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
      await createAndSyncChannel(serverId, channel);
      setIsSyncing(false);
      setAlert({
        variant: "success",
        message: "Channel created and synced",
      });
      setSelectedChannelId("");
    }
  }

  function handleChange(event: React.FormEvent<HTMLSelectElement>) {
    setSelectedChannelId(event.currentTarget.value);
  }

  return (
    <form onSubmit={handleSubmit} className="card-neutral">
      <AlertInfo>
        This will attempt to sync all messages from the selected channel. This
        process can take a while, especially for older channels containing lots
        of images.
      </AlertInfo>

      <div className="flex items-center gap-4 mt-4">
        <label>
          <span className="text-lightpurple-200 mr-4">Channel name:</span>
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
        </label>

        <button type="submit" disabled={isSyncing}>
          Sync
        </button>
      </div>
    </form>
  );
}
