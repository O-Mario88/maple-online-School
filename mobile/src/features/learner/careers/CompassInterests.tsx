import { Image } from '@/components/picture';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { L } from '@/features/learner/frame/LightFrame';
import type { IconName } from '@/lib/icons';

import type { Answers } from './careers';
import { Bullets, CareerCard, Chips, cs, BRAND_SOFT, BRAND_BLUE, Sheet } from './CareerParts';
import { MIN_INTERESTS } from './compass';
import { PurpleHero } from './CompassCards';
import { ResultsView } from './CompassResults';
import { LIKERT, PREFERENCE_STATEMENTS } from './profile';
import type { Compass } from './useCompass';
import { Maple, Radii } from '@/constants/maple';
import { Palette } from '@/constants/palette';

const STEP_LABEL = { interests: 'Interests', work: 'Work Style', skills: 'Skills', preferences: 'Preferences', results: 'Results' } as const;
const QUESTION = {
  interests: ['What topics or activities do you enjoy most?', `Select all that apply. Choose at least ${MIN_INTERESTS}.`],
  work: ['Where would you like to work?', 'Pick the places that sound good. You can choose more than one.'],
  skills: ['Which subjects are you strongest in?', 'Choose the subjects you do well in or enjoy most.'],
  preferences: ['How much do you agree?', 'There are no right answers. Go with your first feeling.'],
  results: ['Careers worth exploring', 'Suggestions from your answers, with the reasons. Nothing here is decided: explore widely and change your answers any time.'],
} as const;
const PLACES: Readonly<Record<string, { label: string; icon: IconName }>> = {
  hospital: { label: 'Hospital or clinic', icon: 'pulse' },
  lab: { label: 'Laboratory', icon: 'flask' },
  office: { label: 'Office', icon: 'building' },
  field: { label: 'On site', icon: 'pin' },
  outdoors: { label: 'Outdoors', icon: 'leaf' },
  classroom: { label: 'Classroom', icon: 'cap' },
  community: { label: 'In the community', icon: 'people' },
  studio: { label: 'Studio', icon: 'image' },
};
const EXPLORE: readonly { icon: IconName; title: string; sub: string; color: string; tint: string }[] = [
  { icon: 'heart', title: 'Your Interests', sub: 'Activities and topics you enjoy.', color: Palette.pink500b, tint: Palette.pink50 },
  { icon: 'bolt', title: 'Your Strengths', sub: 'Subjects you do well in.', color: Maple.warning, tint: Maple.warningSoft },
  { icon: 'layers', title: 'Your Work Style', sub: 'The places and ways you like to work.', color: Maple.blue, tint: Maple.blueSoft },
];

const toggle = (a: Answers, key: keyof Answers, v: string): Answers => ({ ...a, [key]: a[key].includes(v) ? a[key].filter((x) => x !== v) : [...a[key], v] });

