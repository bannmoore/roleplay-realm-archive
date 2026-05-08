"use client";

import FileUpload from "@/app/components/FileUpload";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function CharacterImageUriInput({
  defaultValue,
  onChange,
}: {
  defaultValue: string | null;
  onChange: (value: File) => void;
}) {
  const [imagePreview, setImagePreview] = useState<string>();

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  function handleImageChange(file: File) {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    onChange(file);
    setImagePreview(URL.createObjectURL(file));
  }

  return (
    <>
      {defaultValue && !imagePreview && (
        <Image
          alt="current image"
          src={defaultValue}
          width={300}
          height={300}
          className="mx-auto mb-4"
        />
      )}

      {imagePreview && (
        <Image
          alt="preview image"
          src={imagePreview}
          width={300}
          height={300}
          className="mx-auto mb-4"
        />
      )}

      <FileUpload onChange={handleImageChange} id="imageFile" />
    </>
  );
}
