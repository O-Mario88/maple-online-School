import type { ScanMode, ScanPerson, ScanResult } from '@/mock/school-admin';

/** How many scans the recent-scans queue keeps. */
const LOG_LIMIT = 12;

export interface ScanLog {
  key: string;
  person: ScanPerson;
  mode: ScanMode;
  result: ScanResult;
  message: string;
  time: string;
  synced: boolean;
  duplicate: boolean;
}

export interface ScanState {
  mode: ScanMode;
  /** Which badge in the sample queue the next scan reads. */
  next: number;
  log: readonly ScanLog[];
  offline: boolean;
}

export type ScanAction =
  | { type: 'scan'; queue: readonly ScanPerson[]; at: Date; again?: boolean }
  | { type: 'mode'; mode: ScanMode }
  | { type: 'offline' }
  | { type: 'sync' };

export const initialScanState: ScanState = { mode: 'Gate Entry', next: 0, log: [], offline: false };

/** What a scan means in each mode: a late arrival at the gate is late for the day, at an exit it's an early leaver. */
function verdict(p: ScanPerson, mode: ScanMode): { result: ScanResult; message: string } {
  if (p.result === 'denied') return { result: 'denied', message: p.message };
  if (mode === 'Gate Exit') {
    return p.kind === 'Student' && p.result === 'late'
      ? { result: 'late', message: 'Leaving before 4:30 PM • No early-departure note • Parent alerted' }
      : { result: 'ok', message: 'Checked out • Parent notified' };
  }
  if (mode === 'Lesson Check') {
    if (p.kind === 'Student') return { result: 'ok', message: 'Marked present in P5A English' };
    return { result: p.result, message: p.result === 'late' ? p.message : 'Lesson started on time • P5 English, Room 4' };
  }
  return { result: p.result, message: p.message };
}

function readBadge(state: ScanState, queue: readonly ScanPerson[], at: Date, again: boolean): ScanState {
  const previous = state.log[0];
  const rescan = again && previous !== undefined;
  const person = rescan ? previous.person : queue[state.next % queue.length];
  if (!person) return state;
  const duplicate = state.log.some((x) => x.person.id === person.id && x.mode === state.mode);
  const v = verdict(person, state.mode);
  const entry: ScanLog = {
    key: `${at.getTime()}-${person.id}-${state.log.length}`,
    person,
    mode: state.mode,
    // A revoked badge is refused however many times it is scanned.
    result: duplicate && v.result !== 'denied' ? 'late' : v.result,
    message: duplicate && v.result !== 'denied' ? `Already scanned for ${state.mode.toLowerCase()} • Not counted twice` : v.message,
    time: at.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    synced: !state.offline,
    duplicate,
  };
  return { ...state, next: rescan ? state.next : state.next + 1, log: [entry, ...state.log].slice(0, LOG_LIMIT) };
}

/**
 * The scanner's state. Every change goes through here so that scans made faster than the screen
 * redraws still read the next badge and still see the scans before them.
 */
export function scanReducer(state: ScanState, action: ScanAction): ScanState {
  switch (action.type) {
    case 'scan':
      return readBadge(state, action.queue, action.at, action.again ?? false);
    case 'mode':
      return { ...state, mode: action.mode };
    case 'offline':
      return { ...state, offline: true };
    case 'sync':
      return { ...state, offline: false, log: state.log.map((x) => ({ ...x, synced: true })) };
  }
}
