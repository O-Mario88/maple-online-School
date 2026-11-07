import { type Href, router, useGlobalSearchParams, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { type ReactNode, useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { ShellContext } from '@/components/ui';
import { Breakpoints, type Theme } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { useAccess } from '@/lib/access/access-context';
import { accessRedirect, PRICING } from '@/lib/access/route';
import { useMe } from '@/lib/auth/auth-context';
import { addressName } from '@/lib/home';
import { isLiveDesign } from '@/lib/live-designs';
import { mockData } from '@/lib/mock';
import { usePortal } from '@/lib/portal-context';
import { useReaderFocus } from '@/lib/reader-focus';

import { AdBanner } from '@/features/access/AdBanner';
import { TrialStrip } from '@/features/access/TrialStrip';
import { commandTabs, isCommandRefPath } from '@/features/command/kit/CommandFrame';
import { isSchoolRefPath, PARENT_REF_PATHS, PortalTabBar, portalTabsFor } from '@/features/portal/PortalFrame';
import { TeacherTabBar } from '@/features/teacher/frame/TeacherTabBar';

import { DesignOverlays, OfflineStrip } from './DesignOverlays';
import { LearnerTopBar } from './LearnerTopBar';
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
  const shell = useMemo(() => ({ inShell: true, wide }), [wide]);
  const { portal } = usePortal();
  const me = useMe();
  const path = usePathname();
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
  // The learner home, Projects, Library, Explore, Video Lessons, My Plan, the School Network and its application form draw their own sidebar (their references); other learner pages use the top bar.
  // The teacher home, AI studio, course builder, calendar and live host draw their own top bar and sidebar too.
  const learnerFrame =
    portal === 'learner' &&
    (path === '/' || path === '/learn/projects' || path === '/learn/library' || path.startsWith('/learn/library/') || path === '/learn/live-room' || path === '/learn/explore' || path === '/learn/lessons' || path === '/learn/plan' || path === '/learn/schools' || path === '/learn/apply');
  // The parent home, Academics, Messages and Settings, and the school Onboarding and Academics pages draw their own frame too.
  const parentFrame = portal === 'parent' && (path === '/' || PARENT_REF_PATHS.includes(path));
  const schoolFrame = isSchoolRefPath(path) || isCommandRefPath(path);
  // Teacher pages that draw their own frame do so in any mode (a link can open one from another mode);
  // the home ('/') is the teacher's only in teacher mode.
  const teacherFrame =
    (portal === 'teacher' && path === '/') ||
    (path === '/teach/studio' ||
      path === '/teach/course-editor' ||
      path === '/teach/calendar' ||
      path === '/teach/new-session' ||
      path === '/teach/host' ||
      path.startsWith('/teach/live-host') ||
      path.startsWith('/teach/assignments') ||
      path.startsWith('/teach/attendance') ||
      path.startsWith('/teach/grading') ||
      path.startsWith('/teach/learners') ||
      path.startsWith('/teach/class-spaces') ||
      path.startsWith('/teach/storefront') ||
      path.startsWith('/teach/verification') ||
      path.startsWith('/teach/earnings') ||
      path.startsWith('/teach/library'));
  const design = mockData() != null;
  // The host console and the learner classroom are full-screen live rooms in any mode: no app bars, sidebar or overlays.
  // The book reader's Focus Reading Mode hides every bar too.
  const readerFocus = path.startsWith('/learn/library/') && focusOn;
  const liveRoom =
    design && !locked && (path === '/teach/host' || path.startsWith('/teach/live-host') || path === '/learn/live-room' || readerFocus);
  // The phone host console has a dark header: white status bar icons there, the theme's everywhere else.
  // Set here from the route so leaving the console always puts them back.
  const darkHeader = design && !locked && !wide && (path === '/teach/host' || path.startsWith('/teach/live-host'));
  // A designed page draws its own frame in design builds, and in real builds once it runs on real data.
  const designed = (design || isLiveDesign(path)) && !locked;
  // The Pricing page draws its own frame (its design) on wide screens.
  const ownFrame = wide && (((learnerFrame || parentFrame || teacherFrame || schoolFrame) && designed) || liveRoom || pricingPage);
  // The teacher references show neither the design overlays nor the shared tab bar: they have their own white one.
  const teacherRef = teacherFrame && designed;
  const refScreen = ((learnerFrame || parentFrame || teacherFrame || schoolFrame) && designed) || liveRoom || pricingPage;
  // Design builds give parent mode (and the two school-admin references) the references' own phone tab bar.
  const portalTabs = designed ? (isCommandRefPath(path) ? commandTabs(path) : portalTabsFor(portal, path)) : null;
  const topBar = wide && portal === 'learner' && !ownFrame;
  const firstName = me.data ? addressName(me.data.full_name) : '';

  return (
    <ShellContext.Provider value={shell}>
      <StatusBar style={darkHeader ? 'light' : 'auto'} />
      {topBar ? <LearnerTopBar name={firstName} /> : null}
      <View style={[styles.frame, wide && !topBar && !ownFrame && styles.frameWide]}>
        {wide && !topBar && !ownFrame ? <Sidebar /> : null}
        <View style={styles.content}>
          {/* The page and its floating button sit above the offline strip, never on it. */}
          {/* Wide screens show the free-month strip on top; phones above the tab bar, clear of the notch. */}
          {wide && !liveRoom && !pricingPage ? <TrialStrip /> : null}
          {wide && !locked ? <AdBanner /> : null}
          <View style={styles.page}>
            <View style={styles.page} importantForAccessibility={locked ? 'no-hide-descendants' : 'auto'} accessibilityElementsHidden={locked}>
              {children}
            </View>
            {locked ? <View style={styles.paywall} /> : null}
            {refScreen || locked ? null : <DesignOverlays />}
          </View>
          {refScreen ? null : <OfflineStrip />}
          {!wide && !locked ? <AdBanner /> : null}
          {!wide && !liveRoom && !pricingPage ? <TrialStrip /> : null}
        </View>
        {wide || liveRoom ? null : teacherRef ? <TeacherTabBar /> : portalTabs ? <PortalTabBar tabs={portalTabs} /> : <TabBar />}
      </View>
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
