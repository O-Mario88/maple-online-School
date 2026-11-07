import { type Href, router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { useNavMode } from '@/components/shell/LearnerChrome';
import { LearnerPhoneTop } from '@/features/learner/dashboard/DashPhone';
import { L, LightFrame } from '@/features/learner/frame/LightFrame';

import { BRAND_BLUE } from './CareerParts';
import { CareerSheet, ProgramSheet } from './CareerSheets';
import { SectionHead } from './CompassCards';
import { ExplorerSection } from './CompassExplorer';
import { CompassHome } from './CompassHome';
import { InterestsSection } from './CompassInterests';
import { ApplicationsTab } from './CompassPlanning';
import { ScholarshipsSection } from './CompassScholarships';
import { CommunitiesSection } from './CompassCommunities';
import { CounselorSection } from './CompassCounselor';
import { EventsSection } from './CompassEvents';
import { DirectoryView } from './DirectoryViews';
import { COMPASS_SECTIONS, type CompassSection } from '@/lib/careers/sections';
import { type CC, type Compass, useCompass } from './useCompass';

/** Sections whose reference opens with its own hero instead of a section heading. */
const OWN_HERO: readonly CompassSection[] = ['home', 'interests', 'explorer', 'programs', 'events', 'counselor', 'scholarships', 'communities'];

const SUB: Readonly<Record<CompassSection, string>> = {
  home: 'Discover your interests, explore careers, get guidance and plan your future.',
  interests: 'Discover what motivates you, how you like to work and the kinds of careers you may enjoy.',
  explorer: 'Discover careers, what they involve, and the education paths that can take you there.',
  counselor: 'One-to-one guidance with a verified career counselor.',
  programs: 'Compare verified institutions, programs and entry requirements.',
  scholarships: 'Find funding that fits your goals, and plan each application.',
  applications: 'Every application you’re planning, with its deadline and steps.',
  events: 'Open days, talks and group guidance sessions.',
  communities: 'Learn with others exploring the same careers, guided by mentors.',
};

function Section({ x, phone }: { x: Compass; phone: boolean }) {
  switch (x.tab) {
    case 'home':
      return <CompassHome x={x} phone={phone} />;
    case 'interests':
      return <InterestsSection x={x} phone={phone} />;
    case 'explorer':
      return <ExplorerSection x={x} phone={phone} />;
    case 'counselor':
      return <CounselorSection x={x} phone={phone} />;
    case 'programs':
      return <DirectoryView cc={x.cc} phone={phone} onCareerPaths={() => x.setTab('explorer')} />;
    case 'scholarships':
      return <ScholarshipsSection x={x} phone={phone} />;
    case 'applications':
      return <ApplicationsTab x={x} phone={phone} />;
    case 'events':
      return <EventsSection x={x} phone={phone} />;
    case 'communities':
      return <CommunitiesSection x={x} phone={phone} />;
  }
}

/** The career and program sheets, shared by every section. */
function Sheets({ x }: { x: Compass }) {
  const c = x.career;
  const p = x.program;
  return (
    <>
      {c ? (
        <CareerSheet
          c={c}
          programs={x.cc.programs.filter((pr) => c.programIds.includes(pr.id))}
          uni={x.uni}
          status={x.status}
          saved={x.saves.careers.includes(c.id)}
          onSave={() => x.toggleCareer(c.id)}
          onPlan={() => {
            if (!x.saves.careers.includes(c.id)) x.toggleCareer(c.id);
            x.setGoal(c.id);
            x.plan(`Explore the ${c.title} pathway`, x.today);
            x.openCareer(null);
            x.openPlan();
          }}
          onProgram={(pr) => {
            x.openCareer(null);
            x.openProgram(pr.id);
          }}
          onClose={() => x.openCareer(null)}
        />
      ) : null}
      {p ? (
        <ProgramSheet
          p={p}
          u={x.uni(p.universityId)}
          status={x.status(p)}
          fit={x.fit(p)}
          scholarships={x.scholarshipsFor(p)}
          saved={x.saves.programs.includes(p.id)}
          onSave={() => x.toggleProgram(p.id)}
          onUniversity={() => {
            x.openProgram(null);
            router.push(`/universities/${p.universityId}` as Href);
          }}
          onClose={() => x.openProgram(null)}
        />
      ) : null}
    </>
  );
}

const sectionOf = (key: CompassSection) => COMPASS_SECTIONS.find((sec) => sec.key === key) ?? COMPASS_SECTIONS[0];

interface Props {
  cc: CC;
  avatar?: number;
  tab?: string;
}

/** Career Compass on wide screens: the desktop reference, in the light learner frame with its sections in the sidebar. */
export function CompassDesk({ cc, avatar, tab }: Props) {
  const x = useCompass(cc, tab);
  const sec = sectionOf(x.tab);
  // With no sidebar (a browser tab's top bar), the sections show as tabs on the page.
  const sectionTabs = useNavMode() !== 'sidebar';
  return (
    <LightFrame>
      <View style={s.desk}>
        {sectionTabs ? <PhoneTabs x={x} /> : null}
        {!OWN_HERO.includes(x.tab) ? <SectionHead icon={sec.icon} title={sec.label} sub={SUB[x.tab]} /> : null}
        <Section x={x} phone={false} />
      </View>
      <Sheets x={x} />
    </LightFrame>
  );
}

function PhoneTabs({ x }: { x: Compass }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabsP} contentContainerStyle={s.tabsRow}>
      <View style={s.tabsRow} accessibilityRole="tablist">
        {COMPASS_SECTIONS.map((t) => {
          const on = x.tab === t.key;
          return (
            <Pressable key={t.key} style={s.tabP} onPress={() => x.setTab(t.key)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
              <Text style={[s.tabText, on && s.tabOn]}>{t.short}</Text>
              {on ? <View style={s.tabLine} /> : null}
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

/** Career Compass on phones: the phone reference, with the sections as scrolling tabs. */
export function CompassPhone({ cc, avatar, tab }: Props) {
  const x = useCompass(cc, tab);
  const sec = sectionOf(x.tab);
  return (
    <View style={s.phoneRoot}>
      {avatar ? <LearnerPhoneTop avatar={avatar} /> : null}
      <ScrollView contentContainerStyle={s.phone}>
        <SectionHead phone icon="map" title="Career Compass" sub={SUB.home} />
        <PhoneTabs x={x} />
        {x.tab !== 'home' && !(x.tab === 'interests' && x.step) ? (
          <View style={s.phoneSec}>
            <Icon name={sec.icon} size={18} color={BRAND_BLUE} />
            <Text style={s.phoneSecText}>{sec.label}</Text>
          </View>
        ) : null}
        <Section x={x} phone />
      </ScrollView>
      <Sheets x={x} />
    </View>
  );
}

const s = StyleSheet.create({
  desk: { gap: 22 },
  phoneRoot: { flex: 1, backgroundColor: L.canvas },
  phone: { gap: 16, padding: 16, paddingBottom: 110 },
  tabsP: { flexGrow: 0, marginHorizontal: -16, borderBottomWidth: 1, borderBottomColor: L.line },
  tabsRow: { flexDirection: 'row', paddingHorizontal: 8 },
  tabP: { height: 42, justifyContent: 'center', paddingHorizontal: 10 },
  tabText: { fontSize: 13.5, fontWeight: '500', color: L.ink },
  tabOn: { fontWeight: '700', color: BRAND_BLUE },
  tabLine: { position: 'absolute', left: 6, right: 6, bottom: 0, height: 3, borderRadius: 2, backgroundColor: BRAND_BLUE },
  phoneSec: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  phoneSecText: { fontSize: 18, fontWeight: '800', color: L.navy },
});
