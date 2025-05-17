"use client";

import { useState } from "react";
import { AddChannelForm } from "./AddChannelForm";

export function AddChannelSection({
  serverDiscordId,
  serverId,
}: {
  serverDiscordId: string;
  serverId: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  function toggleSection() {
    setIsVisible(!isVisible);
  }

  return (
    <div>
      <button type="button" onClick={toggleSection} className="mb-4">
        {isVisible ? "Cancel" : "Add Channel"}
      </button>

      {isVisible && (
        <AddChannelForm serverDiscordId={serverDiscordId} serverId={serverId} />
      )}
    </div>
  );
}
