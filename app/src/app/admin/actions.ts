"use server";

import database from "@/clients/database";
import { revalidatePath } from "next/cache";

export async function createUniverse(name: string) {
  await database.insertUniverse(name);

  revalidatePath("admin", "page");
}
