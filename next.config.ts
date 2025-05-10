import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        port: "",
        pathname: "/icons/**",
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        port: "",
        pathname: "/attachments/**",
      },
      {
        protocol: "https",
        hostname: "roleplay-realm-archive-storage.sfo3.digitaloceanspaces.com",
        port: "",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
