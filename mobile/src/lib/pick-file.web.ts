/** Opens the browser's file chooser: the chosen file's name, or null if the learner cancels. */
export const pickFile: (() => Promise<string | null>) | undefined = () =>
  new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,image/*';
    input.onchange = () => resolve(input.files?.[0]?.name ?? null);
    input.oncancel = () => resolve(null);
    input.click();
  });
