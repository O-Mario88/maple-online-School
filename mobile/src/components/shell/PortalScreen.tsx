import { createContext, type ReactNode, useContext, useMemo } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { ShellContext, useShell } from '@/components/ui';
import { PARENT_NAV, ParentTopBar, PORTAL_TOP_HEIGHT, SchoolTopBar, SideNav } from '@/features/portal/PortalFrame';
import { CANVAS, DESK_MIN_WIDTH } from '@/features/portal/tokens';
import { ADMIN_NAV, type AdminMe, useAdminMe } from '@/features/school/kit/AdminKit';
import { TEACHER_BAR_HEIGHT, TeacherTopBar, type TopTab } from '@/features/teacher/frame/TeacherFrame';
import { CANVAS as TEACHER_CANVAS } from '@/features/teacher/frame/TeacherParts';
import { TEACHER_REF_WIDTH } from '@/features/teacher/home/TeacherHomeViews';
import { mockData } from '@/lib/mock';
import { activeLabel, type FramePortal } from '@/lib/portal-frame';
import { useUiScaleRef } from '@/lib/ui-scale';

/** The designed pages' sidebar width (PortalFrame's side style), before scaling. */
const SIDE_WIDTH = 214;

/** How far the teacher pages float their top bar in from the canvas edge, before scaling. */
const TEACHER_INSET = 14;

const NO_ADMIN: AdminMe = { name: '', role: '', avatar: 0, initial: '', notifications: 0 };

/** Decides, for a page's path, which portal frame the layout draws around it. AppShell provides it. */
export type FrameRule = (path: string, courseId?: string) => FramePortal | null;
export const FrameRuleContext = createContext<FrameRule>(() => null);

/** The teacher top bar's tab for a page it doesn't draw itself. */
const TEACHER_TABS: Readonly<Record<string, TopTab>> = { '/learn/live': 'Classes' };

/**
 * One page of the signed-in stack. On a wide screen, a page in the school, parent or teacher portal
 * that doesn't draw its portal's frame gets that frame here, at the same scale as the designed pages,
 * so the top bar and sidebar never change as you move around the portal. The page always sits in the
 * same place in this tree, so a frame appearing or going never rebuilds it.
 */
export function PortalScreen({ path, courseId, children }: { path: string; courseId?: string; children: ReactNode }) {
  const frameFor = useContext(FrameRuleContext);
  const shell = useShell();
  const { width } = useWindowDimensions();
  const frame = shell.wide ? frameFor(path, courseId) : null;
  // The designed pages scale their frame with the window; this one matches them. School and parent pages
  // shrink below their 1536px design; teacher pages always fit their 1180px design to the window.
  const scale = frame === 'teacher' ? width / TEACHER_REF_WIDTH : Math.min(1, width / DESK_MIN_WIDTH);
  const side = frame === 'school' || frame === 'parent' ? frame : null;
  const sideWidth = side ? SIDE_WIDTH * scale : 0;
  const inner = useMemo(() => (frame ? { ...shell, contentWidth: width - sideWidth } : shell), [frame, shell, width, sideWidth]);
  return (
    <View style={[styles.root, frame === 'teacher' ? styles.teacherCanvas : frame !== null && styles.framed]}>
      {frame ? (
        <ScaledBar scale={scale} width={width} height={frame === 'teacher' ? TEACHER_BAR_HEIGHT + TEACHER_INSET : PORTAL_TOP_HEIGHT}>
          <FrameTop frame={frame} path={path} />
        </ScaledBar>
      ) : null}
      <View style={styles.body}>
        {side ? (
          <ScaledSide scale={scale}>
            <FrameSide frame={side} path={path} />
          </ScaledSide>
        ) : null}
        <ShellContext.Provider value={inner}>
          <View style={styles.page}>{children}</View>
        </ShellContext.Provider>
      </View>
    </View>
  );
}

function FrameTop({ frame, path }: { frame: FramePortal; path: string }) {
  if (frame === 'school') return <SchoolTop />;
  if (frame === 'parent') return <ParentTop />;
  return <TeacherTop path={path} />;
}

/** The school top bar names whoever is signed in, as every admin page does. */
function SchoolTop() {
  const me = useAdminMe(mockData()?.schoolAdmin.me ?? NO_ADMIN);
  return <SchoolTopBar search="Search students, payments, or reports..." me={me} />;
}

function ParentTop() {
  const p = mockData()?.portal.parent;
  if (!p) return null;
  return <ParentTopBar list={p.children} me={p.me} search="Search classes, messages, or resources..." />;
}

function TeacherTop({ path }: { path: string }) {
  const me = mockData()?.teacher.teacherHome.me;
  if (!me) return null;
  // The teacher pages float the bar as a card, 14px in from the canvas edge.
  return (
    <View style={styles.teacherBar}>
      <TeacherTopBar active={TEACHER_TABS[path] ?? null} me={me} placeholder="Search students, classes, or resources..." />
    </View>
  );
}

function FrameSide({ frame, path }: { frame: 'school' | 'parent'; path: string }) {
  if (frame === 'school') return <SideNav items={ADMIN_NAV} active={activeLabel(ADMIN_NAV, path)} />;
  return <SideNav heading="Parent" items={PARENT_NAV} active={activeLabel(PARENT_NAV, path)} />;
}

/**
 * A top bar drawn at the designs' pixels and scaled to the window. Its height is known, so it needs no
 * measuring (onLayout is not reliable on web here).
 */
function ScaledBar({ scale, width, height, children }: { scale: number; width: number; height: number; children: ReactNode }) {
  const scaled = useUiScaleRef(scale);
  return (
    <View style={[styles.clip, { width, height: height * scale }]}>
      <View ref={scaled} style={[styles.scaled, { width: width / scale, height, transform: [{ scale }] }]}>{children}</View>
    </View>
  );
}

/**
 * The sidebar at the designs' scale, filling the column's height (a percentage, so nothing is measured).
 * It scrolls on its own when the menu is taller than the window; the designed pages scroll it with the page.
 */
function ScaledSide({ scale, children }: { scale: number; children: ReactNode }) {
  const scaled = useUiScaleRef(scale);
  return (
    <View style={[styles.clip, { width: SIDE_WIDTH * scale }]}>
      <ScrollView
        ref={scaled}
        style={[styles.scaled, styles.sideScroll, { height: `${100 / scale}%`, transform: [{ scale }] }]}
        contentContainerStyle={styles.sideContent}
        showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  framed: { backgroundColor: CANVAS },
  teacherCanvas: { backgroundColor: TEACHER_CANVAS },
  teacherBar: { paddingTop: TEACHER_INSET, paddingHorizontal: TEACHER_INSET },
  body: { flex: 1, flexDirection: 'row' },
  page: { flex: 1, minWidth: 0 },
  clip: { overflow: 'hidden', flexShrink: 0 },
  scaled: { transformOrigin: 'top left' },
  sideScroll: { position: 'absolute', top: 0, left: 0, width: SIDE_WIDTH },
  // A row, so the menu stretches to the column's full height like the designed pages' sidebar.
  sideContent: { flexGrow: 1, flexDirection: 'row' },
});
