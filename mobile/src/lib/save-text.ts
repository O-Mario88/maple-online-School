import { Platform, Share } from 'react-native';

type WebDoc = { createElement: (t: 'a') => { href: string; download: string; click: () => void } };
type WebUrl = { createObjectURL: (b: unknown) => string; revokeObjectURL: (u: string) => void };
type BlobCtor = new (parts: string[], opts: { type: string }) => unknown;

/** Saves text as a file: a download on the web, the share sheet on phones. */
export function saveText(name: string, text: string, type = 'text/plain'): void {
  const g = globalThis as unknown as { document?: WebDoc; URL?: WebUrl; Blob?: BlobCtor };
  if (Platform.OS === 'web' && g.document && g.URL && g.Blob) {
    const url = g.URL.createObjectURL(new g.Blob([text], { type }));
    const a = g.document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    g.URL.revokeObjectURL(url);
    return;
  }
  Share.share({ message: text, title: name }).catch(() => undefined);
}

/** Opens the share sheet (or the browser's) with a message; failures are ignored. */
export function shareText(message: string): void {
  Share.share({ message }).catch(() => undefined);
}

/** Shares the page being viewed: the message plus its link on the web. */
export function sharePage(message: string): void {
  const href = (globalThis as unknown as { location?: { href?: string } }).location?.href;
  shareText(href && Platform.OS === 'web' ? `${message} ${href}` : message);
}
