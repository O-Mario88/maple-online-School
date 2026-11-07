/** Maple Command › System Operations, LiveKit Health & River Job Queues sample data (last 24 hours). */
import type { Incident } from '@/features/command/logic/ops';

import { type KpiData, wave } from './shared';
import { Maple } from '@/constants/maple';

export const stats: readonly KpiData[] = [
  { label: 'Platform Status', value: 'Operational', caption: 'All systems healthy', icon: 'check', tone: 'green', valueTone: 'green' },
  { label: 'Go API Latency (p95)', value: '98 ms', delta: '32%', down: true, good: true, caption: 'vs. previous 24h', icon: 'globe', tone: 'blue' },
  { label: 'PostgreSQL', value: 'Healthy', caption: '12 / 20 connections', icon: 'database', tone: 'green', valueTone: 'green' },
  { label: 'River Job Queues', value: '24,810', delta: '18%', caption: 'jobs processed (24h)', icon: 'people', tone: 'purple' },
  { label: 'LiveKit (WebRTC)', value: 'Healthy', caption: '1,248 live rooms', icon: 'video', tone: 'blue', valueTone: 'green' },
  { label: 'Active Incidents', value: '0', caption: 'No open incidents', icon: 'alert', tone: 'orange' },
];

const N = 48;
/** Axis labels every 4 hours; the blank last slot puts 20:00 where it belongs instead of at the edge. */
export const hours = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', ''];
/** Latency by percentile, every 30 minutes. */
export const latency = {
  p50: wave(N, 52, 48, 6, 0.2).map((v) => Math.round(v)),
  p95: wave(N, 96, 92, 14, 1.4).map((v) => Math.round(v)),
  p99: wave(N, 190, 175, 28, 2.1).map((v) => Math.round(v)),
};
export const throughput = wave(24, 1600, 2700, 140, 0.7).map((v) => Math.round(v));
export const errorRate = wave(24, 0.55, 0.45, 0.12, 1.9);

export const pg = { active: 12, max: 20, pool: 42, queryMs: 1.2, lag: 0 };
export const connections = {
  active: wave(N, 9, 11, 2.2, 0.4).map((v) => Math.max(1, v)),
  idle: wave(N, 6, 7, 1.6, 1.3).map((v) => Math.max(1, v)),
  waiting: wave(N, 1.2, 1.5, 0.7, 2.6).map((v) => Math.max(0.2, v)),
};
export const topQueries: readonly { q: string; ms: number }[] = [
  { q: 'SELECT classes', ms: 12 },
  { q: 'SELECT users', ms: 9 },
  { q: 'INSERT events', ms: 8 },
  { q: 'UPDATE sessions', ms: 6 },
  { q: 'SELECT payments', ms: 5 },
];

export const river = { processed: 24810, pending: 312, failed: 7, avgMin: 1.2 };
export const queues: readonly { name: string; jobs: number; color: string }[] = [
  { name: 'transcription', jobs: 8420, color: Maple.blue },
  { name: 'digest', jobs: 5210, color: Maple.successText },
  { name: 'payouts', jobs: 3980, color: Maple.blue },
  { name: 'notifications', jobs: 2420, color: Maple.warning },
  { name: 'analytics', jobs: 1860, color: Maple.blueLine },
  { name: 'reports', jobs: 1120, color: '#F87171' },
  { name: 'emails', jobs: 800, color: Maple.borderStrong },
];

export const livekit = { rooms: 1248, participants: 18320, rtt: 86, loss: 0.4 };
/** Share of rooms by quality, hour by hour. */
export const quality = {
  good: wave(24, 74, 78, 4, 0.5).map((v) => Math.round(v)),
  fair: wave(24, 17, 15, 3, 1.4).map((v) => Math.round(v)),
  poor: wave(24, 9, 7, 2, 2.4).map((v) => Math.round(v)),
};

export interface IncidentRow extends Incident {
  n: number;
  title: string;
  service: string;
  time: string;
}

export const incidents: readonly IncidentRow[] = [
  { n: 1, id: 'INC-2041', severity: 'Warning', title: 'High API latency detected', service: 'Go API', time: 'Oct 26, 14:32', status: 'Investigating' },
  { n: 2, id: 'INC-2040', severity: 'Info', title: 'River job retry spike', service: 'Job Queues', time: 'Oct 26, 13:18', status: 'Monitoring' },
  { n: 3, id: 'INC-2039', severity: 'Info', title: 'PostgreSQL connection usage > 80%', service: 'Database', time: 'Oct 26, 11:05', status: 'Resolved' },
  { n: 4, id: 'INC-2038', severity: 'Info', title: 'LiveKit regional node failover (eu-west)', service: 'LiveKit', time: 'Oct 26, 09:20', status: 'Resolved' },
  { n: 5, id: 'INC-2037', severity: 'Warning', title: 'Payment webhook delay', service: 'Payments', time: 'Oct 26, 06:14', status: 'Resolved' },
  { n: 6, id: 'INC-2036', severity: 'Info', title: 'Scheduled maintenance completed', service: 'Infrastructure', time: 'Oct 26, 01:00', status: 'Resolved' },
];

export const rooms: readonly { room: string; title: string; teacher: string; students: number; region: string; rtt: number; loss: number }[] = [
  { room: 'room_8f2a1', title: 'Mathematics - P5', teacher: 'Agnes N.', students: 28, region: 'Africa (UG)', rtt: 72, loss: 0.3 },
  { room: 'room_3c9d4', title: 'English - S3', teacher: 'Robert K.', students: 42, region: 'Africa (KE)', rtt: 88, loss: 0.5 },
  { room: 'room_7a6e2', title: 'Physics - S5', teacher: 'Grace M.', students: 36, region: 'Africa (TZ)', rtt: 182, loss: 1.6 },
  { room: 'room_1b9c7', title: 'Chemistry - S4', teacher: 'Daniel O.', students: 24, region: 'Africa (NG)', rtt: 96, loss: 0.6 },
  { room: 'room_5d3f8', title: 'Biology - P7', teacher: 'Sarah N.', students: 31, region: 'Europe (UK)', rtt: 64, loss: 0.2 },
  { room: 'room_2e8a6', title: 'History - S2', teacher: 'Peter O.', students: 26, region: 'Africa (RW)', rtt: 210, loss: 1.9 },
  { room: 'room_9c1d3', title: 'Coding - S3', teacher: 'Mary A.', students: 18, region: 'Asia (SG)', rtt: 118, loss: 0.4 },
];

export const windows = ['Last 24 hours', 'Last 7 days', 'Last hour'];
