import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { LearnerPhoneTop } from '@/features/learner/dashboard/DashPhone';
import { ProgressRing } from '@/features/learner/exam/ExamNav';
import { L, LightFrame } from '@/features/learner/frame/LightFrame';
import { toast } from '@/lib/toast';

import { STEPS } from './applicationForm';
import { StepsBar } from './ApplyParts';
import { AcademicStep, ApplicantStep, DocumentsStep, ReviewStep } from './ApplySteps';
import type { SchoolCard } from './networkData';
import { BRAND_SOFT, BRAND_BLUE, Campus, Crest, Tag, ugx } from './SchoolParts';
import { type Apply, type ApplyActions, message, useApply } from './useApply';
import type { Net } from './useSchoolNetwork';
import { Maple, Radii } from '@/constants/maple';
import { PAGE_TITLE } from '@/lib/fonts/type';

/** The school being applied to: campus photo, save heart, crest, name, place and chips. */
function SchoolMini({ c, saved, onSave }: { c: SchoolCard; saved: boolean; onSave: () => void }) {
  return (
    <View style={s.card0}>
      <View>
        <Campus c={c} style={[s.photo]} />
        <Pressable style={s.heart} onPress={onSave} hitSlop={8} accessibilityRole="button" accessibilityState={{ selected: saved }} accessibilityLabel={saved ? `Remove ${c.name} from saved` : `Save ${c.name}`}>
          <Icon name={saved ? 'heartFill' : 'heart'} size={18} color={saved ? Maple.error : L.ink} />
        </Pressable>
        <View style={s.crest}>
          <Crest c={c} size={46} />
        </View>
      </View>
      <View style={s.miniBody}>
        <View style={s.nameRow}>
          <Text style={s.name} numberOfLines={1}>
            {c.name}
          </Text>
          <Icon name="sealCheck" size={17} color={L.blue} />
        </View>
        <View style={s.place}>
          <Icon name="pin" size={14} color={L.body} />
          <Text style={s.small}>{c.mode === 'Online' ? 'Online' : `${c.town}, Uganda`}</Text>
        </View>
        <View style={s.tags}>
          {c.tags.map((t) => (
            <Tag key={t} text={t} />
          ))}
        </View>
      </View>
    </View>
  );
}

function Summary({ a }: { a: Apply }) {
  const rows: readonly [string, string, boolean?][] = [
    ['Program', a.form.applyingFor],
    ['Intake', a.net.apply.intake ?? 'Ask the school'],
    ['Application Fee', a.net.apply.feeUGX === null ? 'None' : ugx(a.net.apply.feeUGX), true],
  ];
  return (
    <View style={s.card}>
      <View style={s.cardHead}>
        <Icon name="calendar" size={22} color={BRAND_BLUE} />
        <Text style={s.cardTitle}>Application Summary</Text>
      </View>
      {rows.map(([k, v, strong]) => (
        <View key={k} style={s.sumRow}>
          <Text style={s.sumKey}>{k}</Text>
          <Text style={strong ? s.fee : s.sumValue}>{v}</Text>
        </View>
      ))}
      <View style={s.place}>
        <Icon name="info" size={14} color={BRAND_BLUE} />
        <Text style={s.small}>Application fee is non-refundable.</Text>
      </View>
    </View>
  );
}

function Requirements({ list }: { list: readonly string[] }) {
  return (
    <View style={[s.card, s.reqCard]}>
      <View style={s.cardHead}>
        <View style={s.reqIcon}>
          <Icon name="tick" size={16} color={L.green} />
        </View>
        <Text style={s.cardTitle}>Admission Requirements</Text>
      </View>
      {list.map((r) => (
        <View key={r} style={s.reqRow}>
          <Icon name="tick" size={15} color={L.green} />
          <Text style={s.reqText}>{r}</Text>
        </View>
      ))}
    </View>
  );
}

function Progress({ a }: { a: Apply }) {
  const { pct, done } = a.progress;
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>Your Application Progress</Text>
      <View style={s.progRow}>
        <ProgressRing value={pct / 100} size={104} stroke={9} color={BRAND_BLUE} track={Maple.blueSelected} labelSize={22} />
        <View style={s.flex}>
          <Text style={s.progTitle}>{a.submitted ? 'Application submitted' : 'Application in progress'}</Text>
          <Text style={s.small}>{`Step ${done} of ${STEPS.length} completed`}</Text>
          <View style={s.bar}>
            <View style={[s.barFill, { width: `${pct}%` }]} />
          </View>
        </View>
      </View>
    </View>
  );
}

