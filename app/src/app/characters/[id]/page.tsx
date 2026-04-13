import MarkdownContent from "@/app/components/MarkdownContent";
import database from "@/clients/database";
import { checkAuthenticated } from "@/util";
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

      {character.story && <MarkdownContent content={character.story} />}
    </div>
  );
}
