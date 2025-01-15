import { GetGuildForm } from "@/components/GetGuildForm";

export default async function AddServerPage() {
  return (
    <main>
      <h1 className="mb-4">Add Server</h1>

      <GetGuildForm />
    </main>
  );
}
