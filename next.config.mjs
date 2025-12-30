/* eslint-env node */
/* global process */
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  turbopack: {},
  basePath: '',
  trailingSlash: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'geralddagher.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/vi/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'static.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: 'cms.geralddagher.com',
      },
      {
        protocol: 'https',
        hostname: 'sample-videos.com',
      },

      {
        protocol: 'https',
        hostname: '167.99.174.79',
        pathname: '/v1/storage/buckets/**',
      },
      {
        protocol: 'http',
        hostname: '167.99.174.79',
        pathname: '/v1/storage/buckets/**',
      },
      {
        protocol: 'https',
        hostname: 'cloud.appwrite.io',
        pathname: '/v1/storage/buckets/**',
      },

      {
        protocol: 'https',
        hostname: 'sifrfvxpicitbjdjntuk.supabase.co',
        pathname: '/storage/v1/object/public/author-avatars/**',
      },
      {
        protocol: 'https',
        hostname: 'appwrite.geralddagher.com',
        pathname: '/v1/storage/buckets/**',
      },
      {
        protocol: 'http',
        hostname: 'appwrite.geralddagher.com',
        pathname: '/v1/storage/buckets/**',
      },

      {
        protocol: 'https',
        hostname: '*.digitaloceanspaces.com',
      },
      {
        protocol: 'https',
        hostname: '*.cdn.digitaloceanspaces.com',
      },
    ],
    minimumCacheTTL: 3600,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        process: require.resolve('process/browser'),
        stream: require.resolve('stream-browserify'),
        util: require.resolve('util'),
        buffer: require.resolve('buffer/'),
        crypto: require.resolve('crypto-browserify'),
        path: require.resolve('path-browserify'),
        fs: false,
        net: false,
        tls: false,
        dns: false,
        zlib: false,
        http: false,
        https: false,
        os: false,
      };

      const webpack = require('webpack');
      config.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        })
      );
    }

    config.module.exprContextCritical = false;

    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    });

    return config;
  },
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
      bodySizeLimit: '20mb',
    },
  },
  output: 'standalone',
  async rewrites() {
    return [];
  },
  async redirects() {
    return [];
  },
  productionBrowserSourceMaps: false,
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

export default withBundleAnalyzer(nextConfig); 