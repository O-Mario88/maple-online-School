import { advanceIncident, apiHealth, classQuality, type Incident, poolHealth, retryFailed, severityCounts } from './ops';

describe('apiHealth', () => {
  test('rates p95 latency as healthy, degraded or down', () => {
    expect(apiHealth(98)).toBe('Healthy');
    expect(apiHealth(220)).toBe('Degraded');
    expect(apiHealth(900)).toBe('Down');
  });
});

describe('poolHealth', () => {
  test('warns when the connection pool is more than 80% used', () => {
    expect(poolHealth(12, 20)).toBe('Healthy');
    expect(poolHealth(17, 20)).toBe('Warning');
  });
});

describe('classQuality', () => {
  test('rates a live room from round-trip time and packet loss', () => {
    expect(classQuality(86, 0.4)).toBe('Good');
    expect(classQuality(210, 1.5)).toBe('Fair');
    expect(classQuality(420, 5)).toBe('Poor');
  });
});

describe('incidents', () => {
  const inc = (over: Partial<Incident> = {}): Incident => ({ id: 'I1', severity: 'Warning', status: 'Investigating', ...over });

  test('move from investigating to monitoring to resolved', () => {
    const m = advanceIncident(inc());
    expect(m.status).toBe('Monitoring');
    expect(advanceIncident(m).status).toBe('Resolved');
    expect(advanceIncident(inc({ status: 'Resolved' })).status).toBe('Resolved');
  });

  test('counts by severity, with resolved ones left out of the open count', () => {
    const c = severityCounts([inc(), inc({ id: 'I2', severity: 'Info', status: 'Resolved' }), inc({ id: 'I3', severity: 'Critical' })]);
    expect(c).toEqual({ all: 3, Critical: 1, Warning: 1, Info: 1, open: 2 });
  });
});

describe('retryFailed', () => {
  test('puts failed jobs back in the pending queue', () => {
    expect(retryFailed({ pending: 312, failed: 7 })).toEqual({ pending: 319, failed: 0 });
  });
});
