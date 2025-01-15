export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: {
    description: string | string[] | undefined;
  };
}) {
  const description = searchParams.description;

  return (
    <main>
      <h1 className="mb-4">Well, that didn&apos;t work...</h1>
      <div className="mb-4">{description}</div>
      <a className="button" href="http://localhost:3000/">
        Click here to go back.
      </a>
    </main>
  );
}
