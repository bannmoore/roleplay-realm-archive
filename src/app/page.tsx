import { cookies } from "next/headers";

export default async function Home() {
  console.log((await cookies()).get("token"));
  return (
    <main className="container m-auto p-10 text-center">
      <h1 className="text-xl font-bold mb-5">Roleplay Realm</h1>

      <div>Welcome</div>
    </main>
  );
}
