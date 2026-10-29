/**
 * Holds the signed-in session: a short-lived access token in memory and the
 * refresh token in the platform's secure store. Every API request goes through
 * `fetch`, which adds the access token and, when it has expired, refreshes it
 * once (shared by all requests in flight) and retries.
 */

export interface TokenStore {
  getRefreshToken(): Promise<string | null>;
  setRefreshToken(token: string | null): Promise<void>;
}

type FetchFn = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export interface SessionOptions {
  baseUrl: string;
  store: TokenStore;
  fetchFn?: FetchFn;
  /** Called when the session ends without the user asking (refresh rejected). */
  onSignedOut?: () => void;
}

interface TokenPair {
  access: string;
  refresh: string;
}

const UNAUTHORIZED = 401;

export class SessionManager {
  private access: string | null = null;
  private refreshing: Promise<boolean> | null = null;
  private readonly baseUrl: string;
  private readonly store: TokenStore;
  private readonly fetchFn: FetchFn;
  private readonly onSignedOut?: () => void;

  constructor(opts: SessionOptions) {
    this.baseUrl = opts.baseUrl.replace(/\/$/, '');
    this.store = opts.store;
    this.fetchFn = opts.fetchFn ?? ((input, init) => fetch(input, init));
    this.onSignedOut = opts.onSignedOut;
  }

  hasSession(): boolean {
    return this.access !== null;
  }

  /** Signs in, or throws an Error whose message is safe to show the user. */
  async signIn(email: string, password: string): Promise<void> {
    const res = await this.post('/api/v1/auth/token/', { email, password });
    if (!res.ok) {
      throw new Error(await errorMessage(res, 'Could not sign in. Please try again.'));
    }
    await this.accept((await res.json()) as TokenPair);
  }

  /** Restores a session from the stored refresh token. Returns whether it worked. */
  async restore(): Promise<boolean> {
    return this.refresh();
  }

  /** Ends the session on this device and revokes the refresh token on the server. */
  async signOut(): Promise<void> {
    const refresh = await this.store.getRefreshToken();
    await this.clear();
    if (refresh) {
      try {
        await this.post('/api/v1/auth/logout/', { refresh });
      } catch {
        // Offline: the token is already gone from this device and expires on its own.
      }
    }
  }

  /** Sends an authenticated request, refreshing the access token once if needed. */
  async fetch(request: Request): Promise<Response> {
    const retry = request.clone();
    const usedToken = this.access;
    const res = await this.fetchFn(withBearer(request, usedToken));
    if (res.status !== UNAUTHORIZED || usedToken === null) {
      return res;
    }
    // Another request may already have refreshed while this one was in flight.
    const ok = this.access !== usedToken ? this.access !== null : await this.refresh();
    if (!ok) {
      return res;
    }
    return this.fetchFn(withBearer(retry, this.access));
  }

  private refresh(): Promise<boolean> {
    this.refreshing ??= this.doRefresh().finally(() => {
      this.refreshing = null;
    });
    return this.refreshing;
  }

  private async doRefresh(): Promise<boolean> {
    const refresh = await this.store.getRefreshToken();
    if (!refresh) {
      return false;
    }
    let res: Response;
    try {
      res = await this.post('/api/v1/auth/token/refresh/', { refresh });
    } catch {
      return false; // Offline: keep the stored token and try again later.
    }
    if (!res.ok) {
      const hadSession = this.access !== null;
      await this.clear();
      if (hadSession) {
        this.onSignedOut?.();
      }
      return false;
    }
    await this.accept((await res.json()) as TokenPair);
    return true;
  }

  private async accept(pair: TokenPair): Promise<void> {
    this.access = pair.access;
    await this.store.setRefreshToken(pair.refresh);
  }

  private async clear(): Promise<void> {
    this.access = null;
    await this.store.setRefreshToken(null);
  }

  private post(path: string, body: unknown): Promise<Response> {
    return this.fetchFn(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }
}

function withBearer(request: Request, token: string | null): Request {
  if (!token) {
    return request;
  }
  const headers = new Headers(request.headers);
  headers.set('Authorization', `Bearer ${token}`);
  return new Request(request, { headers });
}

async function errorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = (await res.json()) as { detail?: unknown };
    return typeof body.detail === 'string' && body.detail ? body.detail : fallback;
  } catch {
    return fallback;
  }
}
