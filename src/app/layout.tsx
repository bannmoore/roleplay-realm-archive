import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { getCurrentUser } from "@/api/database";
import { cookies } from "next/headers";

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
  const token = (await cookies()).get("token")?.value;

  if (token) {
    user = await getCurrentUser(token);
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="container m-auto flex p-4">
          <Link href="/">Roleplay Realm Archive</Link>
          <div className="flex-1 text-right">{user?.discord_username}</div>
        </header>
        <main className="container m-auto p-4 text-center">{children}</main>
      </body>
    </html>
  );
}
