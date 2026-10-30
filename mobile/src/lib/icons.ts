/**
 * The icons Maple uses, named once. Each has an SF Symbol (iOS) and a
 * Material Symbol (Android and web), drawn by expo-symbols.
 */
export const ICONS = {
  home: { ios: 'house', material: 'home' },
  play: { ios: 'play.rectangle', material: 'play_circle' },
  library: { ios: 'books.vertical', material: 'local_library' },
  map: { ios: 'map', material: 'map' },
  wallet: { ios: 'creditcard', material: 'account_balance_wallet' },
  school: { ios: 'building.columns', material: 'account_balance' },
  chart: { ios: 'chart.bar', material: 'bar_chart' },
  people: { ios: 'person.2', material: 'group' },
  person: { ios: 'person.crop.circle', material: 'account_circle' },
  calendar: { ios: 'calendar', material: 'calendar_month' },
  clipboard: { ios: 'list.clipboard', material: 'assignment' },
  check: { ios: 'checkmark.circle', material: 'check_circle' },
  alert: { ios: 'exclamationmark.triangle', material: 'warning' },
  info: { ios: 'info.circle', material: 'info' },
  bell: { ios: 'bell', material: 'notifications' },
  search: { ios: 'magnifyingglass', material: 'search' },
  plus: { ios: 'plus', material: 'add' },
  chevronRight: { ios: 'chevron.right', material: 'chevron_right' },
  chevronLeft: { ios: 'chevron.left', material: 'chevron_left' },
  chevronDown: { ios: 'chevron.down', material: 'expand_more' },
  swap: { ios: 'arrow.left.arrow.right', material: 'swap_horiz' },
  logout: { ios: 'rectangle.portrait.and.arrow.right', material: 'logout' },
  sparkle: { ios: 'sparkles', material: 'auto_awesome' },
  cloud: { ios: 'checkmark.icloud', material: 'cloud_done' },
  live: { ios: 'dot.radiowaves.left.and.right', material: 'sensors' },
  book: { ios: 'book', material: 'menu_book' },
  flag: { ios: 'flag', material: 'flag' },
  chat: { ios: 'bubble.left.and.bubble.right', material: 'forum' },
} as const;

export type IconName = keyof typeof ICONS;
