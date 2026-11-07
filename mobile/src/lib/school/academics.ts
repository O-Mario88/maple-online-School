import type { Class, ClassLevel } from './types';

export interface LevelGroup {
  levelId: number;
  name: string;
  classes: Class[];
}

/** A school's classes under their class level, lowest level first; levels missing from the list go last. */
export function classesByLevel(classes: readonly Class[], levels: readonly ClassLevel[]): LevelGroup[] {
  const grades = new Map(levels.map((l) => [l.id, l.internal_canonical_grade]));
  const groups = new Map<number, LevelGroup>();
  for (const c of classes) {
    const g = groups.get(c.class_level) ?? { levelId: c.class_level, name: c.class_level_name, classes: [] };
    groups.set(c.class_level, { ...g, classes: [...g.classes, c] });
  }
  const gradeOf = (id: number) => grades.get(id) ?? Number.MAX_SAFE_INTEGER;
  return [...groups.values()]
    .map((g) => ({ ...g, classes: [...g.classes].sort((a, b) => a.title.localeCompare(b.title)) }))
    .sort((a, b) => gradeOf(a.levelId) - gradeOf(b.levelId));
}
