import type { NextConfig } from "next";
import { hostname } from "os";

const nextConfig: NextConfig = {
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
