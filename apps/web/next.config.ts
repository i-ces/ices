import type { NextConfig } from "next";
import path from "node:path";

// Configure Turbopack root explicitly & enable standalone output for production container
const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname, "..", "..", ".."), // monorepo root
  },
  output: "standalone",
};

export default nextConfig;
