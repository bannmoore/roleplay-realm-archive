"use client";

import { FormEvent, useState } from "react";
import { createCharacter } from "./actions";
import { Universe } from "@/clients/database";
import SingleSelect from "@/components/SingleSelect";

interface Props {
  universes: Universe[];
  userId: string;
}

export function AddCharacterForm({ universes, userId }: Props) {
  const [isSaving, setIsSaving] = useState(false);
  const [universeId, setUniverseId] = useState<string>();
  const [name, setName] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(false);

    if (name) {
      setIsSaving(true);
      await createCharacter({
        name,
        universeId: universeId ?? null,
        imageUri: null,
        userId,
        story: null,
      });
      setIsSaving(false);
    }
  }

  function handleChange(event: React.FormEvent<HTMLInputElement>) {
    setName(event.currentTarget.value);
  }

  return (
    <form onSubmit={handleSubmit} className="card-neutral">
      <label className="block mb-4">
        <span className="text-lightpurple-200 mr-4">Universe</span>
        <SingleSelect
          options={universes}
          value={universeId}
          name="universe"
          onChange={setUniverseId}
        />
      </label>

      <label className="mb-4 flex items-center">
        <span className="text-lightpurple-200 mr-4">Name</span>
        <input
          type="text"
          value={name}
          onChange={handleChange}
          required
          data-1p-ignore
          className="flex-1"
        />
      </label>

      <button type="submit" disabled={isSaving}>
        Save
      </button>
    </form>
  );
}
