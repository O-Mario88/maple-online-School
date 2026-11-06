import { type Href, router, useGlobalSearchParams, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { type ReactNode, useCallback, useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { Button, EmptyState, ShellContext } from '@/components/ui';
import { Breakpoints, SidebarWidth, type Theme } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { useAccess } from '@/lib/access/access-context';
import { useCanOpen } from '@/lib/access/use-role';
import { accessRedirect, PRICING } from '@/lib/access/route';
import { pageWidth } from '@/lib/layout';
import { isLiveDesign } from '@/lib/live-designs';
import { mockData } from '@/lib/mock';
import { usePortal } from '@/lib/portal-context';
import { layoutFrame, ownFrame as pageFrame } from '@/lib/portal-frame';
import { useReaderFocus } from '@/lib/reader-focus';

import { AdBanner } from '@/features/access/AdBanner';
import { TrialStrip } from '@/features/access/TrialStrip';
import { commandTabs, isCommandRefPath } from '@/features/command/kit/CommandFrame';
import { PortalTabBar, portalTabsFor } from '@/features/portal/PortalFrame';
import { TeacherTabBar } from '@/features/teacher/frame/TeacherTabBar';

import { DesignOverlays, OfflineStrip } from './DesignOverlays';
import { LearnerHeader, LearnerSidebar, learnerSideWidth, useNavMode } from './LearnerChrome';
import { type FrameRule, FrameRuleContext } from './PortalScreen';
import { Sidebar } from './Sidebar';
import { TabBar } from './TabBar';

/**
 * The signed-in frame: a sidebar beside the page on wide screens, a tab bar
 * under it on phones.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { styles } = useStyles(makeStyles);
  const { width } = useWindowDimensions();
  const wide = width >= Breakpoints.wide;
  const { portal } = usePortal();
  const mode = useNavMode();
  const path = usePathname();
  // A page outside this account's role (typed in, or an old link) shows why instead of opening.
  const may = useCanOpen();
  const forbidden = !may(path);
  const focusOn = useReaderFocus();
  const { id: courseId } = useGlobalSearchParams<{ id?: string }>();
  // A page the free month no longer covers sends the person to Pricing (or sign-up, browsing free);
  // once the month has ended, the first page of a visit does too. The page stays hidden while it moves.
  const access = useAccess();
  const lock = access.lockFor(path, typeof courseId === 'string' ? courseId : undefined);
  // Opening a page the free allowance opened uses some of this month's allowance.
  const openId = typeof courseId === 'string' ? courseId : undefined;
  const { usesFree, recordFreeOpen } = access;
  const counts = !lock && usesFree(path, openId);
  useEffect(() => {
    if (counts) recordFreeOpen(path, openId);
  }, [counts, path, openId, recordFreeOpen]);
  const target = accessRedirect({ path, phase: access.access?.phase ?? null, lock, pricingSeen: access.pricingSeen });
  const locked = target !== null;
  const pricingPage = path === PRICING;
  const ended = access.access?.phase === 'locked';
  const { markPricingSeen } = access;
  useEffect(() => {
    if (target) router.replace(target as Href);
  }, [target]);
  useEffect(() => {
    if (pricingPage && ended) markPricingSeen();
  }, [pricingPage, ended, markPricingSeen]);
  // The frame a designed page draws itself (lib/portal-frame): the learner's reference pages, the parent
  // home, Academics, Messages and Settings, every school-admin and Command page (and the school dashboard),
  // and the teacher pages that draw the teacher top bar in any mode.
  const own = pageFrame(portal, path);
  const learnerFrame = own === 'learner';
  const parentFrame = own === 'parent';
  const schoolFrame = own === 'school';
  const teacherFrame = own === 'teacher';
  const design = mockData() != null;
  // The host console and the learner classroom are full-screen live rooms in any mode: no app bars, sidebar or overlays.
  // The book reader's Focus Reading Mode hides every bar too.
  const readerFocus = path.startsWith('/learn/library/') && focusOn;
  const liveRoom =
    design && !locked && (path === '/teach/host' || path.startsWith('/teach/live-host') || path === '/learn/live-room' || readerFocus);
  // The phone host console has a dark header: white status bar icons there, the theme's everywhere else.
  // Set here from the route so leaving the console always puts them back.
  // The Messages banner is dark too (every portal but the parent's, which keeps its own design).
  const messagesBanner = path === '/messages' && !(design && portal === 'parent');
  const darkHeader = !locked && !wide && ((design && (path === '/teach/host' || path.startsWith('/teach/live-host'))) || messagesBanner);
  // A designed page draws its own frame in design builds, and in real builds once it runs on real data.
  const designed = (design || isLiveDesign(path)) && !locked;
  // Every other page in the school, parent and teacher portals gets its portal's frame from the layout
  // (PortalScreen), so the frame never swaps as you move around the portal. Design builds only for now.
  const layout = design && !locked ? layoutFrame(portal, path) : null;
  const { lockFor } = access;
  const phase = access.access?.phase ?? null;
  const pricingSeen = access.pricingSeen;
  // The same decision for any screen of the stack, from its own path (a screen behind this one keeps its frame).
  const frameRule = useCallback<FrameRule>(
    (p, id) => {
      if (!design) return null;
      if (accessRedirect({ path: p, phase, lock: lockFor(p, id), pricingSeen }) !== null) return null;
      return layoutFrame(portal, p);
    },
    [design, phase, lockFor, pricingSeen, portal],
  );
  // The Pricing page draws its own frame (its design) on wide screens.
  const ownFrame = wide && (((parentFrame || teacherFrame || schoolFrame) && designed) || layout !== null || liveRoom || pricingPage);
  // The learner's one header and sidebar, on every learner page except full-screen rooms and Pricing.
  const learnerChrome = wide && portal === 'learner' && !ownFrame;
  // An installed app on a computer gets the sidebar; a browser tab gets the top bar.
  const sideWidth = learnerChrome && mode === 'sidebar' ? learnerSideWidth(width) : 0;
  // Every wide page in the shell draws at one width at most (lib/layout) and centres it in its own
  // full-width scroll, so the scrollbar stays at the window edge and the margins scroll the page too.
  const centred = wide && !ownFrame;
  const beside = learnerChrome ? width - sideWidth : width - SidebarWidth;
  const shell = useMemo(
    () => ({ inShell: true, wide, contentWidth: centred ? pageWidth(beside) : undefined }),
    [wide, centred, beside],
  );
  // The teacher references show neither the design overlays nor the shared tab bar: they have their own white one.
  const teacherRef = (teacherFrame && designed) || layout === 'teacher';
  const refScreen = ((learnerFrame || parentFrame || teacherFrame || schoolFrame) && designed) || layout !== null || liveRoom || pricingPage;
  // Design builds give parent mode (and the two school-admin references) the references' own phone tab bar.
  const portalTabs = designed ? (isCommandRefPath(path) ? commandTabs(path) : portalTabsFor(portal, path)) : null;

  return (
    <ShellContext.Provider value={shell}>
      <FrameRuleContext.Provider value={frameRule}>
        <StatusBar style={darkHeader ? 'light' : 'dark'} />
        {learnerChrome ? <LearnerHeader mode={mode} /> : null}
        <View style={[styles.frame, wide && !ownFrame && styles.frameWide]}>
          {learnerChrome ? sideWidth ? <LearnerSidebar /> : null : wide && !ownFrame ? <Sidebar /> : null}
          <View style={styles.content}>
            {/* The page and its floating button sit above the offline strip, never on it. */}
            {/* Wide screens show the free-month strip on top; phones above the tab bar, clear of the notch. */}
            {wide && !liveRoom && !pricingPage ? <TrialStrip /> : null}
            {wide && !locked ? <AdBanner /> : null}
            <View style={styles.page}>
              {/* The navigator always stays mounted: swapping it out (for the role notice) rebuilt every open page. */}
              <View
                style={styles.page}
                importantForAccessibility={locked || forbidden ? 'no-hide-descendants' : 'auto'}
                accessibilityElementsHidden={locked || forbidden}>
                {children}
              </View>
              {locked ? <View style={styles.paywall} /> : null}
              {forbidden && !locked ? (
                <View style={styles.paywall}>
                  <NotForRole />
                </View>
              ) : null}
              {refScreen || locked ? null : <DesignOverlays />}
            </View>
            {refScreen ? null : <OfflineStrip />}
            {!wide && !locked ? <AdBanner /> : null}
            {!wide && !liveRoom && !pricingPage ? <TrialStrip /> : null}
          </View>
          {wide || liveRoom ? null : teacherRef ? <TeacherTabBar /> : portalTabs ? <PortalTabBar tabs={portalTabs} /> : <TabBar />}
        </View>
      </FrameRuleContext.Provider>
    </ShellContext.Provider>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    page: { flex: 1 },
    paywall: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: t.background },
    frame: { flex: 1, backgroundColor: t.background },
    frameWide: { flexDirection: 'row' },
    content: { flex: 1, minWidth: 0 },
  });
}

/** Shown in place of a page the account's role can't open. */
function NotForRole() {
  return (
    <EmptyState
      icon="lock"
      title="This page isn't part of your account"
      body="It belongs to a different role. If you think you should have it, ask your school's administrator."
      action={<Button label="Go home" variant="secondary" compact onPress={() => router.replace('/')} />}
    />
  );
}
