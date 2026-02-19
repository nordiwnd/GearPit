import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_URL || "http://gearpit-core:3000"}/:path*`,
      },
      // If backend routes don't start with /api, we might need to map root.
      // But my router.rs routes are like /gears, /kits, /loadouts.
      // So I map /api/gears -> http://backend/gears
      // That means frontend uses /api/gears.
      // Backend routes are root-level: .route("/gears", ...)
      // So destination should be `.../:path*`. Correct.
    ];
  },
};

export default nextConfig;
