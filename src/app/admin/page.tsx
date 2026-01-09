import database from "@/clients/database";
import { checkAuthenticated } from "@/util";
import { notFound } from "next/navigation";
import Alert from "../components/Alert";
import { AddUniverseForm } from "./AddUniverseForm";

export default async function AdminPage() {
  const user = await checkAuthenticated();

  if (!user) {
    return notFound();
  }

  const universes = await database.getUniverses();

  return (
    <>
      <div className="my-4">
        <h1>Universes</h1>
      </div>

      <div className="my-4">
        <Alert />
      </div>

      <AddUniverseForm />

      <div className="mt-4">
        {universes.map((universe) => (
          <div
            key={universe.name}
            className="mb-4 flex items-center bg-darkpurple-900 p-4 border border-darkpurple-500 shadow-sm rounded-lg hover:bg-darkpurple-800 transition-all ease-in"
          >
            {universe.name}
          </div>
        ))}
      </div>
    </>
  );
}
