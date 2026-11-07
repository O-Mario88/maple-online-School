/**
 * The app's own `react-native` on iOS and Android: React Native as it is, except Text and
 * TextInput, which come from ./text (Inter, with Maple's heading, subheading and body weights).
 * metro.config.js resolves the app's `import … from 'react-native'` (in src/) here.
 *
 * Every export is looked up only when it's used. Re-exporting everything (`export *`) would
 * touch every React Native getter when the module loads or Fast Refresh reads its exports,
 * including removed ones such as PushNotificationIOS that throw in Expo Go. Only Text and
 * TextInput are listed as this module's own exports.
 */
const ReactNative = require('react-native');
const { Text, TextInput } = require('./text');

const OWN = { Text, TextInput };

module.exports = new Proxy(
  {},
  {
    get: (_, key) => (key === '__esModule' ? true : key in OWN ? OWN[key] : ReactNative[key]),
    has: (_, key) => key in OWN || key in ReactNative,
    ownKeys: () => Object.keys(OWN),
    getOwnPropertyDescriptor: (_, key) => (key in OWN ? { value: OWN[key], enumerable: true, configurable: true } : undefined),
  },
);
