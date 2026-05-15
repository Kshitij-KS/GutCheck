import type { NextConfig } from "next";
import path from "path";

// Pin Turbopack root: if a lockfile exists in a parent directory (e.g.
// C:\Users\<you>\package-lock.json), Next can infer the wrong workspace root,
// which can break `/api/*` and make `/api/auth/session` return HTML — triggering
// next-auth CLIENT_FETCH_ERROR ("<!DOCTYPE..." is not valid JSON).
// Always run `next dev` / `next build` from this repo root. If the warning
// persists, remove the unrelated parent lockfile or set root to an absolute path.
const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['pdf-parse'],
  turbopack: {
    root: path.resolve(process.cwd()),
  },
};

export default nextConfig;
