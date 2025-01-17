"use client";

import { refreshServers } from "./actions";

export function RefreshServersButton() {
  return (
    <button
      className="mt-4"
      type="button"
      onClick={async () => {
        await refreshServers();
      }}
    >
      Refresh Server List
    </button>
  );
}
