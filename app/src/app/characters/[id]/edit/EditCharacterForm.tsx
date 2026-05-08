"use client";

import { FormEvent, useState } from "react";
import { backToCharacterPage, updateCharacter } from "./actions";
import { Character } from "@/clients/database";
import CharacterImageUriInput from "./CharacterImageImageUriInput";

export default function EditCharacterForm({
  character,
  imageUri,
}: {
  character: Character;
  imageUri: string | null;
}) {
  const [story, setStory] = useState(character.story ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File>();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    return updateCharacter(character.id, { story, imageFile });
  }

  async function handleCancelClick() {
    backToCharacterPage(character.id);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4 text-center">
        <CharacterImageUriInput
          defaultValue={imageUri}
          onChange={setImageFile}
        />
      </div>

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
