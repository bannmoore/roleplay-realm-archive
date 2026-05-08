import database from "@/clients/database";
import { checkAuthenticated } from "@/util";
import { notFound } from "next/navigation";
import EditCharacterForm from "./EditCharacterForm";
import storage from "@/clients/storage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await checkAuthenticated();

  if (!user?.isAdmin) {
    return notFound();
  }

  const id = (await params).id;
  const character = await database.getCharacter(id);

  let imageUri = null;
  if (character?.imageUri) {
    imageUri = await storage.getPresignedUrl(character?.imageUri);
  }

  if (!character) {
    return notFound();
  }

  return (
    <>
      <div className="my-4">
        <h1>{character.name}</h1>
      </div>

      <EditCharacterForm character={character} imageUri={imageUri} />
    </>
  );
}
