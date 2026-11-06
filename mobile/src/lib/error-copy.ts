/** What an error boundary says: plain words for people, the message only for developers. */
export interface ErrorCopy {
  title: string;
  body: string;
  /** The raw error message, shown only in development builds. */
  detail: string | null;
}

export function errorCopy(error: unknown, dev: boolean): ErrorCopy {
  const message = error instanceof Error ? error.message : String(error);
  return {
    title: "This page couldn't load",
    body: 'Try again, or go back to your home page. Your other pages are still open.',
    detail: dev ? message : null,
  };
}
