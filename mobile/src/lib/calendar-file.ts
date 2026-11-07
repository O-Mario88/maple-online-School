import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/** The result of offering a calendar file: saved, shared, or why it couldn't be. */
export type CalendarFileResult = { ok: true; how: 'downloaded' | 'shared' } | { ok: false; reason: string };

/**
 * Phones: writes the .ics file to the app's cache and opens the share sheet with it as a calendar
 * file, so Calendar (or Google Calendar) can add the sessions. Web: lib/calendar-file.web.ts.
 */
export async function offerCalendarFile(ics: string, fileName: string): Promise<CalendarFileResult> {
  if (!(await Sharing.isAvailableAsync())) return { ok: false, reason: 'Sharing files isn’t available on this device.' };
  try {
    const file = new File(Paths.cache, fileName);
    file.create({ overwrite: true });
    file.write(ics);
    await Sharing.shareAsync(file.uri, {
      mimeType: 'text/calendar',
      UTI: 'com.apple.ical.ics',
      dialogTitle: 'Add your study schedule to a calendar',
    });
    return { ok: true, how: 'shared' };
  } catch {
    return { ok: false, reason: 'Couldn’t prepare the calendar file. Please try again.' };
  }
}
