/**
 * Designed pages that also run in real builds, on real data. They draw their own frame
 * (top bar and sidebar), so the app shell leaves its own out, as it does in design builds.
 * Add a path here when its designed view is wired to the API.
 */
const LIVE_DESIGN_PATHS: readonly string[] = ['/admin/academics'];

export function isLiveDesign(path: string): boolean {
  return LIVE_DESIGN_PATHS.includes(path);
}