function SubTabs({ x }: { x: Compass }) {
  const tabs = [
    { key: 'assessment', label: 'Assessment', icon: 'clipboard' },
    { key: 'results', label: 'Your Results', icon: 'chart' },
  ] as const;
  return (
    <View style={s.subTabs} accessibilityRole="tablist">
      {tabs.map((t) => {
        const on = x.view === t.key;
        return (
          <Pressable key={t.key} style={s.subTab} onPress={() => x.setView(t.key)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
            <Icon name={t.icon} size={20} color={on ? BRAND_BLUE : L.navy} />
            <Text style={[s.subTabText, on && s.subTabOn]}>{t.label}</Text>
            {on ? <View style={s.subLine} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

/** One agree/disagree statement with the four-point scale; answers save straight to the learner's preferences. */
function Likert({ x, id, compact = false }: { x: Compass; id: string; compact?: boolean }) {
  const value = x.prefs[id];
  return (
    <View style={s.likert} accessibilityRole="radiogroup">
      {LIKERT.map((l) => {
        const on = value === l.score;
        return (
          <Pressable key={l.label} style={[s.likertBtn, compact && s.likertBtnC, on && s.likertOn]} onPress={() => x.setPrefs({ ...x.prefs, [id]: l.score })} accessibilityRole="radio" accessibilityState={{ checked: on }}>
            <Text style={[s.likertText, on && s.likertTextOn]}>{l.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const TYPES: readonly { group: string; icon: IconName }[] = [
  { group: 'Activities', icon: 'listBullet' },
  { group: 'Subjects', icon: 'cap' },
  { group: 'Work Preferences', icon: 'briefcase' },
];

/** The Assessment view (its reference): the hero, what the assessment covers, the kinds of questions, and privacy. */
function AssessmentView({ x, phone }: { x: Compass; phone: boolean }) {
  const [how, setHow] = useState(false);
  const rows: readonly [IconName, string][] = [
    ['clock', 'Takes about 5 minutes'],
    ['search', 'Explore your interests and strengths'],
    ['target', 'Get career suggestions with the reasons'],
    ['listBullet', 'Inform your study and career plan'],
  ];
  return (
    <View style={s.stack}>
      <PurpleHero
        phone={phone}
        wide
        kicker="Interests & Strengths"
        icon="heart"
        title="Discover What Drives You"
        sub="Understand your interests, strengths and work style to explore careers that fit you best."
        photo={x.cc.photos.heroes.interests}
        buttons={[
          { label: x.assessed ? 'Retake the Assessment' : 'Take the Assessment', icon: 'arrowRight', onPress: x.startAssessment },
          { label: 'How It Works', icon: 'playFill', onPress: () => setHow(true) },
        ]}
      />
      <SubTabs x={x} />
      <View style={[s.cols, phone && s.colsP]}>
        <View style={[s.card, s.introCard, !phone && s.introD]}>
          <View style={s.flex}>
            <Text style={s.cardTitle}>Career Interests Assessment</Text>
            <Text style={cs.body}>A short set of questions about what you enjoy, where you’d like to work and your strongest subjects.</Text>
            {rows.map(([icon, text]) => (
              <View key={text} style={s.introRow}>
                <Icon name={icon} size={18} color={BRAND_BLUE} />
                <Text style={s.rowText}>{text}</Text>
              </View>
            ))}
            <Pressable style={s.primary} onPress={x.startAssessment} accessibilityRole="button">
              <Text style={s.primaryText}>{x.assessed ? 'Retake Assessment' : 'Start Assessment'}</Text>
              <Icon name="arrowRight" size={15} color={L.white} />
            </Pressable>
          </View>
          {!phone ? <Image decorative source={x.cc.photos.art.assessment} style={s.clip} contentFit="contain" /> : null}
        </View>
        <View style={[s.card, !phone && s.exploreD]}>
          <Text style={s.cardTitle}>What We Explore</Text>
          {EXPLORE.map((e) => (
            <View key={e.title} style={s.exploreRow}>
              <View style={[s.exploreIcon, { backgroundColor: e.tint }]}>
                <Icon name={e.icon} size={22} color={e.color} />
              </View>
              <View style={s.flex}>
                <Text style={s.exploreTitle}>{e.title}</Text>
                <Text style={cs.body}>{e.sub}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
      <Text style={s.typesTitle}>Types of Questions You’ll See</Text>
      <View style={[s.cols, phone && s.colsP]}>
        {TYPES.map((ty) => {
          const st = PREFERENCE_STATEMENTS.find((p) => p.group === ty.group);
          if (!st) return null;
          return (
            <View key={ty.group} style={[s.card, s.typeCard, !phone && s.flex]}>
              <View style={s.typeHead}>
                <Icon name={ty.icon} size={26} color={BRAND_BLUE} />
                <View style={s.flex}>
                  <Text style={s.exploreTitle}>{ty.group}</Text>
                  <Text style={cs.body}>{`“${st.text}”`}</Text>
                </View>
              </View>
              <Likert x={x} id={st.id} compact />
            </View>
          );
        })}
      </View>
      <View style={s.privacy}>
        <Icon name="lock" size={22} color={BRAND_BLUE} />
        <View style={s.flex}>
          <Text style={s.strong}>Your privacy matters</Text>
          <Text style={cs.small}>Your answers are private and used only for your own guidance. Schools, universities and sponsors never see them.</Text>
        </View>
      </View>
      {how ? (
        <Sheet title="How the assessment works" onClose={() => setHow(false)}>
          <Bullets
            items={[
              'Pick the activities you enjoy, where you’d like to work and your strongest subjects.',
              'Say how much you agree with a few short statements.',
              'See careers worth exploring, each with the reasons it matches you.',
              'Change your answers any time; nothing is decided by them.',
            ]}
          />
        </Sheet>
      ) : null}
    </View>
  );
}

function Stepper({ x, phone }: { x: Compass; phone: boolean }) {
  return (
    <View style={s.stepper}>
      {x.steps.map((st, i) => {
        const on = i <= x.stepAt;
        return (
          <View key={st} style={s.stepWrap}>
            <View style={s.stepItem}>
              <View style={[s.stepNo, on && s.stepNoOn]}>
                <Text style={[s.stepNoText, on && s.stepNoTextOn]}>{i + 1}</Text>
              </View>
              <Text style={[s.stepLabel, phone && s.stepLabelP, i === x.stepAt && s.stepLabelOn]}>{STEP_LABEL[st]}</Text>
            </View>
            {i < x.steps.length - 1 ? <View style={[s.stepLine, i < x.stepAt && s.stepLineOn]} /> : null}
          </View>
        );
      })}
    </View>
  );
}

function Tile({ label, photo, icon, on, onPress, phone }: { label: string; photo?: number; icon?: IconName; on: boolean; onPress: () => void; phone: boolean }) {
  return (
    <Pressable style={[s.tile, phone ? s.tileP : s.tileD, on && s.tileOn]} onPress={onPress} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={label}>
      {photo ? (
        <Image decorative source={photo} style={phone ? s.tilePhotoP : s.tilePhoto} contentFit="cover" />
      ) : (
        <View style={s.tileIcon}>
          <Icon name={icon ?? 'star'} size={26} color={BRAND_BLUE} />
        </View>
      )}
      <View style={[s.tick, on && s.tickOn]}>{on ? <Icon name="tick" size={12} color={L.white} /> : null}</View>
      <Text style={[s.tileText, phone && s.tileTextP]}>{label}</Text>
    </Pressable>
  );
}

/** The four-step activity (the phone reference): interests as picture tiles, then work style, skills and results. */
function Wizard({ x, phone }: { x: Compass; phone: boolean }) {
  const step = x.step ?? 'interests';
  const a = x.answers;
  const [title, sub] = QUESTION[step];
  const nextLabel = step === 'results' ? 'Save my results' : `Next: ${STEP_LABEL[x.steps[x.stepAt + 1]]}`;
  return (
    <View style={s.stack}>
      <View style={[s.wizHead, phone && s.wizHeadP]}>
        <LinearGradient colors={[Maple.surface, Maple.blueSoft]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <View style={s.flex}>
          <Pressable style={s.backRow} onPress={x.back} accessibilityRole="button" accessibilityLabel="Back">
            <Icon name="arrowLeft" size={20} color={L.navy} />
            <Text style={[s.wizTitle, phone && s.wizTitleP]}>Interests Assessment</Text>
          </Pressable>
          <Text style={cs.body}>Discover what excites you, your strengths and the kinds of careers you may enjoy.</Text>
          <Stepper x={x} phone={phone} />
        </View>
        {!phone ? <Image decorative source={x.cc.photos.interestsHero} style={s.wizArt} contentFit="contain" /> : null}
      </View>
      <View style={s.card}>
        <Text style={[s.question, phone && s.questionP]}>{title}</Text>
        <Text style={cs.body}>{sub}</Text>
        {step === 'interests' ? (
          <View style={s.tiles}>
            {x.cc.tiles.map((t) => (
              <Tile key={t.key} label={t.label} photo={t.photo} on={a.interests.includes(t.key)} onPress={() => x.setAnswers(toggle(a, 'interests', t.key))} phone={phone} />
            ))}
          </View>
        ) : null}
        {step === 'work' ? (
          <View style={s.tiles}>
            {x.cc.options.environments.map((e) => (
              <Tile key={e} label={PLACES[e]?.label ?? e} icon={PLACES[e]?.icon} on={a.environments.includes(e)} onPress={() => x.setAnswers(toggle(a, 'environments', e))} phone={phone} />
            ))}
          </View>
        ) : null}
        {step === 'skills' ? <Chips options={x.cc.options.strengths} on={a.strengths} onPress={(v) => x.setAnswers(toggle(a, 'strengths', v))} /> : null}
        {step === 'preferences' ? (
          <View style={s.prefs}>
            {PREFERENCE_STATEMENTS.map((st) => (
              <View key={st.id} style={s.pref}>
                <Text style={s.prefGroup}>{st.group}</Text>
                <Text style={s.prefText}>{st.text}</Text>
                <Likert x={x} id={st.id} />
              </View>
            ))}
          </View>
        ) : null}
        {step === 'results' ? (
          <View style={[s.results, phone && s.resultsP]}>
            {x.matches.slice(0, 6).map((m) => (
              <CareerCard key={m.career.id} c={m.career} reasons={m.reasons} saved={x.saves.careers.includes(m.career.id)} onSave={() => x.toggleCareer(m.career.id)} onOpen={() => x.openCareer(m.career.id)} />
            ))}
          </View>
        ) : null}
        <View style={s.footer}>
          <Pressable style={s.ghost} onPress={x.back} accessibilityRole="button">
            <Icon name="arrowLeft" size={15} color={L.navy} />
            <Text style={s.ghostText}>Back</Text>
          </Pressable>
          <Pressable style={[s.primary, !x.canNext && s.disabled]} onPress={x.next} disabled={!x.canNext} accessibilityRole="button" accessibilityState={{ disabled: !x.canNext }}>
            <Text style={s.primaryText}>{nextLabel}</Text>
            <Icon name="arrowRight" size={15} color={L.white} />
          </Pressable>
        </View>
        {!x.canNext && step === 'interests' ? <Text style={[cs.note, s.right]}>{`Choose ${MIN_INTERESTS - a.interests.length} more to continue.`}</Text> : null}
        {!x.canNext && step === 'preferences' ? <Text style={[cs.note, s.right]}>Answer each statement to continue.</Text> : null}
      </View>
    </View>
  );
}

/** Interests & Strengths: the Assessment view, the four steps, and Your Results. */
export function InterestsSection({ x, phone }: { x: Compass; phone: boolean }) {
  if (x.step) return <Wizard x={x} phone={phone} />;
  return x.view === 'assessment' ? <AssessmentView x={x} phone={phone} /> : <ResultsView x={x} phone={phone} tabs={<SubTabs x={x} />} />;
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  stack: { gap: 18 },
  right: { textAlign: 'right' },
  strong: { fontSize: 14, fontWeight: '700', color: L.navy },
  subTab: { height: 54, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18 },
  subTabText: { fontSize: 16, fontWeight: '600', color: L.navy },
  subTabOn: { fontWeight: '700', color: BRAND_BLUE },
  subLine: { position: 'absolute', left: 8, right: 8, bottom: -1, height: 3, borderRadius: 2, backgroundColor: BRAND_BLUE },
  cols: { flexDirection: 'row', gap: 18, alignItems: 'stretch' },
  colsP: { flexDirection: 'column' },
  card: { gap: 12, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  introCard: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  introD: { flex: 1 },
  exploreD: { width: 400 },
  cardTitle: { fontSize: 19, fontWeight: '800', color: L.navy },
  introRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 3 },
  clip: { width: 300, height: 220 },
  privacy: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: Maple.blueSelected, backgroundColor: Maple.blueSoft },
  primary: { alignSelf: 'flex-start', height: 44, flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, paddingHorizontal: 22, borderRadius: Radii.control, backgroundColor: BRAND_BLUE },
  primaryText: { fontSize: 14.5, fontWeight: '700', color: L.white },
  disabled: { opacity: 0.45 },
  ghost: { height: 44, flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, paddingHorizontal: 20, borderRadius: Radii.control, borderWidth: 1.5, borderColor: L.line, backgroundColor: L.white },
  ghostText: { fontSize: 14.5, fontWeight: '600', color: L.navy },
  footer: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 8 },
  wizHead: { flexDirection: 'row', alignItems: 'center', gap: 20, overflow: 'hidden', padding: 22, borderRadius: 16, borderWidth: 1, borderColor: L.line },
  wizHeadP: { padding: 16 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  wizTitle: { fontSize: 28, fontWeight: '800', color: L.navy, letterSpacing: -0.4 },
  wizTitleP: { fontSize: 22 },
  wizArt: { width: 200, height: 170 },
  stepper: { flexDirection: 'row', marginTop: 16 },
  stepWrap: { flex: 1, flexDirection: 'row', alignItems: 'flex-start' },
  stepItem: { alignItems: 'center', gap: 6, width: 72 },
  stepNo: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 17, borderWidth: 1.5, borderColor: Maple.borderStrong, backgroundColor: L.white },
  stepNoOn: { borderColor: BRAND_BLUE, backgroundColor: BRAND_BLUE },
  stepNoText: { fontSize: 14, fontWeight: '700', color: L.ink },
  stepNoTextOn: { color: L.white },
  stepLabel: { fontSize: 13, color: L.ink, textAlign: 'center' },
  stepLabelP: { fontSize: 11.5 },
  stepLabelOn: { fontWeight: '700', color: BRAND_BLUE },
  stepLine: { flex: 1, height: 2, marginTop: 16, backgroundColor: Maple.disabledBorder },
  stepLineOn: { backgroundColor: BRAND_BLUE },
  question: { fontSize: 21, fontWeight: '800', color: L.navy },
  questionP: { fontSize: 18 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  tile: { overflow: 'hidden', borderRadius: 14, borderWidth: 1.5, borderColor: L.line, backgroundColor: L.white },
  tileD: { width: 236 },
  tileP: { width: '47%' },
  tileOn: { borderColor: BRAND_BLUE, backgroundColor: Maple.blueSoft },
  tilePhoto: { width: '100%', height: 130 },
  tilePhotoP: { width: '100%', height: 96 },
  tileIcon: { height: 72, alignItems: 'center', justifyContent: 'center', backgroundColor: BRAND_SOFT },
  tick: { position: 'absolute', top: 8, right: 8, width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderRadius: 6, borderWidth: 1.5, borderColor: Maple.faint, backgroundColor: L.white },
  tickOn: { borderColor: BRAND_BLUE, backgroundColor: BRAND_BLUE },
  tileText: { padding: 12, fontSize: 15, lineHeight: 19, fontWeight: '700', color: L.navy },
  tileTextP: { padding: 10, fontSize: 13.5, lineHeight: 17 },
  results: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  subTabs: { flexDirection: 'row', gap: 8, paddingHorizontal: 8, borderRadius: 14, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  rowText: { fontSize: 15, color: L.navy },
  exploreRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Maple.blueSelected },
  exploreIcon: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  exploreTitle: { fontSize: 17, fontWeight: '800', color: L.navy },
  typesTitle: { fontSize: 20, fontWeight: '800', color: L.navy },
  typeCard: { gap: 14 },
  typeHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  likert: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  likertBtn: { height: 36, justifyContent: 'center', paddingHorizontal: 16, borderRadius: Radii.control, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  likertBtnC: { paddingHorizontal: 12 },
  likertOn: { borderColor: BRAND_BLUE, backgroundColor: BRAND_BLUE },
  likertText: { fontSize: 13, fontWeight: '600', color: L.navy },
  likertTextOn: { color: L.white },
  prefs: { gap: 14 },
  pref: { gap: 8, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: L.line },
  prefGroup: { fontSize: 11.5, fontWeight: '700', color: BRAND_BLUE, textTransform: 'uppercase' },
  prefText: { fontSize: 15.5, fontWeight: '700', color: L.navy },
  resultsP: { flexDirection: 'column' },
});
