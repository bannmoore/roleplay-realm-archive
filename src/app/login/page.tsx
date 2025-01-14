export default function Login() {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const state = process.env.DISCORD_STATE;
  const scope = encodeURIComponent("identify");
  const redirectUri = encodeURIComponent(`${process.env.BASE_URL}/auth/verify`);

  return (
    <main className="container m-auto p-10 text-center">
      <h1 className="text-xl font-bold mb-5">Roleplay Realm</h1>
      <a
        href={`https://discord.com/oauth2/authorize?client_id=${clientId}&response_type=code&scope=${scope}&redirect_uri=${redirectUri}&state=${state}`}
        className="bg-spacecadet text-white font-bold py-2 px-4 rounded"
      >
        Sign in with Discord
      </a>
    </main>
  );
}
