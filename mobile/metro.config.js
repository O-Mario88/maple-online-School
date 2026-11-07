// Metro config: Expo's defaults, plus two resolver rules.
//
// 1. Mock data stays out of deployment builds. Expo only inlines EXPO_PUBLIC_*
//    variables that are set, so with EXPO_PUBLIC_MOCK_DATA and EXPO_PUBLIC_DESIGN_DATA
//    unset the `require('@/mock')` in src/lib/mock.ts survives minification and would
//    bundle every fixture. Here the bundler resolves `@/mock` to an empty module unless
//    one of them is 'true'. `npm run check:no-mock` proves it.
//
// 2. Inter is the app's font on every device. The app's own `import … from 'react-native'`
//    (in src/) resolves to src/lib/fonts/react-native.js, which is React Native with a Text
//    and TextInput that start in Inter and take Maple's heading, subheading and body weights.
//    On the web, Expo rewrites `import { Text } from 'react-native'` into react-native-web's own
//    Text and TextInput files, so those two land on small files that re-export the same wrappers.
//    Libraries in node_modules, and the files in src/lib/fonts, get React Native untouched.
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const mockEnabled = process.env.EXPO_PUBLIC_MOCK_DATA === 'true' || process.env.EXPO_PUBLIC_DESIGN_DATA === 'true';
const SRC = path.join(__dirname, 'src') + path.sep;
const FONTS = path.join(__dirname, 'src', 'lib', 'fonts');
const TYPE_SHIM = path.join(FONTS, 'react-native.js');
const WEB_TEXT = {
  'react-native-web/dist/exports/Text': path.join(FONTS, 'web-text.tsx'),
  'react-native-web/dist/exports/TextInput': path.join(FONTS, 'web-text-input.tsx'),
};

const upstream = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolve = upstream ?? context.resolveRequest;
  if (!mockEnabled && (moduleName === '@/mock' || moduleName.startsWith('@/mock/'))) {
    return { type: 'empty' };
  }
  const origin = context.originModulePath;
  const appCode = origin.startsWith(SRC) && !origin.startsWith(FONTS);
  if (appCode && (moduleName === 'react-native' || moduleName === 'react-native-web')) {
    return resolve(context, TYPE_SHIM, platform);
  }
  if (appCode && WEB_TEXT[moduleName]) {
    return resolve(context, WEB_TEXT[moduleName], platform);
  }
  return resolve(context, moduleName, platform);
};

module.exports = config;
