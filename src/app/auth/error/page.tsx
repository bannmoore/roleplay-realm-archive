import Link from "next/link";

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
      <Link className="button" href="/">
        Return home
      </Link>
    </main>
  );
}