function Side({ a, saved, onSave }: { a: Apply; saved: boolean; onSave: () => void }) {
  return (
    <View style={s.stack}>
      <SchoolMini c={a.school} saved={saved} onSave={onSave} />
      <Summary a={a} />
      <Requirements list={a.net.apply.requirements} />
      <Progress a={a} />
    </View>
  );
}

function Body({ a, phone }: { a: Apply; phone: boolean }) {
  if (a.step === 'academic') return <AcademicStep a={a} phone={phone} />;
  if (a.step === 'documents') return <DocumentsStep a={a} />;
  if (a.step === 'review') return <ReviewStep a={a} />;
  return <ApplicantStep a={a} phone={phone} />;
}

/** After submitting: the reference, what happens next, and the way back. */
function Submitted({ a }: { a: Apply }) {
  return (
    <View style={[s.card, s.doneCard]}>
      <View style={s.doneIcon}>
        <Icon name="tick" size={34} color={L.white} />
      </View>
      <Text style={s.doneTitle}>Application submitted</Text>
      <Text style={s.doneText}>{`${a.school.name} has your application. They decide on admission and will reply in your Messages.`}</Text>
      <Text style={s.small}>{`Reference: ${a.reference}`}</Text>
      <Pressable style={s.primary} onPress={a.saveLater} accessibilityRole="button">
        <Text style={s.primaryText}>Back to School Network</Text>
      </Pressable>
    </View>
  );
}

function Actions({ a, phone }: { a: Apply; phone: boolean }) {
  const last = a.index === STEPS.length - 1;
  const nextLabel = last ? 'Submit Application' : `Continue to ${STEPS[a.index + 1].label}`;
  return (
    <View style={[s.actions, phone && s.actionsP]}>
      <Pressable style={s.later} onPress={a.saveLater} accessibilityRole="button">
        <Icon name="bookmark" size={18} color={BRAND_BLUE} />
        <Text style={s.laterText}>Save & Continue Later</Text>
      </Pressable>
      <View style={s.actionsRight}>
        {a.index > 0 ? (
          <Pressable style={s.backBtn} onPress={a.back} accessibilityRole="button">
            <Text style={s.laterText}>Back</Text>
          </Pressable>
        ) : null}
        <Pressable style={[s.primary, phone && s.flex, a.sending && s.primaryOff]} onPress={last ? a.submit : a.next} disabled={a.sending} accessibilityRole="button">
          <Text style={s.primaryText} numberOfLines={1}>
            {a.sending ? 'Sending…' : nextLabel}
          </Text>
          <Icon name="arrowRight" size={17} color={L.white} />
        </Pressable>
      </View>
    </View>
  );
}

interface Props {
  net: Net;
  school: SchoolCard;
  avatar?: number;
  /** Real builds pass the API actions; design builds keep everything on the page. */
  actions?: ApplyActions;
}

function useSaved(net: Net, id: string, actions?: ApplyActions) {
  const [saved, setSaved] = useState(net.saved.includes(id));
  return {
    saved,
    toggle: () => {
      const said = saved ? 'Removed from your saved schools.' : 'Saved. Only you can see your saved schools; the school sees a total.';
      setSaved(!saved);
      if (!actions) return toast(said);
      actions.setSaved(id, !saved).then(
        () => toast(said),
        (e: unknown) => {
          setSaved(saved);
          toast(message(e));
        },
      );
    },
  };
}

/** Apply to a school on wide screens: the reference, in the light learner frame. */
export function ApplyDesk({ net, school, avatar, actions }: Props) {
  const a = useApply(net, school, actions);
  const fav = useSaved(net, school.id, actions);
  return (
    <LightFrame>
      <View style={s.cols}>
        <View style={s.left}>
          <Pressable style={s.backLink} onPress={a.backToProfile} accessibilityRole="link">
            <Icon name="arrowLeft" size={18} color={BRAND_BLUE} />
            <Text style={s.backText}>Back to School Profile</Text>
          </Pressable>
          <View style={s.head}>
            <View style={s.headIcon}>
              <Icon name="edit" size={30} color={L.white} />
            </View>
            <View style={s.flex}>
              <Text style={s.title} {...PAGE_TITLE}>{`Apply to ${school.name}`}</Text>
              <Text style={s.sub}>Complete the admission application and submit your documents.</Text>
            </View>
          </View>
          {a.submitted ? (
            <Submitted a={a} />
          ) : (
            <>
              <StepsBar current={a.step} done={a.progress.done} onPick={a.goTo} />
              <Body a={a} phone={false} />
              <Actions a={a} phone={false} />
            </>
          )}
        </View>
        <View style={s.right}>
          <Side a={a} saved={fav.saved} onSave={fav.toggle} />
        </View>
      </View>
    </LightFrame>
  );
}

