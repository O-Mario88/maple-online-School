import { Image } from '@/components/picture';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { L } from '@/features/learner/frame/LightFrame';
import { Picker } from '@/features/learner/lessons/LessonParts';
import type { IconName } from '@/lib/icons';
import { toast } from '@/lib/toast';
import type { Community } from '@/mock/career-compass';

import { Bullets, cs, BRAND_SOFT, BRAND_BLUE, Sheet, shortDate } from './CareerParts';
import { CareerRequestForm } from './CareerRequests';
import { filterCommunities, type CommunitySort, sortCommunities } from './communities';
import { ColorTiles, Pager, PhotoPill, PurpleHero, SideCard } from './CompassCards';
import { paginate } from './directory';
import { setEventStatus, toggleCommunity } from './saved';
import type { Compass } from './useCompass';
import { Maple, Radii } from '@/constants/maple';

const TOPIC_ICON: Readonly<Record<string, IconName>> = { Healthcare: 'pulse', Engineering: 'settings', Technology: 'code', Education: 'cap', Environment: 'leaf', Creative: 'image' };
const CHIPS = ['Healthcare', 'Engineering', 'Technology', 'Education'];
const MORE = ['Environment', 'Creative'];
const GUIDELINES = [
  'Use your first name only, and never share your phone number, address or school.',
  'Be kind and respectful. Disagree with ideas, not people.',
  'No adverts, recruiting or private messages from organisations.',
  'Mentors are checked by Maple, and moderators read reports every day.',
  'Report anything that worries you; you can leave a community any time.',
];

