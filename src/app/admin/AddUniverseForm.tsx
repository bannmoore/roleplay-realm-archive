"use client";

import { FormEvent, useContext, useState } from "react";
import { AlertContext } from "@/app/components/AlertContext";
import { createUniverse } from "./actions";

export function AddUniverseForm() {
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { setAlert } = useContext(AlertContext);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(false);

    if (name) {
      setIsSaving(true);
      await createUniverse(name);
      setIsSaving(false);
      setAlert({
        variant: "success",
        message: "Created successfully",
      });
      setName("");
    }
  }

  function handleChange(event: React.FormEvent<HTMLInputElement>) {
    setName(event.currentTarget.value);
  }

  return (
    <form onSubmit={handleSubmit} className="card-neutral">
      <div className="flex items-center gap-4 mt-4">
        <label>
          <span className="text-lightpurple-200 mr-4">Name:</span>
          <input
            type="text"
            value={name}
            onChange={handleChange}
            required
            data-1p-ignore
          />
        </label>

        <button type="submit" disabled={isSaving}>
          Add
        </button>
      </div>
    </form>
  );
}
