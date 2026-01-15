const webpack = require('webpack');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Handle Node.js polyfills for Solana/Lazorkit
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
        process: require.resolve('process/browser'),
      };
      
      // Provide global polyfills
      config.plugins.push(
        new webpack.ProvidePlugin({
          global: ['globalthis', 'globalThis'],
          Buffer: ['buffer', 'Buffer'],
          process: ['process', 'default'],
        })
      );
      
      // Define global for browser
      config.plugins.push(
        new webpack.DefinePlugin({
          'global': 'globalThis',
        })
      );
    }
    
    return config;
  },
};

module.exports = nextConfig;

