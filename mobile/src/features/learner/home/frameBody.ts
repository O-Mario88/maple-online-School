/** The learner frame's sidebar width and header height (HomeSidebar and HomeHeader sit absolutely in that space). */
export const FRAME_SIDE = 187;
export const FRAME_HEADER = 54;

/**
 * A learner page's body beside the sidebar and under the header. It is offset with margins, not
 * padding: a padded body would still span the whole page and sit on top of the header and sidebar,
 * swallowing clicks on the profile chip and the links.
 */
export function frameBody(pad: { top: number; left: number; right: number; bottom: number }) {
  return {
    marginLeft: FRAME_SIDE,
    marginTop: FRAME_HEADER,
    paddingTop: pad.top,
    paddingLeft: pad.left,
    paddingRight: pad.right,
    paddingBottom: pad.bottom,
  };
}
