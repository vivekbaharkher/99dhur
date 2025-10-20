/** @type {import('next').NextConfig} */
const path = require("path");
const fs = require("fs");

const nextConfig = {
  reactStrictMode: false,
  experimental: {
    scrollRestoration: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ebroker.wrteam.me",
        // port: '',
        pathname: "**",
        // search: '',
      },
    ],

    unoptimized: true,
  },
  trailingSlash: true,
  devIndicators: {
    buildActivity: false,
  },
};
if (process.env.NEXT_PUBLIC_SEO === "false") {
  nextConfig.output = "export";
  nextConfig.exportPathMap = async (
    defaultPathMap,
    { dev, dir, outDir, distDir, buildId },
  ) => {
    if (dir && outDir && fs.existsSync(path.join(dir, ".htaccess"))) {
      fs.copyFileSync(
        path.join(dir, ".htaccess"),
        path.join(outDir, ".htaccess"),
      );
    } else {
    }
    return defaultPathMap;
  };
}
module.exports = nextConfig;
