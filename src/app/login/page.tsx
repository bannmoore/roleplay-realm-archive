export default function LoginPage() {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const state = process.env.DISCORD_STATE;
  const scope = encodeURIComponent("identify guilds");
  const redirectUri = encodeURIComponent(`${process.env.BASE_URL}/auth/verify`);

  return (
    <main>
      <h1 className="mb-5">Roleplay Realm</h1>
      <a
        href={`https://discord.com/oauth2/authorize?client_id=${clientId}&response_type=code&scope=${scope}&redirect_uri=${redirectUri}&state=${state}`}
        className="button"
      >
        Sign in with Discord
      </a>
    </main>
  );
}
