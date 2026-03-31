import database from "@/clients/database";
import { checkAuthenticated } from "@/util";
import { notFound } from "next/navigation";
import Alert from "../components/Alert";
import Link from "next/link";

export default async function CharactersPage() {
  const user = await checkAuthenticated();

  if (!user) {
    return notFound();
  }

  const characters = await database.getCharacters(user.id);

  return (
    <>
      <div className="my-4">
        <h1>My Characters</h1>
      </div>

      <div className="my-4">
        <Alert />
      </div>

      <Link href="/characters/new">New</Link>

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
