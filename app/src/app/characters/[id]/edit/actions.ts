"use server";

import database from "@/clients/database";
import { redirect } from "next/navigation";

export async function updateCharacter({
  id,
  story,
}: {
  id: string;
  story: string;
}) {
  await database.updateCharacter({ story });

  redirect(`/characters/${id}`);
}

export async function backToCharacterPage(id: string) {
  redirect(`/characters/${id}`);
}
