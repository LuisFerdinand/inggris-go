import type { NextConfig } from "next";

// Old program URLs that used to be served from hard-coded content.
// Renamed programs go to their new page; retired adult programs go to the
// category listing.
const LEGACY_PROGRAM_REDIRECTS: {
  source: string;
  destination: string;
  permanent: boolean;
}[] = [
  {
    source: "/programs/offline/vip-kids",
    destination: "/programs/offline/vip-english-for-kids",
    permanent: true,
  },
  {
    source: "/programs/offline/rombongan",
    destination: "/programs/offline/kelas-rombongan",
    permanent: true,
  },
  {
    source: "/programs/online/private-class-kids",
    destination: "/programs/online/private-class-for-kids",
    permanent: true,
  },
  {
    source: "/programs/online/daily-conversation",
    destination: "/programs",
    permanent: false, // retired program
  },
  {
    source: "/programs/online/private-class",
    destination: "/programs",
    permanent: false, // retired program
  },
];

const nextConfig: NextConfig = {
  async redirects() {
    return LEGACY_PROGRAM_REDIRECTS;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatar.vercel.sh",
      },
      {
        protocol: "https",
        hostname: "q1irs9l4ex.ufs.sh",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      }
    ],
  },
};

export default nextConfig;
