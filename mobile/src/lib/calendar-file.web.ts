/** The result of offering a calendar file: saved, shared, or why it couldn't be. */
export type CalendarFileResult = { ok: true; how: 'downloaded' | 'shared' } | { ok: false; reason: string };

/** Web: the browser downloads the .ics file, which opens in the computer's calendar. */
export async function offerCalendarFile(ics: string, fileName: string): Promise<CalendarFileResult> {
  if (typeof document === 'undefined') return { ok: false, reason: 'Downloads need a browser window.' };
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    return { ok: true, how: 'downloaded' };
  } finally {
    URL.revokeObjectURL(url);
  }
}
