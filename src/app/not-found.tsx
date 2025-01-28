import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <h1 className="mb-4">Not Found</h1>
      <Link className="button" href="/">
        Return Home
      </Link>
    </div>
  );
}
