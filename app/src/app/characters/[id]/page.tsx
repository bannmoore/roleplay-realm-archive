import MarkdownContent from "@/app/components/MarkdownContent";
import database from "@/clients/database";
import storage from "@/clients/storage";
import { checkAuthenticated } from "@/util";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

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

  let imageUri;
  if (character?.imageUri) {
    imageUri = await storage.getPresignedUrl(character?.imageUri);
  }

  if (!character) {
    return notFound();
  }

  return (
    <div>
      <div className="my-4 flex justify-between">
        <h1>{character.name}</h1>

        <Link className="button" href={`/characters/${id}/edit`}>
          Edit
        </Link>
      </div>

      {imageUri && (
        <Image
          alt={character.name}
          src={imageUri}
          width={300}
          height={300}
          className="mx-auto mb-4"
        />
      )}

      {character.story && <MarkdownContent content={character.story} />}
    </div>
  );
}
