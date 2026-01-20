import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { signIn, signOut } from "@/auth";
import { checkAuthenticated } from "@/util";
import { AlertProvider } from "./components/AlertContext";
import { config } from "@/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title:
    "Roleplay Realm Archive" + (config.env === "development" ? " [DEV]" : ""),
  description: "",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await checkAuthenticated();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="container m-auto flex p-4 items-center">
          <Link href="/" className="text-lg">
            Roleplay Realm Archive
          </Link>
          <nav className="ml-6">
            {user?.isAdmin && (
              <Link href="/admin" className="mr-4">
                Admin
              </Link>
            )}
          </nav>
          <div className="flex-1">
            {user && (
              <div className="flex items-center justify-end gap-4">
                <div>{user?.discordUsername}</div>
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
        <main className="container m-auto p-4">
          <AlertProvider>
            {user ? children : <div>Please sign in.</div>}
          </AlertProvider>
        </main>
      </body>
    </html>
  );
}
