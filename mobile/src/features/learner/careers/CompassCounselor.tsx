import { Image } from '@/components/picture';
import { type Href, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { L } from '@/features/learner/frame/LightFrame';
import { Picker } from '@/features/learner/lessons/LessonParts';
import { checkMobileNumber, type MobileNetwork } from '@/lib/pay-link';
import { toast } from '@/lib/toast';

import { Bullets, Chips, cs, BRAND_SOFT, BRAND_BLUE, Sheet, ugx } from './CareerParts';
import { addSessions, extraSessionsQuote, FREE_CANCEL_HOURS, MAX_EXTRA_SESSIONS, slotLabel } from './compass';
import { ColorTiles, Pager, PurpleHero, SideCard } from './CompassCards';
import { type CounselorFilters, filterCounselors, nextTimes, NO_COUNSELOR_FILTERS } from './counselors';
import { paginate } from './directory';
import { setCounseling } from './saved';
import type { Compass } from './useCompass';
import { Maple, Radii } from '@/constants/maple';
import { Palette } from '@/constants/palette';

type Person = Compass['cc']['counseling']['counselors'][number];
const PAGE = 4;
const any = (label: string, values: readonly { value: string; label: string }[]) => [{ value: 'all', label }, ...values];
const unique = (xs: readonly string[]) => [...new Set(xs)].sort();

function useCounselorPage(x: Compass) {
  const c = x.cc.counseling;
  const [view, setView] = useState<'find' | 'mine'>('find');
  const [f, setF] = useState<CounselorFilters>(NO_COUNSELOR_FILTERS);
  const [sort, setSort] = useState<'relevant' | 'sessions'>('relevant');
  const [page, setPage] = useState(1);
  const [booking, setBooking] = useState<{ counselorId: string; replacing?: string } | null>(null);
  const [profile, setProfile] = useState<string | null>(null);
  const [info, setInfo] = useState<'how' | 'more' | null>(null);
  const found = filterCounselors(c.counselors, c.slots, x.counseling, f, x.now).sort((a, b) => (sort === 'sessions' ? b.sessions - a.sessions : b.rating - a.rating));
  const set = (patch: Partial<CounselorFilters>) => {
    setF({ ...f, ...patch });
    setPage(1);
  };
  const upcoming = [...x.counseling.sessions].filter((b) => b.at > x.now).sort((a, b) => a.at.localeCompare(b.at));
  return { c, view, setView, f, set, sort, setSort, pageInfo: paginate(found, page, PAGE), setPage, booking, setBooking, profile, setProfile, info, setInfo, upcoming, who: (id: string) => c.counselors.find((p) => p.id === id) };
}
type CP = ReturnType<typeof useCounselorPage>;

function Avatar({ p, size }: { p: Person; size: 'large' | 'medium' | 'small' }) {
  return (
    <View style={s.avatarWrap}>
      <Image decorative source={p.photo} style={AVATAR[size]} contentFit="cover" />
      <View style={[s.online, size === 'large' ? s.onlineBig : s.onlineSmall]} />
    </View>
  );
}

function CounselorCard({ x, p, cp, phone }: { x: Compass; p: Person; cp: CP; phone: boolean }) {
  const times = nextTimes(cp.c.slots, x.counseling, p.id, x.now);
  return (
    <View style={[s.card, phone && s.cardP]}>
      <Avatar p={p} size={phone ? 'medium' : 'large'} />
      <View style={s.flex}>
        <View style={s.nameRow}>
          <Text style={s.name}>{p.name}</Text>
          <Icon name="verified" size={18} color={L.blue} />
          {!phone ? <View style={s.flex} /> : null}
          <View style={s.cred}>
            <Icon name="shield" size={12} color={Maple.successText} />
            <Text style={s.credText}>{p.checked}</Text>
          </View>
        </View>
        <Text style={s.role}>{p.title}</Text>
        <View style={[s.cols, phone && s.colsP]}>
          <View style={s.flex}>
            <Text style={cs.body}>{p.about}</Text>
            <View style={s.meta}>
              <View style={s.metaItem}>
                <Icon name="star" size={14} color={Maple.warning} />
                <Text style={s.metaText}>{`${p.rating} (${p.sessions} sessions)`}</Text>
              </View>
              <View style={s.metaItem}>
                <Icon name="globe" size={14} color={L.ink} />
                <Text style={s.metaText}>{p.languages.join(', ')}</Text>
              </View>
              <View style={s.metaItem}>
                <Icon name="pin" size={14} color={L.ink} />
                <Text style={s.metaText}>{p.location}</Text>
              </View>
            </View>
            <View style={s.tags}>
              {p.focus.map((t) => (
                <Text key={t} style={s.tag}>
                  {t}
                </Text>
              ))}
            </View>
          </View>
          <View style={[s.times, !phone && s.timesD]}>
            <View style={s.row}>
              <Icon name="calendar" size={14} color={L.navy} />
              <Text style={s.timesTitle}>Next available times</Text>
            </View>
            {times.length ? (
              times.map((t) => (
                <Pressable key={t.id} style={s.time} onPress={() => cp.setBooking({ counselorId: p.id })} accessibilityRole="button" accessibilityLabel={`Book ${p.name}, ${slotLabel(t.at)}`}>
                  <Icon name="calendar" size={13} color={BRAND_BLUE} />
                  <Text style={s.timeText}>{slotLabel(t.at)}</Text>
                </Pressable>
              ))
            ) : (
              <Text style={cs.small}>No open times right now.</Text>
            )}
          </View>
          <View style={[s.actions, !phone && s.actionsD]}>
            <Pressable style={s.solid} onPress={() => cp.setBooking({ counselorId: p.id })} accessibilityRole="button" accessibilityLabel={`Book a session with ${p.name}`}>
              <Text style={s.solidText}>Book a Session</Text>
              <Icon name="arrowRight" size={13} color={L.white} />
            </Pressable>
            <Pressable style={s.outline} onPress={() => cp.setProfile(p.id)} accessibilityRole="button" accessibilityLabel={`View ${p.name}'s profile`}>
              <Icon name="person" size={14} color={BRAND_BLUE} />
              <Text style={s.outlineText}>View Profile</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

function FindTab({ x, cp, phone }: { x: Compass; cp: CP; phone: boolean }) {
  const all = cp.c.counselors;
  const filters = (
    <View style={[s.filters, phone && s.nowrap]}>
      <Picker compact label="Area" icon="grid" value={cp.f.area} options={any('All Areas', x.cc.areas.map((a) => ({ value: a.id, label: a.label })))} onChange={(v) => cp.set({ area: v })} />
      <Picker compact label="Specialization" icon="cap" value={cp.f.focus} options={any('All Specializations', unique(all.flatMap((p) => p.focus)).map((v) => ({ value: v, label: v })))} onChange={(v) => cp.set({ focus: v })} />
      <Picker compact label="Language" icon="globe" value={cp.f.language} options={any('Language', unique(all.flatMap((p) => p.languages)).map((v) => ({ value: v, label: v })))} onChange={(v) => cp.set({ language: v })} />
      <Picker
        compact
        label="Availability"
        icon="calendar"
        value={cp.f.availability}
        options={any('Availability', [
          { value: 'week', label: 'This week' },
          { value: 'fortnight', label: 'Next two weeks' },
        ])}
        onChange={(v) => cp.set({ availability: v })}
      />
    </View>
  );
  return (
    <View style={s.stack}>
      <View style={[s.filterBar, phone && s.filterBarP]}>
        {phone ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filters}
          </ScrollView>
        ) : (
          filters
        )}
        <View style={s.row}>
          <Text style={cs.small}>Sort by:</Text>
          <Picker
            compact
            label="Sort by"
            icon="filter"
            value={cp.sort}
            options={[
              { value: 'relevant', label: 'Most Relevant' },
              { value: 'sessions', label: 'Most Sessions' },
            ]}
            onChange={cp.setSort}
          />
        </View>
      </View>
      {cp.pageInfo.items.length ? (
        cp.pageInfo.items.map((p) => <CounselorCard key={p.id} x={x} p={p} cp={cp} phone={phone} />)
      ) : (
        <View style={s.empty}>
          <Text style={s.sideTitle}>No counselors match</Text>
          <Text style={cs.small}>Try another area, language or time.</Text>
        </View>
      )}
      <Pager info={cp.pageInfo} noun="counselors" onPage={cp.setPage} />
    </View>
  );
}

function MineTab({ x, cp }: { x: Compass; cp: CP }) {
  return (
    <View style={s.stack}>
      {cp.upcoming.length ? (
        cp.upcoming.map((b) => {
          const p = cp.who(b.counselorId);
          return (
            <View key={b.id} style={s.session}>
              {p ? <Avatar p={p} size="small" /> : null}
              <View style={s.flex}>
                <Text style={s.name}>{slotLabel(b.at)}</Text>
                <Text style={cs.body}>{`${p?.name ?? ''} · ${b.topic}`}</Text>
              </View>
              <Pressable style={[s.smallBtn, s.smallSolid]} onPress={() => router.push(`/counseling/${b.id}` as Href)} accessibilityRole="button">
                <Text style={s.smallSolidText}>Join</Text>
              </Pressable>
              <Pressable style={s.smallBtn} onPress={() => cp.setBooking({ counselorId: b.counselorId, replacing: b.id })} accessibilityRole="button">
                <Text style={s.outlineText}>Reschedule</Text>
              </Pressable>
              <Pressable style={s.smallBtn} onPress={() => x.cancel(b.id)} accessibilityRole="button">
                <Text style={s.outlineText}>Cancel</Text>
              </Pressable>
            </View>
          );
        })
      ) : (
        <View style={s.empty}>
          <Text style={s.sideTitle}>No sessions booked</Text>
          <Text style={cs.small}>Find a counselor and pick a time that suits you.</Text>
        </View>
      )}
      <Text style={cs.note}>{`Cancel or move a session at least ${FREE_CANCEL_HOURS} hours ahead to keep it. Session notes are private: schools, universities and sponsors never see them.`}</Text>
    </View>
  );
}

function Balance({ x, cp }: { x: Compass; cp: CP }) {
  return (
    <SideCard title="My Session Balance" icon="person">
      <View style={s.balance}>
        <View style={s.balanceIcon}>
          <Icon name="calendar" size={24} color={BRAND_BLUE} />
        </View>
        <View style={s.flex}>
          <Text style={s.balanceValue}>{`${x.counseling.credits} of ${cp.c.included}`}</Text>
          <Text style={cs.body}>sessions left</Text>
        </View>
        <Text style={s.premium}>Premium</Text>
      </View>
      <Text style={cs.small}>{`Included in your Premium plan each term. Extra sessions: ${ugx(cp.c.pricePerSessionUGX)} each.`}</Text>
      <Pressable style={s.wideOutline} onPress={() => cp.setInfo('more')} accessibilityRole="button">
        <Text style={s.outlineText}>Buy Extra Sessions</Text>
        <Icon name="arrowRight" size={14} color={BRAND_BLUE} />
      </Pressable>
    </SideCard>
  );
}

function NextSession({ x, cp }: { x: Compass; cp: CP }) {
  const b = cp.upcoming[0];
  const p = b ? cp.who(b.counselorId) : undefined;
  return (
    <SideCard title="Upcoming Session" icon="calendar">
      {b && p ? (
        <>
          <View style={s.next}>
            <Image decorative source={p.photo} style={s.nextPhoto} contentFit="cover" />
            <View style={s.flex}>
              <Text style={s.name}>{p.name}</Text>
              <Text style={cs.small}>{b.topic}</Text>
              <View style={s.row}>
                <Icon name="calendar" size={13} color={Maple.successText} />
                <Text style={s.metaText}>{slotLabel(b.at)}</Text>
              </View>
            </View>
          </View>
          <View style={s.row}>
            <Pressable style={s.solid} onPress={() => router.push(`/counseling/${b.id}` as Href)} accessibilityRole="button">
              <Text style={s.solidText}>Join Session</Text>
            </Pressable>
            <Pressable style={s.outline} onPress={() => cp.setBooking({ counselorId: b.counselorId, replacing: b.id })} accessibilityRole="button">
              <Text style={s.outlineText}>Reschedule</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          <Text style={cs.small}>No session booked yet.</Text>
          <Pressable style={s.block} onPress={() => cp.setBooking({ counselorId: cp.c.counselors[0].id })} accessibilityRole="button">
            <Text style={s.solidText}>Book a Session</Text>
          </Pressable>
        </>
      )}
    </SideCard>
  );
}

const TIPS = ['Think about the topics you want to discuss.', 'Have your study interests and goals ready.', 'Bring any questions about programs, universities or applications.'];

function Tips() {
  return (
    <SideCard title="Get the Most from Your Session" icon="bulb">
      {TIPS.map((t) => (
        <View key={t} style={s.tip}>
          <Icon name="sealCheck" size={18} color={Maple.successText} />
          <Text style={[cs.body, s.flex]}>{t}</Text>
        </View>
      ))}
    </SideCard>
  );
}

function HowCard({ x, cp }: { x: Compass; cp: CP }) {
  return (
    <Pressable style={s.how} onPress={() => cp.setInfo('how')} accessibilityRole="button">
      <Icon name="playFill" size={22} color={BRAND_BLUE} />
      <View style={s.flex}>
        <Text style={s.sideTitle}>How Counseling Works</Text>
        <Text style={cs.small}>A quick guide to booking, preparing and joining your session.</Text>
      </View>
      <Image decorative source={x.cc.photos.art.howCounseling} style={s.howArt} contentFit="contain" />
    </Pressable>
  );
}

type PayStep = 'choose' | 'approve' | 'done';

/**
 * Buying extra counseling sessions with mobile money. This design build stands in for the provider:
 * "approve on your phone" is confirmed by the learner here; the live build asks the payment provider.
 */
function BuySessions({ x, cp }: { x: Compass; cp: CP }) {
  const [qty, setQty] = useState(1);
  const [network, setNetwork] = useState<MobileNetwork>('mtn');
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<PayStep>('choose');
  const [error, setError] = useState<string | null>(null);
  const [ref] = useState(() => `CS-${Date.now().toString(36).toUpperCase()}`);
  const quote = extraSessionsQuote(qty, cp.c.pricePerSessionUGX);
  const close = () => cp.setInfo(null);
  const pay = () => {
    const check = checkMobileNumber(network, phone);
    if (!check.ok) return setError(check.message);
    setError(null);
    setStep('approve');
  };
  return (
    <Sheet title="Buy extra sessions" onClose={close}>
      {step === 'choose' ? (
        <>
          <Text style={cs.body}>{`Premium includes ${cp.c.included} sessions each term. Extra sessions are ${ugx(cp.c.pricePerSessionUGX)} each and never expire.`}</Text>
          <Text style={s.label}>How many?</Text>
          <Chips options={Array.from({ length: MAX_EXTRA_SESSIONS }, (_, i) => `${i + 1} session${i ? 's' : ''}`)} on={[`${quote.qty} session${quote.qty > 1 ? 's' : ''}`]} onPress={(v) => setQty(Number(v.split(' ')[0]))} />
          <Text style={s.label}>Pay with</Text>
          <Chips options={['MTN MoMo', 'Airtel Money']} on={[network === 'mtn' ? 'MTN MoMo' : 'Airtel Money']} onPress={(v) => setNetwork(v === 'MTN MoMo' ? 'mtn' : 'airtel')} />
          <TextInput style={s.phone} value={phone} onChangeText={setPhone} placeholder={network === 'mtn' ? '0772 123 456' : '0701 234 567'} placeholderTextColor={L.body} keyboardType="phone-pad" accessibilityLabel="Mobile money number" />
          {error ? <Text style={s.error}>{error}</Text> : null}
          <View style={s.total}>
            <Text style={cs.body}>To pay</Text>
            <Text style={s.totalValue}>{ugx(quote.totalUGX)}</Text>
          </View>
          <Pressable style={s.block} onPress={pay} accessibilityRole="button">
            <Icon name="lock" size={14} color={L.white} />
            <Text style={s.solidText}>{`Pay ${ugx(quote.totalUGX)}`}</Text>
          </Pressable>
          <Text style={cs.note}>Schools can also buy session packages for their learners.</Text>
        </>
      ) : null}
      {step === 'approve' ? (
        <>
          <View style={s.approve}>
            <Icon name="phone" size={28} color={BRAND_BLUE} />
            <Text style={s.name}>Check your phone</Text>
            <Text style={[cs.body, s.centerText]}>{`Approve the ${ugx(quote.totalUGX)} payment request from Maple with your ${network === 'mtn' ? 'MTN MoMo' : 'Airtel Money'} PIN.`}</Text>
            <Text style={cs.small}>{`Reference ${ref}`}</Text>
          </View>
          <Pressable
            style={s.block}
            onPress={() => {
              setCounseling(addSessions(x.counseling, quote.qty));
              setStep('done');
            }}
            accessibilityRole="button">
            <Text style={s.solidText}>I’ve approved it</Text>
          </Pressable>
          <Pressable style={s.wideOutline} onPress={() => setStep('choose')} accessibilityRole="button">
            <Text style={s.outlineText}>Change number or cancel</Text>
          </Pressable>
        </>
      ) : null}
      {step === 'done' ? (
        <>
          <View style={s.approve}>
            <Icon name="sealCheck" size={30} color={Maple.successText} />
            <Text style={s.name}>{`${quote.qty} session${quote.qty > 1 ? 's' : ''} added`}</Text>
            <Text style={[cs.body, s.centerText]}>{`You now have ${x.counseling.credits} sessions to book. Keep reference ${ref} for your records.`}</Text>
          </View>
          <Pressable
            style={s.block}
            onPress={() => {
              close();
              cp.setView('find');
            }}
            accessibilityRole="button">
            <Text style={s.solidText}>Book a session</Text>
          </Pressable>
        </>
      ) : null}
    </Sheet>
  );
}

function Sheets({ x, cp }: { x: Compass; cp: CP }) {
  const [pick, setPick] = useState<string | null>(null);
  const [topic, setTopic] = useState(x.topic);
  const b = cp.booking ? cp.who(cp.booking.counselorId) : undefined;
  const prof = cp.profile ? cp.who(cp.profile) : undefined;
  const times = b ? nextTimes(cp.c.slots, x.counseling, b.id, x.now, 8) : [];
  const close = () => {
    cp.setBooking(null);
    setPick(null);
  };
  return (
    <>
      {b ? (
        <Sheet title={cp.booking?.replacing ? `Move your session with ${b.name}` : `Book a session with ${b.name}`} onClose={close}>
          <Text style={s.label}>Choose a time</Text>
          <Chips options={times.map((t) => slotLabel(t.at))} on={pick ? [slotLabel(times.find((t) => t.id === pick)?.at ?? '')] : []} onPress={(v) => setPick(times.find((t) => slotLabel(t.at) === v)?.id ?? null)} />
          {!cp.booking?.replacing ? (
            <>
              <Text style={s.label}>What would you like to talk about?</Text>
              <Chips options={cp.c.topics} on={[topic]} onPress={setTopic} />
            </>
          ) : null}
          <Text style={cs.small}>{cp.booking?.replacing ? `Moving at least ${FREE_CANCEL_HOURS} hours ahead is free.` : `This uses one of your ${x.counseling.credits} included sessions. Your counselor sees your topic, not your grades.`}</Text>
          <Pressable
            style={[s.block, !pick && s.disabled]}
            disabled={!pick}
            onPress={() => {
              const slot = times.find((t) => t.id === pick);
              if (!slot) return;
              if (cp.booking?.replacing) x.reschedule(cp.booking.replacing, slot);
              else x.book(slot, topic);
              close();
              cp.setView('mine');
            }}
            accessibilityRole="button">
            <Text style={s.solidText}>{cp.booking?.replacing ? 'Move session' : 'Confirm booking'}</Text>
          </Pressable>
        </Sheet>
      ) : null}
      {prof ? (
        <Sheet title={prof.name} onClose={() => cp.setProfile(null)}>
          <View style={s.next}>
            <Image decorative source={prof.photo} style={s.profilePhoto} contentFit="cover" />
            <View style={s.flex}>
              <Text style={s.role}>{prof.title}</Text>
              <Text style={cs.small}>{`${prof.location} · ${prof.languages.join(', ')}`}</Text>
              <Text style={cs.small}>{`Rated ${prof.rating} out of 5 from ${prof.sessions} sessions`}</Text>
            </View>
          </View>
          <Text style={cs.body}>{prof.about}</Text>
          <Text style={s.label}>Specialties</Text>
          <Bullets items={prof.focus} />
          <Text style={cs.note}>{`${prof.checked}. Independent Maple counselors aren’t paid by any school or university, and say so if they have any affiliation.`}</Text>
        </Sheet>
      ) : null}
      {cp.info === 'how' ? (
        <Sheet title="How counseling works" onClose={() => cp.setInfo(null)}>
          <Bullets
            items={[
              'Pick a verified counselor and an open time that suits you.',
              'Choose a topic, so your counselor can prepare.',
              'Join by video from My Sessions when it’s time; it opens 10 minutes before.',
              'Agree next steps together; they appear in My Plan.',
              `Move or cancel at least ${FREE_CANCEL_HOURS} hours ahead to keep your session.`,
            ]}
          />
          <Text style={cs.note}>Session notes stay between you and your counselor. Parents see them only if you choose to share.</Text>
        </Sheet>
      ) : null}
      {cp.info === 'more' ? <BuySessions x={x} cp={cp} /> : null}
    </>
  );
}

/** Counselor & Sessions (its reference): find a verified counselor, book and manage sessions, with the included session balance. */
export function CounselorSection({ x, phone }: { x: Compass; phone: boolean }) {
  const cp = useCounselorPage(x);
  const topicTile = (topic: string) => () => {
    x.setTopic(topic);
    cp.setView('find');
    toast(`Topic set: ${topic}. Pick a counselor and a time.`);
  };
  const tiles = [
    { key: 'careers', title: 'Explore Careers', sub: 'Discover and compare career options', icon: 'cap' as const, tint: Maple.blueSoft, color: BRAND_BLUE, onPress: topicTile('Exploring careers') },
    { key: 'subjects', title: 'Subject Choices', sub: 'Get guidance on the right subjects', icon: 'layers' as const, tint: Maple.blueSoft, color: Maple.blue, onPress: topicTile('Choosing A-Level subjects') },
    { key: 'unis', title: 'University Options', sub: 'Find programs and entry requirements', icon: 'building' as const, tint: Maple.successSoft, color: Maple.successText, onPress: topicTile('University and program choices') },
    { key: 'funding', title: 'Scholarships', sub: 'Learn about funding and how to apply', icon: 'award' as const, tint: Maple.warningSoft, color: Maple.warning, onPress: topicTile('Scholarships and funding') },
    { key: 'review', title: 'Application Review', sub: 'Get support on your applications', icon: 'doc' as const, tint: Palette.pink50, color: Palette.pink600, onPress: topicTile('Application review') },
  ];
  const main = (
    <>
      <PurpleHero
        phone={phone}
        kicker="Counselor & Sessions"
        icon="headset"
        title="Get Expert Career Guidance"
        sub="Talk one-to-one with a verified career counselor, get clarity on your options, and take confident steps toward your future."
        photo={x.cc.photos.heroes.counselor}
        buttons={[
          { label: 'Book a Session', icon: 'calendar', onPress: () => cp.setBooking({ counselorId: cp.c.counselors[0].id }) },
          { label: 'How It Works', icon: 'playFill', onPress: () => cp.setInfo('how') },
        ]}
      />
      <ColorTiles items={tiles} phone={phone} />
      <View style={s.tabs} accessibilityRole="tablist">
        {(
          [
            ['find', 'Find a Counselor', 'people'],
            ['mine', `My Sessions (${cp.upcoming.length})`, 'calendar'],
          ] as const
        ).map(([key, label, icon]) => (
          <Pressable key={key} style={s.tab} onPress={() => cp.setView(key)} accessibilityRole="tab" accessibilityState={{ selected: cp.view === key }}>
            <Icon name={icon} size={18} color={cp.view === key ? BRAND_BLUE : L.ink} />
            <Text style={[s.tabText, cp.view === key && s.tabOn]}>{label}</Text>
            {cp.view === key ? <View style={s.tabLine} /> : null}
          </Pressable>
        ))}
      </View>
      {cp.view === 'find' ? <FindTab x={x} cp={cp} phone={phone} /> : <MineTab x={x} cp={cp} />}
    </>
  );
  const side = (
    <>
      <Balance x={x} cp={cp} />
      <NextSession x={x} cp={cp} />
      <Tips />
      <HowCard x={x} cp={cp} />
    </>
  );
  return phone ? (
    <View style={s.stack}>
      {main}
      {side}
      <Sheets x={x} cp={cp} />
    </View>
  ) : (
    <View style={s.page}>
      <View style={[s.flex, s.stack]}>{main}</View>
      <View style={s.right}>{side}</View>
      <Sheets x={x} cp={cp} />
    </View>
  );
}

const AVATAR = StyleSheet.create({
  large: { width: 128, height: 128, borderRadius: 16 },
  medium: { width: 72, height: 72, borderRadius: 36 },
  small: { width: 56, height: 56, borderRadius: 28 },
});

const s = StyleSheet.create({
  block: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 16, borderRadius: 20, backgroundColor: BRAND_BLUE },
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stack: { gap: 16 },
  page: { flexDirection: 'row', gap: 22, alignItems: 'flex-start' },
  right: { width: 350, gap: 18 },
  cols: { flexDirection: 'row', gap: 16, marginTop: 8 },
  colsP: { flexDirection: 'column' },
  tabs: { flexDirection: 'row', gap: 6, borderBottomWidth: 1, borderBottomColor: L.line },
  tab: { height: 48, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16 },
  tabText: { fontSize: 16, fontWeight: '600', color: L.ink },
  tabOn: { fontWeight: '800', color: BRAND_BLUE },
  tabLine: { position: 'absolute', left: 8, right: 8, bottom: -1, height: 3, borderRadius: 2, backgroundColor: BRAND_BLUE },
  filterBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  filterBarP: { flexDirection: 'column', alignItems: 'stretch' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, flexShrink: 1 },
  nowrap: { flexWrap: 'nowrap' },
  card: { flexDirection: 'row', gap: 20, padding: 18, borderRadius: 16, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  cardP: { gap: 12, padding: 14 },
  avatarWrap: { alignSelf: 'flex-start' },
  online: { position: 'absolute', borderWidth: 3, borderColor: L.white, backgroundColor: Maple.successText },
  onlineBig: { right: -4, bottom: -4, width: 20, height: 20, borderRadius: 10 },
  onlineSmall: { right: -2, bottom: -2, width: 14, height: 14, borderRadius: 7 },
  nameRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  name: { fontSize: 17.5, fontWeight: '800', color: L.navy },
  role: { fontSize: 13.5, color: L.ink },
  cred: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, backgroundColor: Maple.successSoft },
  credText: { fontSize: 11.5, fontWeight: '600', color: Maple.successText },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12.5, fontWeight: '500', color: L.navy },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  tag: { overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, fontSize: 12, fontWeight: '600', color: BRAND_BLUE, backgroundColor: BRAND_SOFT },
  times: { gap: 6, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: L.line },
  timesD: { width: 200 },
  timesTitle: { fontSize: 13, fontWeight: '700', color: L.navy },
  time: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, backgroundColor: Maple.blueSoft },
  timeText: { fontSize: 12.5, fontWeight: '600', color: L.navy },
  actions: { gap: 10 },
  actionsD: { width: 150 },
  solid: { flex: 1, minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 12, borderRadius: 12, backgroundColor: BRAND_BLUE },
  solidText: { fontSize: 13.5, fontWeight: '700', color: L.white },
  outline: { flex: 1, minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1.5, borderColor: Maple.blueLine },
  outlineText: { fontSize: 13, fontWeight: '700', color: BRAND_BLUE },
  smallSolid: { borderColor: BRAND_BLUE, backgroundColor: BRAND_BLUE },
  smallSolidText: { fontSize: 13, fontWeight: '700', color: L.white },
  smallBtn: { height: 34, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 10, borderWidth: 1.5, borderColor: Maple.blueLine },
  disabled: { opacity: 0.45 },
  empty: { alignItems: 'center', gap: 6, padding: 26, borderRadius: 14, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  session: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  sideTitle: { fontSize: 17, fontWeight: '800', color: L.navy },
  label: { fontSize: 13.5, fontWeight: '700', color: L.navy },
  balance: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  balanceIcon: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 26, backgroundColor: BRAND_SOFT },
  balanceValue: { fontSize: 26, fontWeight: '800', color: L.navy },
  premium: { alignSelf: 'flex-start', overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, fontSize: 12.5, fontWeight: '700', color: BRAND_BLUE, backgroundColor: BRAND_SOFT },
  phone: { height: 46, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: L.line, fontSize: 15, color: L.ink },
  error: { fontSize: 13, color: Maple.error },
  total: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12, backgroundColor: BRAND_SOFT },
  totalValue: { fontSize: 18, fontWeight: '800', color: L.navy },
  approve: { alignItems: 'center', gap: 8, padding: 18 },
  centerText: { textAlign: 'center' },
  wideOutline: { height: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: Radii.control, borderWidth: 1.5, borderColor: BRAND_BLUE },
  next: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  nextPhoto: { width: 62, height: 62, borderRadius: 31 },
  profilePhoto: { width: 86, height: 86, borderRadius: 16 },
  tip: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  how: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 18, borderRadius: 16, borderWidth: 1, borderColor: Maple.blueSelected, backgroundColor: Maple.blueSoft },
  howArt: { width: 86, height: 78 },
});
