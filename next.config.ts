import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  webpack: (config, { isServer, nextRuntime, dev }) => {
    // Apply stubs for client-side AND Edge Runtime, but ONLY in production build
    if ((!isServer || nextRuntime === 'edge') && !dev) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        'fs/promises': false,
        path: false,
        stream: false,
        crypto: false,
        child_process: false,
        net: false,
        tls: false,
        dns: false,
        http: false,
        https: false,
        zlib: false,
        os: false,
        url: false,
        constants: false,
        punycode: false,
        tty: false,
      };
    }
    return config;
  },
};


export default nextConfig;
