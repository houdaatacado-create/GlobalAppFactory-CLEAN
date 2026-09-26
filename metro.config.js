const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// cacheVersion forces a one-time clean cache namespace when packages are added.
// Unlike resetCache:true, this does NOT wipe the cache on every restart.
config.cacheVersion = '20260925-5';

module.exports = config;
