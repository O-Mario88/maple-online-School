import type { ScanPerson } from '@/mock/school-admin';

import { initialScanState, scanReducer, type ScanState } from './scanState';

const person = (id: string, result: ScanPerson['result'], kind: ScanPerson['kind'] = 'Student'): ScanPerson => ({
  id,
  name: `Person ${id}`,
  detail: 'Primary 4A',
  kind,
  avatar: 0 as unknown as ScanPerson['avatar'],
  result,
  message: `${id} message`,
});

const queue = [person('a', 'ok'), person('b', 'late'), person('c', 'denied')];
const at = new Date(2026, 2, 10, 7, 18);
const scan = (s: ScanState, again = false) => scanReducer(s, { type: 'scan', queue, at, again });

describe('scanReducer', () => {
  test('reads the next badge in turn on each scan, even when scans come faster than renders', () => {
    const s = scan(scan(scan(initialScanState)));

    expect(s.log.map((x) => x.person.id)).toEqual(['c', 'b', 'a']);
    expect(s.log.map((x) => x.result)).toEqual(['denied', 'late', 'ok']);
  });

  test('flags a second scan of the same badge in the same mode instead of counting it twice', () => {
    const s = scan(scan(initialScanState), true);

    expect(s.log).toHaveLength(2);
    expect(s.log[0].person.id).toBe('a');
    expect(s.log[0].duplicate).toBe(true);
    expect(s.log[0].message).toMatch(/not counted twice/i);
  });

  test('the same badge in a different mode is not a duplicate', () => {
    const entry = scan(initialScanState);
    const s = scan(scanReducer(entry, { type: 'mode', mode: 'Gate Exit' }), true);

    expect(s.log[0].duplicate).toBe(false);
    expect(s.log[0].mode).toBe('Gate Exit');
  });

  test('queues scans while offline and marks them all synced on sync', () => {
    const offline = scan(scan(scanReducer(initialScanState, { type: 'offline' })));
    expect(offline.log.filter((x) => !x.synced)).toHaveLength(2);

    const synced = scanReducer(offline, { type: 'sync' });
    expect(synced.offline).toBe(false);
    expect(synced.log.every((x) => x.synced)).toBe(true);
  });

  test('a revoked badge stays not allowed in every mode', () => {
    const exit = scanReducer(initialScanState, { type: 'mode', mode: 'Gate Exit' });
    const s = scanReducer({ ...exit, next: 2 }, { type: 'scan', queue, at });

    expect(s.log[0].result).toBe('denied');
  });
});
