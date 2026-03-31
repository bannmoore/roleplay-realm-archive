"use server";

import database, { Character, Unsaved } from "@/clients/database";
import { redirect } from "next/navigation";

export async function createCharacter(data: Unsaved<Character>) {
  await database.insertCharacter(data);

  redirect("/characters");
}
