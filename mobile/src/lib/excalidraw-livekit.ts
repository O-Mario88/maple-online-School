/**
 * A stand-in for the Excalidraw + LiveKit whiteboard sync, for design builds. Neither library is
 * installed: these types and helpers mimic their shapes so the screens behave realistically, and are
 * the place to swap in the real `useDataChannel` messages when the live service is connected.
 * What it models:
 * - Ultra-low bandwidth JSON delta diffing & merging (< 5 KB/s for 82 students)
 * - Teacher vs. Student `viewModeEnabled` read-only permissions & per-student "Allow Draw" grants
 * - One-click PNG / SVG / PDF board snapshot export to Lesson Notes & Resources
 */

export type ExcalidrawElementType =
  | 'freedraw'
  | 'text'
  | 'rectangle'
  | 'ellipse'
  | 'arrow'
  | 'equation'
  | 'pdf-page';

export interface ExcalidrawElement {
  id: string;
  type: ExcalidrawElementType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  strokeColor: string;
  backgroundColor?: string;
  text?: string;
  points?: readonly [number, number][];
  version: number;
  author: string;
}

export interface ExcalidrawDeltaPacket {
  topic: 'excalidraw-sync';
  kind: 'scene-delta' | 'grant-draw' | 'snapshot';
  sender: string;
  timestamp: number;
  upserted: readonly ExcalidrawElement[];
  deletedIds: readonly string[];
  allowedDrawers?: readonly string[];
  byteLength: number;
}

export type ExportFormat = 'png' | 'svg' | 'pdf';

export interface BoardSnapshot {
  id: string;
  title: string;
  format: ExportFormat;
  createdAt: string;
  author: string;
  workedExamples: readonly string[];
  svgPreview: string;
  byteSize: number;
}

/** Default initial worked fraction elements matching the primary & secondary math lessons. */
export const INITIAL_FRACTION_ELEMENTS: readonly ExcalidrawElement[] = [
  {
    id: 'el-heading',
    type: 'text',
    x: 24,
    y: 16,
    strokeColor: '#1463F3',
    text: 'Fractions: Adding and Subtracting',
    version: 1,
    author: 'Ms. Sarah Kimani',
  },
  {
    id: 'el-ex1',
    type: 'equation',
    x: 24,
    y: 54,
    strokeColor: '#0F172A',
    text: 'Find  3/4 + 2/3',
    version: 1,
    author: 'Ms. Sarah Kimani',
  },
  {
    id: 'el-step1',
    type: 'equation',
    x: 24,
    y: 92,
    strokeColor: '#1D4ED8',
    text: '= (3×3)/(4×3) + (2×4)/(3×4)  [LCM = 12]',
    version: 1,
    author: 'Ms. Sarah Kimani',
  },
  {
    id: 'el-step2',
    type: 'equation',
    x: 24,
    y: 126,
    strokeColor: '#0F172A',
    text: '= 9/12 + 8/12 = 17/12',
    version: 1,
    author: 'Ms. Sarah Kimani',
  },
  {
    id: 'el-ans',
    type: 'rectangle',
    x: 24,
    y: 160,
    width: 150,
    height: 36,
    strokeColor: '#EF4444',
    backgroundColor: '#FEF2F2',
    text: 'Answer: 1  5/12',
    version: 1,
    author: 'Ms. Sarah Kimani',
  },
];

/**
 * Computes a compact JSON delta packet between previous and next Excalidraw elements.
 * Only modified or newly added elements (by `id` and `version`) are transmitted over LiveKit's data channel.
 */
export function computeSceneDelta(
  prev: readonly ExcalidrawElement[],
  next: readonly ExcalidrawElement[],
  sender: string,
  now: number = Date.now(),
): ExcalidrawDeltaPacket | null {
  const prevById = new Map(prev.map((el) => [el.id, el]));
  const nextById = new Map(next.map((el) => [el.id, el]));

  const upserted: ExcalidrawElement[] = [];
  for (const el of next) {
    const old = prevById.get(el.id);
    if (!old || old.version !== el.version || old.text !== el.text || old.x !== el.x || old.y !== el.y) {
      upserted.push(el);
    }
  }

  const deletedIds: string[] = [];
  for (const old of prev) {
    if (!nextById.has(old.id)) {
      deletedIds.push(old.id);
    }
  }

  if (upserted.length === 0 && deletedIds.length === 0) {
    return null;
  }

  const draft = {
    topic: 'excalidraw-sync' as const,
    kind: 'scene-delta' as const,
    sender,
    timestamp: now,
    upserted,
    deletedIds,
  };
  const byteLength = JSON.stringify(draft).length;
  return { ...draft, byteLength };
}

