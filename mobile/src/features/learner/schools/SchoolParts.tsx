import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { L } from '@/features/learner/frame/LightFrame';
import type { IconName } from '@/lib/icons';

import type { ExamCentre, SchoolCard } from './networkData';
import type { SchoolPrefs, Stay } from './schoolNetwork';

export const PURPLE = '#5B3FD9';
export const LAVENDER = '#EEEAFE';
const STAR = '#F5A524';

export const ugx = (n: number) => `UGX ${n.toLocaleString('en-US')}`;

/** "4.8 (286 reviews)", or a plain note until a school has reviews. */
export const ratingText = (c: SchoolCard) => (c.rating === null ? 'No reviews yet' : `${c.rating.toFixed(1)} (${c.reviews} reviews)`);

/** What a verified exam centre offers external candidates. */
export function examNote(e: ExamCentre): string {
  if (!e.external) return 'Registers its own learners only';
  const parts = ['Accepts external candidates', e.deadline ? `register by ${e.deadline}` : 'ask the school when to register', e.feeUGX !== null ? ugx(e.feeUGX) : 'fee on request'];
  return parts.join(' · ');
}

/** The school's crest, or its initials on a tile until it uploads one. */
export function Crest({ c, size = 40 }: { c: SchoolCard; size?: number }) {
  if (c.crest) return <Image source={c.crest} style={{ width: size, height: size }} contentFit="contain" />;
  const initials = c.name
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
  return (
    <View style={[s.initials, { width: size, height: size, borderRadius: size / 4 }]} accessibilityLabel={`${c.name} crest`}>
      <Text style={[s.initialsText, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

/** The campus photo, or a soft tile with a building until the school uploads one. */
export function Campus({ c, style }: { c: SchoolCard; style: object[] }) {
  if (c.photo) return <Image source={c.photo} style={style} contentFit="cover" accessibilityLabel={`${c.name} campus`} />;
  return (
    <View style={[...style, s.campusBlank]} accessibilityLabel={`${c.name} campus photo not added yet`}>
      <Icon name="building" size={34} color={PURPLE} />
    </View>
  );
}

export function Tag({ text }: { text: string }) {
  return <Text style={s.tag}>{text}</Text>;
}

function Stat({ icon, value, label }: { icon: IconName; value: string; label: string }) {
  return (
    <View style={s.stat}>
      <Icon name={icon} size={17} color={L.ink} />
      <View>
        <Text style={s.statValue}>{value}</Text>
        {label ? <Text style={s.statLabel}>{label}</Text> : null}
      </View>
    </View>
  );
}

interface CardProps {
  c: SchoolCard;
  saved: boolean;
  onSave: () => void;
  onView: () => void;
  onApply: () => void;
  /** Why it was recommended (shown on the Recommended list). */
  reason?: string;
  phone?: boolean;
}

/** One school: campus photo with a save heart, crest, name, place, rating, chips, blurb, results and the two buttons. */
export function SchoolCardView({ c, saved, onSave, onView, onApply, reason, phone = false }: CardProps) {
  return (
    <View style={[s.card, phone && s.cardP]}>
      <View>
        <Campus c={c} style={[s.photo, phone ? s.photoP : {}]} />
        <Pressable style={s.heart} onPress={onSave} hitSlop={8} accessibilityRole="button" accessibilityState={{ selected: saved }} accessibilityLabel={saved ? `Remove ${c.name} from saved` : `Save ${c.name}`}>
          <Icon name={saved ? 'heartFill' : 'heart'} size={18} color={saved ? '#EF4444' : L.ink} />
        </Pressable>
        <View style={s.crest}>
          <Crest c={c} />
        </View>
      </View>
      <View style={s.cardBody}>
        <View style={s.nameRow}>
          <Text style={s.name} numberOfLines={1}>
            {c.name}
          </Text>
          <Icon name="sealCheck" size={15} color={L.blue} />
        </View>
        <View style={s.placeRow}>
          <Icon name="pin" size={13} color={L.body} />
          <Text style={s.place}>{c.mode === 'Online' ? 'Online' : `${c.town}, Uganda`}</Text>
          {c.mode === 'Online' || c.km === null ? null : <Text style={s.km}>{`${c.km} km`}</Text>}
        </View>
        <View style={s.placeRow}>
          <Icon name="star" size={14} color={c.rating === null ? L.muted : STAR} />
          {c.rating === null ? (
            <Text style={s.place}>No reviews yet</Text>
          ) : (
            <>
              <Text style={s.rating}>{c.rating.toFixed(1)}</Text>
              <Text style={s.place}>{`(${c.reviews} reviews)`}</Text>
            </>
          )}
        </View>
        <View style={s.tags}>
          {c.tags.map((t) => (
            <Tag key={t} text={t} />
          ))}
        </View>
        <Text style={s.blurb} numberOfLines={2}>
          {c.blurb}
        </Text>
        {reason ? (
          <View style={s.reason}>
            <Icon name="tick" size={12} color={L.green} />
            <Text style={s.reasonText} numberOfLines={1}>
              {reason}
            </Text>
          </View>
        ) : null}
        <View style={s.stats}>
          <Stat icon="chart" value={c.passRate === null ? '—' : `${c.passRate}%`} label={c.passLabel} />
          <Stat icon="people" value={c.learners.toLocaleString('en-US')} label="Learners" />
          {c.est === null ? null : <Stat icon="building" value={`Est. ${c.est}`} label="" />}
        </View>
        <View style={s.buttons}>
          <Pressable style={s.view} onPress={onView} accessibilityRole="button" accessibilityLabel={`View ${c.name} profile`}>
            <Text style={s.viewText}>View Profile</Text>
          </Pressable>
          <Pressable style={s.apply} onPress={onApply} accessibilityRole="button" accessibilityLabel={`Apply to ${c.name}`}>
            <Text style={s.applyText}>Apply Now</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.scrim}>
        <View style={s.sheet}>
          <View style={s.sheetHead}>
            <Text style={s.sheetTitle} numberOfLines={2}>
              {title}
            </Text>
            <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel="Close">
              <Icon name="close" size={20} color={L.ink} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={s.sheetBody}>{children}</ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

/** A school's profile: what it teaches, its verified results, admissions, exam services and facilities. */
export function ProfileSheet({ c, saved, onSave, onApply, onClose }: { c: SchoolCard; saved: boolean; onSave: () => void; onApply: () => void; onClose: () => void }) {
  return (
    <Sheet title={c.name} onClose={onClose}>
      <Campus c={c} style={[s.profilePhoto]} />
      <Text style={s.body}>{`${c.mode === 'Online' ? 'Online school' : `${c.town}, ${c.district}`} · ${c.stay} · ${c.mode} · ${ratingText(c)}`}</Text>
      <Text style={s.body}>{c.blurb}</Text>
      <Section title="Programs and levels">
        <View style={s.tags}>
          {[...c.curricula, ...c.levels, ...c.programs].map((t) => (
            <Tag key={t} text={t} />
          ))}
        </View>
      </Section>
      <Section title="Results">
        <Text style={s.body}>{c.passRate === null ? 'This school hasn’t published a pass rate yet.' : `${c.passRate}% ${c.passLabel}`}</Text>
        <Text style={s.note}>{c.passSource}</Text>
      </Section>
      <Section title="Admissions">
        <Text style={s.body}>{`Opens ${c.admissions.opens} · Deadline ${c.admissions.deadline}`}</Text>
        <Text style={s.body}>{c.admissions.feesUGX ? `Fees ${ugx(c.admissions.feesUGX[0])} – ${ugx(c.admissions.feesUGX[1])} per term` : 'Fees on request'}</Text>
        {c.admissions.requirements.length ? <Text style={s.note}>{`You’ll need: ${c.admissions.requirements.join(', ')}`}</Text> : null}
      </Section>
      <Section title="Exam services">
        {c.exam ? (
          <>
            <Text style={s.body}>{`Verified ${c.exam.boards.join(', ')} centre for ${c.exam.exams.join(' and ')}`}</Text>
            <Text style={s.note}>{examNote(c.exam)}</Text>
          </>
        ) : (
          <Text style={s.note}>Not an exam centre.</Text>
        )}
      </Section>
      <Section title="Facilities">
        <Text style={s.body}>{c.facilities.length ? c.facilities.join(' · ') : 'Not listed yet.'}</Text>
      </Section>
      <Text style={s.note}>Looking at this profile is private. The school only sees how many people viewed it, never who.</Text>
      <View style={s.sheetActions}>
        <Pressable style={s.view} onPress={onSave} accessibilityRole="button">
          <Text style={s.viewText}>{saved ? 'Saved' : 'Save school'}</Text>
        </Pressable>
        <Pressable style={s.apply} onPress={onApply} accessibilityRole="button">
          <Text style={s.applyText}>Apply Now</Text>
        </Pressable>
      </View>
    </Sheet>
  );
}

const STAYS: readonly Stay[] = ['Day', 'Boarding', 'Day & Boarding'];
const SUBJECTS = ['STEM', 'Sciences', 'Arts', 'Business', 'Agriculture', 'Music', 'ICT'];

function Choice({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable style={[s.choice, on && s.choiceOn]} onPress={onPress} accessibilityRole="checkbox" accessibilityState={{ checked: on }}>
      <Text style={[s.choiceText, on && s.choiceTextOn]}>{label}</Text>
    </Pressable>
  );
}

/** More Filters: the preferences recommendations use. Schools never see them. */
export function PrefsSheet({ prefs, onChange, onClear, onClose }: { prefs: SchoolPrefs; onChange: (p: SchoolPrefs) => void; onClear: () => void; onClose: () => void }) {
  const subjects = prefs.subjects ?? [];
  return (
    <Sheet title="More filters" onClose={onClose}>
      <Text style={s.note}>Recommendations use only the choices you set here. Schools never see them.</Text>
      <Section title="Day or boarding">
        <View style={s.tags}>
          {STAYS.map((x) => (
            <Choice key={x} label={x} on={prefs.stay === x} onPress={() => onChange({ ...prefs, stay: prefs.stay === x ? undefined : x })} />
          ))}
        </View>
      </Section>
      <Section title="Programs you’re exploring">
        <View style={s.tags}>
          {SUBJECTS.map((x) => (
            <Choice key={x} label={x} on={subjects.includes(x)} onPress={() => onChange({ ...prefs, subjects: subjects.includes(x) ? subjects.filter((y) => y !== x) : [...subjects, x] })} />
          ))}
        </View>
      </Section>
      <View style={s.sheetActions}>
        <Pressable style={s.view} onPress={onClear} accessibilityRole="button">
          <Text style={s.viewText}>Clear all</Text>
        </Pressable>
        <Pressable style={s.apply} onPress={onClose} accessibilityRole="button">
          <Text style={s.applyText}>Done</Text>
        </Pressable>
      </View>
    </Sheet>
  );
}

const s = StyleSheet.create({
  card: { width: 296, overflow: 'hidden', borderRadius: 14, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  cardP: { width: '100%' },
  photo: { width: '100%', height: 100 },
  photoP: { height: 140 },
  heart: { position: 'absolute', top: 8, right: 8, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: L.white },
  crest: { position: 'absolute', left: 14, bottom: -24, width: 56, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: L.white, shadowColor: '#0B1A3F', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  initials: { alignItems: 'center', justifyContent: 'center', backgroundColor: LAVENDER },
  initialsText: { fontWeight: '800', color: PURPLE },
  campusBlank: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEF2FA' },
  cardBody: { gap: 5, paddingHorizontal: 14, paddingTop: 8, paddingBottom: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingLeft: 62 },
  name: { flexShrink: 1, fontSize: 13, letterSpacing: -0.3, fontWeight: '700', color: L.navy },
  placeRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  place: { fontSize: 12, color: L.body },
  km: { overflow: 'hidden', marginLeft: 6, paddingHorizontal: 7, paddingVertical: 1, borderRadius: 6, fontSize: 11.5, color: L.ink, backgroundColor: '#F1F4F9' },
  rating: { fontSize: 12, fontWeight: '600', color: L.ink },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, fontSize: 10.5, fontWeight: '500', color: L.ink, backgroundColor: '#EEF2FA' },
  blurb: { fontSize: 11.5, lineHeight: 15, color: L.body },
  reason: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  reasonText: { flex: 1, fontSize: 11.5, fontWeight: '500', color: L.green },
  stats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statValue: { fontSize: 12.5, fontWeight: '700', color: L.navy },
  statLabel: { fontSize: 8.5, color: L.body },
  buttons: { flexDirection: 'row', gap: 10, marginTop: 6 },
  view: { flex: 1, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#E9EEF8' },
  viewText: { fontSize: 12.5, fontWeight: '600', color: L.navy },
  apply: { flex: 1, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: L.blue },
  applyText: { fontSize: 12.5, fontWeight: '600', color: L.white },
  scrim: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: 'rgba(11,26,63,0.35)' },
  sheet: { width: '100%', maxWidth: 560, maxHeight: '90%', overflow: 'hidden', borderRadius: 18, backgroundColor: L.white },
  sheetHead: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 18, borderBottomWidth: 1, borderBottomColor: L.line },
  sheetTitle: { flex: 1, fontSize: 19, fontWeight: '700', color: L.navy },
  sheetBody: { gap: 12, padding: 18 },
  profilePhoto: { width: '100%', height: 150, borderRadius: 12 },
  section: { gap: 6 },
  sectionTitle: { fontSize: 14.5, fontWeight: '700', color: L.navy },
  body: { flexShrink: 1, fontSize: 13.5, lineHeight: 19, color: L.ink },
  note: { fontSize: 12.5, lineHeight: 17, color: L.body },
  sheetActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  progress: { gap: 6 },
  bar: { height: 6, borderRadius: 3, backgroundColor: '#E6EBF3' },
  barFill: { height: 6, borderRadius: 3, backgroundColor: L.blue },
  choice: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: L.line },
  choiceOn: { borderColor: PURPLE, backgroundColor: LAVENDER },
  choiceText: { fontSize: 13, color: L.ink },
  choiceTextOn: { fontWeight: '600', color: PURPLE },
});
