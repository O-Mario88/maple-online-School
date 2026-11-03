/** Health rules behind System Operations: API latency, the database pool, live rooms and incidents. */

export type Health = 'Healthy' | 'Degraded' | 'Down';

/** p95 latency limits, in milliseconds. */
const HEALTHY_MS = 150;
const DEGRADED_MS = 400;

export function apiHealth(p95: number): Health {
  if (p95 < HEALTHY_MS) return 'Healthy';
  return p95 < DEGRADED_MS ? 'Degraded' : 'Down';
}

/** A pool fuller than this needs attention before connections start queueing. */
const POOL_WARN = 0.8;

export function poolHealth(active: number, max: number): 'Healthy' | 'Warning' {
  return active / max > POOL_WARN ? 'Warning' : 'Healthy';
}

export type Quality = 'Good' | 'Fair' | 'Poor';

/** A live room's quality from round-trip time (ms) and packet loss (%). */
export function classQuality(rttMs: number, lossPct: number): Quality {
  if (rttMs < HEALTHY_MS && lossPct < 1) return 'Good';
  if (rttMs < 300 && lossPct < 3) return 'Fair';
  return 'Poor';
}

export type Severity = 'Critical' | 'Warning' | 'Info';
export type IncidentStatus = 'Investigating' | 'Monitoring' | 'Resolved';

export interface Incident {
  id: string;
  severity: Severity;
  status: IncidentStatus;
}

const NEXT: Readonly<Record<IncidentStatus, IncidentStatus>> = { Investigating: 'Monitoring', Monitoring: 'Resolved', Resolved: 'Resolved' };

/** Move an incident to its next step; resolved stays resolved. */
export function advanceIncident<T extends Incident>(i: T): T {
  return { ...i, status: NEXT[i.status] };
}

export function severityCounts(list: readonly Incident[]): { all: number; Critical: number; Warning: number; Info: number; open: number } {
  const by = (s: Severity) => list.filter((i) => i.severity === s).length;
  return { all: list.length, Critical: by('Critical'), Warning: by('Warning'), Info: by('Info'), open: list.filter((i) => i.status !== 'Resolved').length };
}

/** Requeue every failed job. */
export function retryFailed(q: { pending: number; failed: number }): { pending: number; failed: number } {
  return { pending: q.pending + q.failed, failed: 0 };
}
