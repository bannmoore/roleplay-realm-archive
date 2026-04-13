"use client";

import { FormEvent, useState } from "react";
import { backToCharacterPage, updateCharacter } from "./actions";
import { Character } from "@/clients/database";

export default function EditCharacterForm({
  character,
}: {
  character: Character;
}) {
  const [story, setStory] = useState(character.story ?? "");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    return updateCharacter({ id: character.id, story });
  }

  async function handleCancelClick() {
    backToCharacterPage(character.id);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="life_story">Life Story</label>
        <textarea
          id="life_story"
          name="life_story"
          rows={10}
          value={story ?? ""}
          onChange={(event) => setStory(event.target.value)}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <button type="submit" disabled={isLoading}>
          Save
        </button>

        <button type="button" onClick={handleCancelClick}>
          Cancel
        </button>
      </div>
    </form>
  );
}
