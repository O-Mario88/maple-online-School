import { SessionManager, type TokenStore } from './session';

class MemoryStore implements TokenStore {
  value: string | null = null;
  async getRefreshToken() {
    return this.value;
  }
  async setRefreshToken(token: string | null) {
    this.value = token;
  }
}

type Handler = (req: Request) => Response | Promise<Response>;

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function setup(handler: Handler) {
  const store = new MemoryStore();
  const calls: Request[] = [];
  const fetchFn = async (input: RequestInfo | URL, init?: RequestInit) => {
    const req = input instanceof Request ? input : new Request(input, init);
    calls.push(req.clone());
    return handler(req);
  };
  const onSignedOut = jest.fn();
  const session = new SessionManager({ baseUrl: 'http://api.test', store, fetchFn, onSignedOut });
  return { session, store, calls, onSignedOut };
}

const path = (req: Request) => new URL(req.url).pathname;

describe('SessionManager', () => {
  it('stores the refresh token after signing in', async () => {
    const { session, store } = setup(() => json(200, { access: 'a1', refresh: 'r1' }));

    await session.signIn('student.a@pilot.maple', 'PilotPass!');

    expect(store.value).toBe('r1');
    expect(session.hasSession()).toBe(true);
  });

  it('turns a 401 on sign-in into a readable error', async () => {
    const { session, store } = setup(() =>
      json(401, { detail: 'No active account found with the given credentials' }),
    );

    await expect(session.signIn('x@y.z', 'nope')).rejects.toThrow('No active account found with the given credentials');
    expect(store.value).toBeNull();
  });

  it('refreshes once and retries when the access token has expired', async () => {
    let meCalls = 0;
    const { session, calls } = setup(async (req) => {
      if (path(req) === '/api/v1/auth/token/') return json(200, { access: 'old', refresh: 'r1' });
      if (path(req) === '/api/v1/auth/token/refresh/') return json(200, { access: 'new', refresh: 'r2' });
      meCalls += 1;
      return req.headers.get('Authorization') === 'Bearer new' ? json(200, { ok: true }) : json(401, {});
    });
    await session.signIn('a@b.c', 'pw');

    const [first, second] = await Promise.all([
      session.fetch(new Request('http://api.test/api/v1/auth/me/')),
      session.fetch(new Request('http://api.test/api/v1/auth/me/')),
    ]);

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(calls.filter((c) => path(c) === '/api/v1/auth/token/refresh/')).toHaveLength(1);
    expect(meCalls).toBe(4);
  });

  it('signs out when the refresh token is rejected', async () => {
    const { session, store, onSignedOut } = setup(async (req) => {
      if (path(req) === '/api/v1/auth/token/') return json(200, { access: 'old', refresh: 'r1' });
      if (path(req) === '/api/v1/auth/token/refresh/') return json(401, { detail: 'Token is invalid or expired' });
      return json(401, {});
    });
    await session.signIn('a@b.c', 'pw');

    const res = await session.fetch(new Request('http://api.test/api/v1/auth/me/'));

    expect(res.status).toBe(401);
    expect(store.value).toBeNull();
    expect(onSignedOut).toHaveBeenCalledTimes(1);
  });

  it('restores a session from the stored refresh token', async () => {
    const { session, store } = setup(async (req) =>
      path(req) === '/api/v1/auth/token/refresh/' ? json(200, { access: 'a2', refresh: 'r2' }) : json(200, {}),
    );
    store.value = 'r1';

    expect(await session.restore()).toBe(true);
    expect(store.value).toBe('r2');
  });

  it('revokes the refresh token on sign out, even if the network fails', async () => {
    const { session, store, calls } = setup(async (req) => {
      if (path(req) === '/api/v1/auth/token/') return json(200, { access: 'a1', refresh: 'r1' });
      throw new Error('offline');
    });
    await session.signIn('a@b.c', 'pw');

    await session.signOut();

    expect(calls.some((c) => path(c) === '/api/v1/auth/logout/')).toBe(true);
    expect(store.value).toBeNull();
    expect(session.hasSession()).toBe(false);
  });
});
