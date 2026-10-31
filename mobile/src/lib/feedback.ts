/** Rules for marked work: video chapters, the voice-note waveform and MM:SS times. (Scores use RACE in lib/cbc.) */

const WAVE_MIN = 0.2;



/** The chapter playing at `pos` seconds: the last one that has started. */
export function chapterAt(chapters: readonly { at: number }[], pos: number): number {
  return chapters.reduce((found, c, i) => (c.at <= pos ? i : found), 0);
}

export function mmss(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

/** A steady, speech-like waveform: the same bars on every render. */
export function waveform(count: number): number[] {
  return Array.from({ length: count }, (_, i) => {
    const wave = Math.abs(Math.sin(i * 0.9) * 0.55 + Math.sin(i * 2.3) * 0.3 + Math.sin(i * 0.31) * 0.25);
    return Math.round(Math.min(1, Math.max(WAVE_MIN, wave)) * 100) / 100;
  });
}
