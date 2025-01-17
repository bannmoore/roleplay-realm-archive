import Link from "next/link";

export default function AuthSuccess() {
  return (
    <main>
      <h1 className="mb-8">Login Successful!</h1>
      <Link className="button" href="/">
        Continue
      </Link>
    </main>
  );
}
