import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // /shop renders per-request (filter searchParams), so make sure the MDX
  // content files are traced into its serverless bundle on Vercel.
  outputFileTracingIncludes: {
    "/shop": ["./content/**/*"],
  },
  async redirects() {
    return [
      {
        source: "/shop/desk-fidget-puck",
        destination: "/shop/strawberry-button-fidget",
        permanent: true,
      },
      {
        source: "/shop/everyday-charm-hanger",
        destination: "/shop/cloud-slide-mini-case",
        permanent: true,
      },
      {
        source: "/shop/magblock-hub-module",
        destination: "/shop/mushroom-spinner-desk-buddy",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
