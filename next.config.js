const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Use NodePolyfillPlugin for comprehensive Node.js polyfills
      config.plugins.push(new NodePolyfillPlugin({
        excludeAliases: ['console'],
      }));
      
      // Additional fallbacks
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
      
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
