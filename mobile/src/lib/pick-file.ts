/** The native apps can't open files yet (no document picker), so attaching is web-only for now. */
export const pickFile: (() => Promise<string | null>) | undefined = undefined;
