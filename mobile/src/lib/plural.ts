/** "1 draft", "3 drafts"; pass the plural for words that don't just add an s. */
export function countOf(n: number, singular: string, plural = `${singular}s`): string {
  return `${n} ${n === 1 ? singular : plural}`;
}
