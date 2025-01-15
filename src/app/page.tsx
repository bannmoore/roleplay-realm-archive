import { getMe } from "@/api/database";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function HomePage() {
  let user = null;
  const token = (await cookies()).get("token")?.value;

  if (token) {
    user = await getMe(token);
  }

  return (
    <main>
      <h1 className="mb-4">Roleplay Archive</h1>

      <p className="mb-4">Hi {user?.discord_username}!</p>

      <Link className="button block" href="/servers/add">
        Add Server
      </Link>
    </main>
  );
}
