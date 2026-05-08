"use server";

import database from "@/clients/database";
import storage from "@/clients/storage";
import { redirect } from "next/navigation";

export async function updateCharacter({
  id,
  story,
  imageFile,
}: {
  id: string;
  story: string;
  imageFile: File | undefined;
}) {
  let imageUri;
  if (imageFile) {
    const arrayBuffer = await imageFile.arrayBuffer();
    imageUri = await storage.uploadFile({
      buf: arrayBuffer,
      path: `characters/${id}.${getMimeTypeExtension(imageFile.type)}`,
    });
  }

  await database.updateCharacter({ story, imageUri });

  redirect(`/characters/${id}`);
}

export async function backToCharacterPage(id: string) {
  redirect(`/characters/${id}`);
}

function getMimeTypeExtension(mimeType: string) {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    default:
      return "";
  }
}
