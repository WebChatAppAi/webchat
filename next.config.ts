import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    // See https://webpack.js.org/configuration/resolve/#resolvefallback
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback, // Spread existing fallbacks
        fs: false, // fs module is not available in the browser
        // Add other Node.js core modules you might want to ignore here as well if they cause issues
        // For pdf-parse, 'net' and 'tls' might also be indirectly referenced by dependencies,
        // though 'fs' is the most common one for this library's direct usage.
        net: false,
        tls: false,
        // 'async_hooks' might be another one depending on pdf.js version or other deps
        async_hooks: false,
      };
    }
    return config;
  },
};

export default nextConfig;
