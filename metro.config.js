const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add extraNodeModules for problematic Node.js core modules
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules, // Preserve existing extraNodeModules
  stream: require.resolve('readable-stream'),     // Polyfill for 'stream'
  http: require.resolve('stream-http'),           // Polyfill for Node's 'http' module
  https: require.resolve('https-browserify'),     // Polyfill for Node's 'https' module
  // You might also need 'net' if that error pops up later, but let's do one by one:
  // net: require.resolve('react-native-tcp'),
  // For potentially problematic native modules in 'ws' or other packages:
  // crypto: require.resolve('crypto-browserify'), // Example if 'crypto' fails
  // util: require.resolve('util/'),              // Example if 'util' fails
};

module.exports = config;