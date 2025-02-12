import { config } from "@/config";

export default function LoginPage() {
  const clientId = config.discordClientId;
  const state = config.discordState;
  const scope = encodeURIComponent("identify guilds");
  const redirectUri = encodeURIComponent(`${config.baseUrl}/auth/verify`);

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
