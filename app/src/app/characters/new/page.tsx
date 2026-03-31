import database from "@/clients/database";
import { checkAuthenticated } from "@/util";
import { notFound } from "next/navigation";
import { AddCharacterForm } from "./AddCharacterForm";

export default async function NewCharacterPage() {
  const user = await checkAuthenticated();
  const universes = await database.getUniverses();

  if (!user) {
    return notFound();
  }

  const characters = await database.getCharacters(user.id);

  return (
    <>
      <div className="my-4">
        <h1>My Characters</h1>
      </div>

      <AddCharacterForm universes={universes} userId={user.id} />

      <div className="mt-4">
        {characters.map((character) => (
          <div
            key={character.name}
            className="mb-4 flex items-center bg-darkpurple-900 p-4 border border-darkpurple-500 shadow-sm rounded-lg hover:bg-darkpurple-800 transition-all ease-in"
          >
            {character.name}
          </div>
        ))}
      </div>
    </>
  );
}
