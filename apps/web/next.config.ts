import type { NextConfig } from "next";
import path from "node:path";

// Configure Turbopack root explicitly to silence multi-lockfile warning
const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname, "..", "..", ".."), // monorepo root
  },
};

export default nextConfig;
