/** Small rules for the live classroom: the session clock, the participant list and transcript search. */

export type MicState = 'on' | 'off' | 'muted';
export type ParticipantFilter = 'all' | 'hand' | 'teachers';

export interface Participant {
  name: string;
  role: 'teacher' | 'student';
  mic: MicState;
  hand: boolean;
}

export interface TranscriptLine {
  at: string;
  who: string;
  text: string;
}

function two(n: number): string {
  return String(n).padStart(2, '0');
}

/** 42:18 under an hour; 1:01:05 from an hour on. */
export function clockOf(totalSeconds: number): string {
  const s = Math.max(Math.floor(totalSeconds), 0);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}:${two(m)}:${two(sec)}` : `${m}:${two(sec)}`;
}

/** Participants matching the search box and the All / Raised hand / Teachers chip. */
export function filterParticipants<T extends Participant>(people: readonly T[], query: string, filter: ParticipantFilter): T[] {
  const q = query.trim().toLowerCase();
  return people.filter(
    (p) =>
      (q === '' || p.name.toLowerCase().includes(q)) &&
      (filter === 'all' || (filter === 'hand' && p.hand) || (filter === 'teachers' && p.role === 'teacher')),
  );
}

/** Transcript lines containing every search word. */
export function searchTranscript<T extends TranscriptLine>(lines: readonly T[], query: string): T[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return lines.filter((l) => {
    const hay = `${l.who} ${l.text}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}
