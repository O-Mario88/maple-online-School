import type { MockData } from '@/mock';

export type Landing = MockData['publicPages']['landing'];
export type LiveClass = Landing['liveClasses'][number];
export type SampleLesson = Landing['sampleLesson'];

/** The reference homepage was drawn at this width; desktop layouts use its pixels. */
export const REF_WIDTH = 1536;
