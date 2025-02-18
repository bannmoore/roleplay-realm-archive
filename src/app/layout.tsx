import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import database from "@/clients/database";
import { auth, signIn, signOut } from "@/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Roleplay Realm Archive",
  description: "",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let user = null;
  const session = await auth();

  if (session?.user?.id) {
    user = await database.getCurrentUser(session?.user?.id);
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="container m-auto flex p-4 items-center">
          <Link href="/">Roleplay Realm Archive</Link>
          <div className="flex-1">
            {user && (
              <div className="flex items-center justify-end gap-4">
                <div>{user?.discord_username}</div>
                <form
                  action={async () => {
                    "use server";
                    await signOut();
                  }}
                >
                  <button type="submit">Sign Out</button>
                </form>
              </div>
            )}
            {!user && (
              <div className="flex items-center justify-end gap-4">
                <form
                  action={async () => {
                    "use server";
                    await signIn("discord");
                  }}
                >
                  <button type="submit">Sign In</button>
                </form>
              </div>
            )}
          </div>
        </header>
        <main className="container m-auto p-4 text-center">
          {user ? children : <div>Please sign in.</div>}
        </main>
      </body>
    </html>
  );
}
