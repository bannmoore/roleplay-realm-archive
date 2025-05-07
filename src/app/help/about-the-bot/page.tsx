export default function AboutTheBot() {
  return (
    <div className="max-w-screen-md mx-auto">
      <div className="card">
        <div className="flex flex-col gap-4">
          <p>
            You need to install the Bot on any servers you&apos;d like to
            Archive. This bot doesn&apos;t have any commands or actions - all it
            does is provide permission to view your server&apos;s users,
            channels, and messages.
          </p>
          <p>
            Once the bot has added, come back here and click the &quot;Sync
            servers&quot; button on the home screen.
          </p>
          <p>To continue, click below:</p>
          <div>
            <a
              className="button"
              href="https://discord.com/oauth2/authorize?client_id=1294386941822898227&permissions=0&integration_type=0&scope=bot"
              target="_blank"
            >
              Install Bot
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