/** Apply to a school on phones: the same form, one column, with the summary under it. */
export function ApplyPhone({ net, school, avatar, actions }: Props) {
  const a = useApply(net, school, actions);
  const fav = useSaved(net, school.id, actions);
  return (
    <View style={s.phoneRoot}>
      <LearnerPhoneTop avatar={avatar} />
      <ScrollView contentContainerStyle={s.phone} keyboardShouldPersistTaps="handled">
        <Pressable style={s.backLink} onPress={a.backToProfile} accessibilityRole="link">
          <Icon name="arrowLeft" size={18} color={BRAND_BLUE} />
          <Text style={s.backText}>Back to School Profile</Text>
        </Pressable>
        <Text style={s.titleP} {...PAGE_TITLE}>{`Apply to ${school.name}`}</Text>
        {a.submitted ? (
          <Submitted a={a} />
        ) : (
          <>
            <StepsBar current={a.step} done={a.progress.done} onPick={a.goTo} phone />
            <Body a={a} phone />
            <Actions a={a} phone />
          </>
        )}
        <Side a={a} saved={fav.saved} onSave={fav.toggle} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  stack: { gap: 16 },
  small: { fontSize: 13, lineHeight: 18, color: L.body },
  cols: { flexDirection: 'row', gap: 34, alignItems: 'flex-start' },
  left: { width: 868, gap: 16 },
  right: { flex: 1 },
  backLink: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'flex-start' },
  backText: { fontSize: 14.5, fontWeight: '500', color: L.navy },
  head: { flexDirection: 'row', alignItems: 'center', gap: 16, marginLeft: 12 },
  headIcon: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: Maple.blue },
  title: { fontSize: 32, lineHeight: 38, fontWeight: '800', color: L.navy },
  sub: { marginTop: 2, fontSize: 15.5, color: L.ink },
  card0: { overflow: 'hidden', borderRadius: 16, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  photo: { width: '100%', height: 120 },
  heart: { position: 'absolute', top: 10, right: 10, width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 17, backgroundColor: L.white },
  crest: { position: 'absolute', left: 18, bottom: -28, width: 64, height: 60, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: L.white, shadowColor: Maple.navyDeep, shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  crestImg: { width: 46, height: 46 },
  miniBody: { gap: 8, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 16 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 78 },
  name: { flexShrink: 1, fontSize: 17, fontWeight: '700', color: L.navy },
  place: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  card: { gap: 12, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardTitle: { fontSize: 19, fontWeight: '700', color: L.navy },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: Maple.blueSelected },
  sumKey: { fontSize: 14.5, color: L.ink },
  sumValue: { fontSize: 14.5, fontWeight: '500', color: L.navy },
  fee: { fontSize: 17, fontWeight: '800', color: BRAND_BLUE },
  reqCard: { borderColor: Maple.successSoft, backgroundColor: Maple.successSoft },
  reqIcon: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: Maple.successSoft },
  reqRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reqText: { flex: 1, fontSize: 14.5, color: L.ink },
  progRow: { flexDirection: 'row', alignItems: 'center', gap: 22 },
  progTitle: { fontSize: 17, fontWeight: '700', color: L.navy },
  bar: { marginTop: 10, height: 8, borderRadius: 4, backgroundColor: Maple.blueSelected },
  barFill: { height: 8, borderRadius: 4, backgroundColor: BRAND_BLUE },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actionsP: { flexDirection: 'column-reverse', alignItems: 'stretch', gap: 12 },
  actionsRight: { flexDirection: 'row', gap: 12 },
  later: { height: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 22, borderRadius: 23, borderWidth: 1.5, borderColor: Maple.blueLine, backgroundColor: L.white },
  laterText: { fontSize: 15, fontWeight: '600', color: BRAND_BLUE },
  backBtn: { height: 46, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center', borderRadius: Radii.control, backgroundColor: BRAND_SOFT },
  primaryOff: { opacity: 0.6 },
  primary: { height: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 26, borderRadius: Radii.control, backgroundColor: L.blue },
  primaryText: { fontSize: 15, fontWeight: '600', color: L.white },
  doneCard: { alignItems: 'center', paddingVertical: 36 },
  doneIcon: { width: 68, height: 68, alignItems: 'center', justifyContent: 'center', borderRadius: 34, backgroundColor: L.green },
  doneTitle: { fontSize: 24, fontWeight: '800', color: L.navy },
  doneText: { maxWidth: 520, fontSize: 15, lineHeight: 22, color: L.ink, textAlign: 'center' },
  phoneRoot: { flex: 1, backgroundColor: L.canvas },
  phone: { gap: 16, padding: 16, paddingBottom: 110 },
  titleP: { fontSize: 24, lineHeight: 30, fontWeight: '800', color: L.navy },
});
