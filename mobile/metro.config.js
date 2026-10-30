// Metro config: Expo's defaults, plus one rule that keeps mock data out of
// deployment builds.
//
// Expo only inlines EXPO_PUBLIC_* variables that are set, so with
// EXPO_PUBLIC_MOCK_DATA unset the `require('@/mock')` in src/lib/mock.ts
// survives minification and would bundle every fixture. Here the bundler
// resolves `@/mock` to an empty module unless the variable is 'true'.
// `npm run check:no-mock` proves it.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const mockEnabled = process.env.EXPO_PUBLIC_MOCK_DATA === 'true';

if (!mockEnabled) {
  const upstream = config.resolver.resolveRequest;
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (moduleName === '@/mock' || moduleName.startsWith('@/mock/')) {
      return { type: 'empty' };
    }
    return (upstream ?? context.resolveRequest)(context, moduleName, platform);
  };
}

module.exports = config;