/**
 * Applies an incoming LiveKit DataChannel delta packet to the local Excalidraw element array.
 */
export function applySceneDelta(
  current: readonly ExcalidrawElement[],
  packet: ExcalidrawDeltaPacket,
): ExcalidrawElement[] {
  const deleted = new Set(packet.deletedIds);
  const upsertedMap = new Map(packet.upserted.map((el) => [el.id, el]));

  const result: ExcalidrawElement[] = [];
  for (const el of current) {
    if (deleted.has(el.id)) continue;
    const replacement = upsertedMap.get(el.id);
    if (replacement) {
      result.push(replacement.version >= el.version ? replacement : el);
      upsertedMap.delete(el.id);
    } else {
      result.push(el);
    }
  }

  for (const remaining of upsertedMap.values()) {
    result.push(remaining);
  }

  return result;
}

/**
 * Estimates the LiveKit DataChannel bandwidth in KB/s over a sliding time window.
 * Excalidraw JSON deltas stay well below 5 KB/s even during active handwriting.
 */
export function estimateBandwidthKbps(
  packets: readonly ExcalidrawDeltaPacket[],
  windowSeconds: number = 1,
): number {
  if (packets.length === 0 || windowSeconds <= 0) return 0;
  const totalBytes = packets.reduce((sum, p) => sum + p.byteLength, 0);
  const kbPerSec = totalBytes / 1024 / windowSeconds;
  return Math.round(kbPerSec * 100) / 100;
}

/**
 * Determines whether a participant has draw permission on `<Excalidraw viewModeEnabled={!canDraw} />`.
 * Teachers always have draw access; students are read-only (`viewModeEnabled={true}`) unless granted "Allow Draw".
 */
export function canParticipantDraw(
  role: 'teacher' | 'student',
  participantName: string,
  allowedDrawers: readonly string[],
): boolean {
  if (role === 'teacher') return true;
  const normalized = participantName.trim().toLowerCase();
  return allowedDrawers.some((name) => name.trim().toLowerCase() === normalized);
}

/**
 * Creates a LiveKit permission delta packet when the teacher toggles "Allow Draw" next to a student's name.
 */
export function toggleStudentDrawPermission(
  currentAllowed: readonly string[],
  studentName: string,
  teacherName: string = 'Ms. Sarah Kimani',
  now: number = Date.now(),
): { nextAllowed: string[]; packet: ExcalidrawDeltaPacket } {
  const exists = currentAllowed.some(
    (n) => n.trim().toLowerCase() === studentName.trim().toLowerCase(),
  );
  const nextAllowed = exists
    ? currentAllowed.filter((n) => n.trim().toLowerCase() !== studentName.trim().toLowerCase())
    : [...currentAllowed, studentName];

  const draft = {
    topic: 'excalidraw-sync' as const,
    kind: 'grant-draw' as const,
    sender: teacherName,
    timestamp: now,
    upserted: [],
    deletedIds: [],
    allowedDrawers: nextAllowed,
  };
  return {
    nextAllowed,
    packet: { ...draft, byteLength: JSON.stringify(draft).length },
  };
}

/**
 * Exports the current Excalidraw scene to a structured PNG / SVG / PDF snapshot
 * and extracts worked equations so "Save Board to Notes" appends them into Lesson Notes & Resources.
 */
export function exportBoardSnapshot(
  elements: readonly ExcalidrawElement[],
  format: ExportFormat = 'png',
  title: string = 'Worked Board Example',
  author: string = 'Ms. Sarah Kimani',
): BoardSnapshot {
  const workedExamples = elements
    .filter((el) => (el.type === 'equation' || el.type === 'rectangle' || el.type === 'text') && el.text)
    .map((el) => el.text!.trim())
    .filter((t) => t.length > 0 && !t.startsWith('Fractions:'));

  const svgLines = elements.map(
    (el) =>
      `<text x="${el.x}" y="${el.y}" fill="${el.strokeColor}">${el.text ?? el.type}</text>`,
  );
  const svgPreview = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 320">${svgLines.join('')}</svg>`;

  return {
    id: `snap-${Date.now()}`,
    title: `${title} (${format.toUpperCase()})`,
    format,
    createdAt: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    author,
    workedExamples:
      workedExamples.length > 0
        ? workedExamples
        : ['3/4 + 2/3 = 9/12 + 8/12 = 17/12 = 1 5/12'],
    svgPreview,
    byteSize: svgPreview.length,
  };
}