function useCommunitiesPage(x: Compass) {
  const [topic, setTopicState] = useState('all');
  const [sort, setSort] = useState<CommunitySort>('active');
  const [mentoredOnly, setMentoredOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<string | null>(null);
  const [sheet, setSheet] = useState<'how' | 'guidelines' | 'start' | 'discuss' | null>(null);
  const [agreeFor, setAgreeFor] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const joined = x.saves.communities;
  const grid = sortCommunities(
    filterCommunities(
      x.cc.communities.filter((g) => !g.suggested || joined.includes(g.id)),
      topic,
    ).filter((g) => !mentoredOnly || g.mentor),
    sort,
  );
  const join = (g: Community) => {
    if (joined.includes(g.id)) {
      toggleCommunity(g.id);
      return toast(`You left ${g.title}`);
    }
    if (!agreed) return setAgreeFor(g.id);
    toggleCommunity(g.id);
    toast(`Joined ${g.title}. Use your first name only.`);
  };
  const setTopic = (t: string) => {
    setTopicState(t);
    setPage(1);
  };
  return { topic, setTopic, sort, setSort, mentoredOnly, setMentoredOnly, pageInfo: paginate(grid, page), setPage, open, setOpen, sheet, setSheet, agreeFor, setAgreeFor, setAgreed, joined, join };
}
type GP = ReturnType<typeof useCommunitiesPage>;

function Chips({ p }: { p: GP }) {
  const chip = (key: string, label: string, icon: IconName) => {
    const on = p.topic === key;
    return (
      <Pressable key={key} style={[s.chip, on && s.chipOn]} onPress={() => p.setTopic(key)} accessibilityRole="button" accessibilityState={{ selected: on }}>
        <Icon name={icon} size={15} color={on ? L.white : L.navy} />
        <Text style={[s.chipText, on && s.chipTextOn]}>{label}</Text>
      </Pressable>
    );
  };
  return (
    <View style={s.chips}>
      {chip('all', 'All Communities', 'grid')}
      {CHIPS.map((t) => chip(t, t, TOPIC_ICON[t]))}
      <Picker compact label="More topics" icon="more" value={MORE.includes(p.topic) ? p.topic : 'all'} options={[{ value: 'all', label: 'More' }, ...MORE.map((t) => ({ value: t, label: t }))]} onChange={p.setTopic} />
    </View>
  );
}

function Card({ g, p, phone }: { g: Community; p: GP; phone: boolean }) {
  const joined = p.joined.includes(g.id);
  return (
    <View style={[s.card, phone ? s.cardP : s.cardD]}>
      <View>
        {g.photo ? (
          <Image decorative source={g.photo} style={s.photo} contentFit="cover" />
        ) : (
          <LinearGradient colors={[Maple.blueSelected, Maple.blueSelected]} style={[s.photo, s.photoArt]}>
            <Icon name={TOPIC_ICON[g.topic] ?? 'people'} size={40} color={BRAND_BLUE} />
          </LinearGradient>
        )}
        <PhotoPill text={`${g.members.toLocaleString('en-US')} members`} icon="people" />
        {g.mentor ? <PhotoPill text="Mentored" icon="crown" side="right" tone="gold" /> : null}
      </View>
      <View style={s.body}>
        <Text style={s.title}>{g.title}</Text>
        <Text style={[cs.small, s.about]} numberOfLines={2}>
          {g.about}
        </Text>
        <View style={s.tags}>
          {g.tags.slice(0, 4).map((t) => (
            <Text key={t} style={s.tag}>
              {t}
            </Text>
          ))}
        </View>
        <View style={s.btns}>
          <Pressable style={[s.solid, joined && s.done]} onPress={() => p.join(g)} accessibilityRole="button" accessibilityLabel={joined ? `Leave ${g.title}` : `Join ${g.title}`}>
            {joined ? <Icon name="tick" size={14} color={Maple.successText} /> : null}
            <Text style={[s.solidText, joined && s.doneText]}>{joined ? 'Joined' : 'Join Community'}</Text>
          </Pressable>
          <Pressable style={s.outline} onPress={() => p.setOpen(g.id)} accessibilityRole="button" accessibilityLabel={`View details: ${g.title}`}>
            <Text style={s.outlineText}>View Details</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function Side({ x, p }: { x: Compass; p: GP }) {
  const gs = x.cc.groupSession;
  const registered = x.saves.events[gs.id] === 'registered';
  const suggested = x.cc.communities.filter((g) => g.suggested && !p.joined.includes(g.id));
  return (
    <>
      <View style={s.start}>
        <View style={s.startHead}>
          <View style={s.flex}>
            <View style={s.inline}>
              <Icon name="people" size={22} color={BRAND_BLUE} />
              <Text style={s.sideTitle}>Start a Community</Text>
            </View>
            <Text style={cs.small}>Don’t see the group you need? Ask Maple to start one for learners with the same interest.</Text>
          </View>
          <Image decorative source={x.cc.photos.art.startCommunity} style={s.startArt} contentFit="contain" />
        </View>
        <Pressable style={s.wideOutline} onPress={() => p.setSheet('start')} accessibilityRole="button">
          <Text style={s.outlineText}>Create a Community</Text>
          <Icon name="arrowRight" size={14} color={BRAND_BLUE} />
        </Pressable>
      </View>
      <SideCard title="Upcoming Live Group Session" icon="calendar">
        <View style={s.session}>
          <Image decorative source={gs.photo} style={s.sessionPhoto} contentFit="cover" />
          <View style={s.flex}>
            <Text style={s.sessionTitle}>{gs.title}</Text>
            <View style={s.inline}>
              <Icon name="calendar" size={13} color={L.navy} />
              <Text style={s.metaText}>{shortDate(gs.date)}</Text>
            </View>
            <View style={s.inline}>
              <Icon name="clock" size={13} color={L.navy} />
              <Text style={s.metaText}>{gs.time}</Text>
            </View>
          </View>
        </View>
        <Pressable
          style={[s.block, registered && s.done]}
          onPress={() => {
            setEventStatus(gs.id, registered ? null : 'registered');
            toast(registered ? 'Registration cancelled' : 'Registered. You’ll get a reminder the day before.');
          }}
          accessibilityRole="button">
          <Text style={[s.solidText, registered && s.doneText]}>{registered ? 'Registered' : 'Register Now'}</Text>
          {!registered ? <Icon name="arrowRight" size={13} color={L.white} /> : null}
        </Pressable>
      </SideCard>
      <SideCard title="Suggested for You" icon="sparkle">
        {suggested.length ? (
          suggested.map((g) => (
            <View key={g.id} style={s.suggest}>
              <View style={s.suggestIcon}>
                <Icon name={TOPIC_ICON[g.topic] ?? 'people'} size={18} color={BRAND_BLUE} />
              </View>
              <View style={s.flex}>
                <Text style={s.sessionTitle}>{g.title}</Text>
                <Text style={cs.small}>{`${g.members.toLocaleString('en-US')} members`}</Text>
              </View>
              <Pressable style={s.joinSmall} onPress={() => p.join(g)} accessibilityRole="button" accessibilityLabel={`Join ${g.title}`}>
                <Text style={s.outlineText}>Join</Text>
              </Pressable>
            </View>
          ))
        ) : (
          <Text style={cs.small}>You’ve joined every suggestion. More appear as you explore careers.</Text>
        )}
      </SideCard>
      <View style={s.guide}>
        <View style={s.inline}>
          <Icon name="shield" size={22} color={BRAND_BLUE} />
          <Text style={s.sideTitle}>Community Guidelines</Text>
        </View>
        <Text style={cs.small}>A safe, respectful and supportive space for learning, sharing and career growth.</Text>
        <Pressable style={s.inline} onPress={() => p.setSheet('guidelines')} accessibilityRole="link">
          <Text style={s.link}>Read the Guidelines</Text>
          <Icon name="arrowRight" size={13} color={BRAND_BLUE} />
        </Pressable>
      </View>
    </>
  );
}

function Sheets({ x, p }: { x: Compass; p: GP }) {
  const g = x.cc.communities.find((c) => c.id === p.open);
  const agreeG = x.cc.communities.find((c) => c.id === p.agreeFor);
  return (
    <>
      {g ? (
        <Sheet title={g.title} onClose={() => p.setOpen(null)}>
          <Text style={cs.small}>{`${g.members.toLocaleString('en-US')} members · ${g.activeThisWeek} active this week`}</Text>
          <Text style={cs.body}>{g.about}</Text>
          <Text style={cs.body}>{g.mentor ? `Mentor: ${g.mentor} (checked by Maple)` : 'Peer-led, and moderated by Maple.'}</Text>
          <Text style={s.label}>Latest discussion</Text>
          <Text style={cs.body}>{`“${g.latest}”`}</Text>
          <Pressable
            style={s.block}
            onPress={() => {
              p.setOpen(null);
              p.join(g);
            }}
            accessibilityRole="button">
            <Text style={s.solidText}>{p.joined.includes(g.id) ? 'Leave community' : 'Join community'}</Text>
          </Pressable>
        </Sheet>
      ) : null}
      {agreeG ? (
        <Sheet title="Before you join" onClose={() => p.setAgreeFor(null)}>
          <Bullets items={GUIDELINES} />
          <Pressable
            style={s.block}
            onPress={() => {
              p.setAgreed(true);
              toggleCommunity(agreeG.id);
              p.setAgreeFor(null);
              toast(`Joined ${agreeG.title}. Use your first name only.`);
            }}
            accessibilityRole="button">
            <Text style={s.solidText}>I agree, join</Text>
          </Pressable>
        </Sheet>
      ) : null}
      {p.sheet === 'guidelines' ? (
        <Sheet title="Community guidelines" onClose={() => p.setSheet(null)}>
          <Bullets items={GUIDELINES} />
        </Sheet>
      ) : null}
      {p.sheet === 'how' || p.sheet === 'discuss' ? (
        <Sheet title="How communities work" onClose={() => p.setSheet(null)}>
          <Bullets
            items={[
              'Join a community for the careers you’re exploring.',
              'Ask questions and share tips in its discussions; mentors answer when they can.',
              'Join live group sessions with professionals.',
              'Everything is moderated, and you can leave any time.',
            ]}
          />
        </Sheet>
      ) : null}
      {p.sheet === 'start' ? (
        <Sheet title="Ask for a new community" onClose={() => p.setSheet(null)}>
          <CareerRequestForm kind="community" intro="Tell us the career or interest. Maple’s team sets up communities for learners, finds a checked mentor where possible, and moderates every one." placeholder="For example: Future Pilots" sentToast="Request sent to Maple’s community team." />
        </Sheet>
      ) : null}
    </>
  );
}

/** Communities (its reference): moderated career groups with checked mentors, live group sessions and safe-space rules. */
export function CommunitiesSection({ x, phone }: { x: Compass; phone: boolean }) {
  const p = useCommunitiesPage(x);
  const tiles = [
    { key: 'groups', title: 'Career Groups', sub: 'Explore careers with peers', icon: 'people' as const, tint: Maple.blueSoft, color: BRAND_BLUE, onPress: () => p.setTopic('all') },
    { key: 'mentors', title: 'Mentor Access', sub: 'Learn from professionals', icon: 'cap' as const, tint: Maple.blueSoft, color: Maple.blue, onPress: () => p.setMentoredOnly(!p.mentoredOnly) },
    { key: 'ask', title: 'Ask & Discuss', sub: 'Get answers to your questions', icon: 'chat' as const, tint: Maple.successSoft, color: Maple.successText, onPress: () => p.setSheet('discuss') },
    { key: 'live', title: 'Live Sessions', sub: 'Join talks and group events', icon: 'calendar' as const, tint: Maple.warningSoft, color: Maple.warning, onPress: () => x.setTab('events') },
  ];
  const main = (
    <>
      <PurpleHero
        phone={phone}
        kicker="Communities"
        icon="people"
        title="Learn Together. Grow Together."
        sub="Join career-focused communities, ask questions, share experiences and get guidance from mentors and industry professionals."
        photo={x.cc.photos.heroes.communities}
        buttons={[
          { label: 'Find a Community', icon: 'people', onPress: () => p.setTopic('all') },
          { label: 'How It Works', icon: 'playFill', onPress: () => p.setSheet('how') },
        ]}
      />
      <ColorTiles items={tiles} phone={phone} />
      <View style={[s.head, phone && s.headP]}>
        <Text style={s.count}>{p.mentoredOnly ? 'Mentored Communities' : 'Explore Communities'}</Text>
        <View style={s.inline}>
          <Text style={cs.small}>Sort by:</Text>
          <Picker
            compact
            label="Sort by"
            icon="filter"
            value={p.sort}
            options={[
              { value: 'active', label: 'Most Active' },
              { value: 'newest', label: 'Newest' },
              { value: 'largest', label: 'Largest' },
            ]}
            onChange={p.setSort}
          />
        </View>
      </View>
      <Chips p={p} />
      {p.pageInfo.items.length ? (
        <View style={s.grid}>
          {p.pageInfo.items.map((g) => (
            <Card key={g.id} g={g} p={p} phone={phone} />
          ))}
        </View>
      ) : (
        <View style={s.empty}>
          <Text style={s.sideTitle}>No communities here yet</Text>
          <Text style={cs.small}>Ask Maple to start one with “Create a Community”.</Text>
        </View>
      )}
      <Pager info={p.pageInfo} noun="communities" onPage={p.setPage} />
    </>
  );
  return phone ? (
    <View style={s.stack}>
      {main}
      <Side x={x} p={p} />
      <Sheets x={x} p={p} />
    </View>
  ) : (
    <View style={s.cols}>
      <View style={[s.flex, s.stack]}>{main}</View>
      <View style={s.right}>
        <Side x={x} p={p} />
      </View>
      <Sheets x={x} p={p} />
    </View>
  );
}

const s = StyleSheet.create({
  block: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 16, borderRadius: 20, backgroundColor: BRAND_BLUE },
  flex: { flex: 1, minWidth: 0 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stack: { gap: 16 },
  cols: { flexDirection: 'row', gap: 22, alignItems: 'flex-start' },
  right: { width: 350, gap: 18 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  headP: { flexWrap: 'wrap' },
  count: { fontSize: 21, fontWeight: '800', color: L.navy },
  chips: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  chip: { height: 38, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 16, borderRadius: 19, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  chipOn: { borderColor: BRAND_BLUE, backgroundColor: BRAND_BLUE },
  chipText: { fontSize: 13.5, fontWeight: '600', color: L.navy },
  chipTextOn: { color: L.white },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  card: { overflow: 'hidden', borderRadius: 16, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  cardD: { width: '31.8%' },
  cardP: { width: '100%' },
  photo: { width: '100%', height: 104 },
  photoArt: { alignItems: 'center', justifyContent: 'center' },
  body: { gap: 6, padding: 14 },
  title: { fontSize: 16, fontWeight: '800', color: L.navy },
  about: { minHeight: 34 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, fontSize: 11.5, fontWeight: '600', color: BRAND_BLUE, backgroundColor: BRAND_SOFT },
  btns: { flexDirection: 'row', gap: 8, marginTop: 6 },
  solid: { flex: 1, height: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 6, borderRadius: 19, backgroundColor: BRAND_BLUE },
  solidText: { fontSize: 13, fontWeight: '700', color: L.white },
  done: { backgroundColor: Maple.successSoft },
  doneText: { color: Maple.successText },
  outline: { flex: 1, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: Radii.control, borderWidth: 1.5, borderColor: Maple.blueLine },
  outlineText: { fontSize: 13, fontWeight: '700', color: BRAND_BLUE },
  empty: { alignItems: 'center', gap: 6, padding: 26, borderRadius: 14, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  sideTitle: { fontSize: 17, fontWeight: '800', color: L.navy },
  link: { fontSize: 13, fontWeight: '700', color: BRAND_BLUE },
  label: { fontSize: 13.5, fontWeight: '700', color: L.navy },
  start: { gap: 12, padding: 18, borderRadius: Radii.control, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  startHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  startArt: { width: 96, height: 80 },
  wideOutline: { height: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: Radii.control, borderWidth: 1.5, borderColor: BRAND_BLUE },
  session: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sessionPhoto: { width: 92, height: 82, borderRadius: 12 },
  sessionTitle: { fontSize: 14, fontWeight: '700', color: L.navy },
  metaText: { fontSize: 12.5, fontWeight: '500', color: L.navy },
  suggest: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  suggestIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: BRAND_SOFT },
  joinSmall: { height: 32, justifyContent: 'center', paddingHorizontal: 14, borderRadius: Radii.control, borderWidth: 1.5, borderColor: Maple.blueLine },
  guide: { gap: 8, padding: 18, borderRadius: 16, borderWidth: 1, borderColor: Maple.blueSelected, backgroundColor: Maple.blueSoft },
});
