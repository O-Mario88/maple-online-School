import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Fragment, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Bar } from '@/features/learner/dashboard/DashParts';
import type { IconName } from '@/lib/icons';

import { DomainChip, SkillChip } from '@/features/learner/cbc/CbcParts';

import { BLUE, BODY, GREEN, INK, MathLine, ORANGE } from './MathText';
import { FilesList } from './WorkEditor';
import type { Work, WorkState } from './useWork';

function Num({ n }: { n: number }) {
  return (
    <View style={styles.num}>
      <Text style={styles.numText}>{n}</Text>
    </View>
  );
}

export function Crumbs({ items, phone = false }: { items: readonly string[]; phone?: boolean }) {
  return (
    <View style={styles.crumbs}>
      {phone ? <Icon name="chevronLeft" size={12} color={BLUE} /> : null}
      {items.map((t, i) => (
        <Fragment key={t}>
          {i > 0 ? <Icon name="chevronRight" size={11} color={INK} /> : null}
          <Text style={[styles.crumb, phone && styles.crumbP]} onPress={i === 0 ? () => router.push('/learn/assignments') : undefined} accessibilityRole={i === 0 ? 'link' : 'text'}>
            {t}
          </Text>
        </Fragment>
      ))}
    </View>
  );
}

export function DueChip({ text, phone = false }: { text: string; phone?: boolean }) {
  return (
    <View style={[styles.due, phone && styles.dueP]}>
      {phone ? <Icon name="calendar" size={12} color="#15803D" /> : null}
      <Text style={[styles.dueText, phone && styles.dueTextP]}>{text}</Text>
    </View>
  );
}

export function ProgressCard({ s }: { s: WorkState }) {
  const a = s.progress.answered;
  return (
    <View style={styles.progress}>
      <View style={styles.flex}>
        <Text style={styles.progressTitle}>Your Progress</Text>
        <View style={styles.progressBar}>
          <Bar value={a / 4} color="#0B6BFF" track="#E3EBF7" height={8} />
        </View>
      </View>
      <View>
        <Text style={styles.progressMeta}>{`${a} of 4 completed`}</Text>
        <Text style={styles.progressPct}>{`${Math.round((a / 4) * 100)}%`}</Text>
      </View>
    </View>
  );
}

export function InstructionsCard({ w }: { w: Work }) {
  return (
    <View>
      <Text style={styles.title}>Instructions</Text>
      <View style={styles.steps}>
        {w.instructions.map((t, i) => (
          <View key={t} style={styles.stepRow}>
            <Num n={i + 1} />
            <Text style={styles.stepText}>{t}</Text>
          </View>
        ))}
      </View>
      <View style={styles.aoi}>
        <Text style={styles.aoiLabel}>NCDC competency</Text>
        <Text style={styles.aoiText}>{w.competency}</Text>
        <View style={styles.tags}>
          {w.domains.map((d) => (
            <DomainChip key={d} domain={d} />
          ))}
          {w.skills.map((k) => (
            <SkillChip key={k} skill={k} />
          ))}
        </View>
      </View>
      <Text style={[styles.title, styles.qTitle]}>Scenario tasks</Text>
      <Text style={styles.scenario}>{w.scenario}</Text>
      <View style={styles.questions}>
        {w.questions.map((q, i) => (
          <View key={q} style={styles.question}>
            <Num n={i + 1} />
            <View style={styles.flex}>
              <MathLine text={q} size={13.5} color="#2B3445" />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export function ResourcesCard({ w, s }: { w: Work; s: WorkState }) {
  const act = (action: string, title: string) => {
    if (action === 'Watch') router.push('/learn/lesson');
    else if (action === 'Open Chat') router.push('/inbox');
    else s.toast(`${title} downloaded • available offline`);
  };
  return (
    <View>
      <Text style={styles.title}>Resources</Text>
      <View style={styles.resources}>
        {w.resources.map((r) => (
          <View key={r.title} style={styles.resource}>
            <Image source={r.icon} style={styles.resIcon} />
            <View style={styles.flex}>
              <Text style={styles.resTitle}>{r.title}</Text>
              <Text style={styles.resMeta}>{r.meta}</Text>
            </View>
            <Pressable style={styles.resBtn} onPress={() => act(r.action, r.title)} accessibilityRole="button" accessibilityLabel={`${r.action}: ${r.title}`}>
              <Text style={styles.resBtnText}>{r.action}</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

export function SubmitButton({ s, phone = false }: { s: WorkState; phone?: boolean }) {
  return (
    <Pressable style={[styles.submit, phone && styles.submitP, s.submitted && styles.submitDone]} onPress={s.submit} accessibilityRole="button" accessibilityState={{ disabled: s.submitted }}>
      <Icon name={s.submitted ? 'check' : 'send'} size={17} color="#FFFFFF" />
      <Text style={styles.submitText}>{s.submitted ? 'Submitted' : 'Submit Assignment'}</Text>
    </Pressable>
  );
}

export function ChecklistCard({ s }: { s: WorkState }) {
  return (
    <View>
      <Text style={styles.title}>Assignment Checklist</Text>
      <View style={styles.checks}>
        {s.checks.map((c) => (
          <View key={c.label} style={styles.check} accessibilityRole="checkbox" accessibilityState={{ checked: c.done }}>
            <View style={[styles.box, c.done && styles.boxOn]}>{c.done ? <Icon name="check" size={13} color="#FFFFFF" /> : null}</View>
            <Text style={styles.checkText}>{c.label}</Text>
          </View>
        ))}
      </View>
      <SubmitButton s={s} />
      {s.submitted ? (
        <Pressable style={styles.feedbackLink} onPress={() => router.push('/learn/assignments/a5/feedback')} accessibilityRole="link">
          <Text style={styles.feedbackLinkText}>See how feedback will look</Text>
          <Icon name="arrowRight" size={13} color={BLUE} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function FilesCard({ w, s }: { w: Work; s: WorkState }) {
  return (
    <View>
      <Text style={styles.title}>Files to be submitted</Text>
      <View style={styles.filesGap}>
        <FilesList w={w} s={s} />
      </View>
    </View>
  );
}

function Detail({ icon, label, children }: { icon: IconName; label: string; children: ReactNode }) {
  return (
    <View style={styles.detail}>
      <Icon name={icon} size={15} color={BODY} />
      <View style={styles.flex}>
        <Text style={styles.detailLabel}>{label}</Text>
        {children}
      </View>
    </View>
  );
}

export function DetailsCard({ w, s }: { w: Work; s: WorkState }) {
  return (
    <View>
      <Text style={styles.title}>Submission Details</Text>
      <View style={styles.details}>
        <Detail icon="calendar" label="Due Date">
          <Text style={styles.detailValue}>{w.dueLong}</Text>
        </Detail>
        <Detail icon="clipboard" label="Status">
          <Text style={[styles.status, s.submitted && styles.statusDone]}>{s.submitted ? 'Submitted' : 'Not submitted'}</Text>
        </Detail>
        <Detail icon="calendar" label="Attempts">
          <Text style={styles.detailValue}>{`${w.attempts.used + 1} of ${w.attempts.max}`}</Text>
        </Detail>
        <Detail icon="star" label="Assessed with">
          <Text style={styles.detailValue}>{w.assessment}</Text>
        </Detail>
        <Detail icon="chart" label="Counts toward">
          <Text style={styles.detailValue}>{w.countsToward}</Text>
        </Detail>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  title: { fontSize: 14.5, fontWeight: '700', color: INK },
  crumbs: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  crumb: { fontSize: 12.5, color: BLUE },
  crumbP: { fontSize: 11 },
  due: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 5, backgroundColor: '#E5F6EB' },
  dueP: { alignSelf: 'flex-start' },
  dueText: { fontSize: 12.5, fontWeight: '500', color: '#15803D' },
  dueTextP: { fontSize: 11.5 },
  progress: { flexDirection: 'row', alignItems: 'center', gap: 20, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, backgroundColor: '#FFFFFF' },
  progressTitle: { fontSize: 13, fontWeight: '600', color: INK },
  progressBar: { marginTop: 12, width: 230 },
  progressMeta: { fontSize: 11.5, color: BODY },
  progressPct: { marginTop: 8, fontSize: 12.5, fontWeight: '600', color: INK },
  num: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: '#DCE8FD' },
  numText: { fontSize: 13, fontWeight: '700', color: BLUE },
  steps: { gap: 14, marginTop: 14 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepText: { flex: 1, marginTop: 4, fontSize: 13, lineHeight: 19, color: '#2B3445' },
  qTitle: { marginTop: 16 },
  aoi: { marginTop: 16, padding: 10, borderRadius: 8, backgroundColor: '#F4F8FF' },
  aoiLabel: { fontSize: 10.5, fontWeight: '700', color: BLUE },
  aoiText: { marginTop: 3, fontSize: 12, lineHeight: 17, color: INK },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 7 },
  scenario: { marginTop: 6, fontSize: 12, lineHeight: 17, color: BODY, fontStyle: 'italic' },
  questions: { gap: 8, marginTop: 10 },
  question: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 10, borderRadius: 6, borderWidth: 1, borderColor: '#E8EDF4' },
  resources: { gap: 9, marginTop: 12 },
  resource: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  resIcon: { width: 32, height: 32 },
  resTitle: { fontSize: 11.5, fontWeight: '500', color: INK },
  resMeta: { marginTop: 2, fontSize: 10.5, color: BODY },
  resBtn: { width: 91, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 5, backgroundColor: '#E6EEFB' },
  resBtnText: { fontSize: 11.5, fontWeight: '500', color: BLUE },
  checks: { gap: 13, marginTop: 14 },
  check: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  box: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center', borderRadius: 5, borderWidth: 1.5, borderColor: '#C9D2E0' },
  boxOn: { borderColor: GREEN, backgroundColor: GREEN },
  checkText: { fontSize: 12.5, color: '#2B3445' },
  submit: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 16, borderRadius: 5, backgroundColor: '#0B6BFF' },
  submitP: { height: 46, marginTop: 0, borderRadius: 7 },
  submitDone: { backgroundColor: GREEN },
  submitText: { fontSize: 14, fontWeight: '500', color: '#FFFFFF' },
  feedbackLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10 },
  feedbackLinkText: { fontSize: 12, color: BLUE },
  filesGap: { marginTop: 12 },
  details: { gap: 13, marginTop: 14 },
  detail: { flexDirection: 'row', gap: 12 },
  detailLabel: { fontSize: 12, color: INK },
  detailValue: { marginTop: 4, fontSize: 12, color: BODY },
  status: { alignSelf: 'flex-start', marginTop: 4, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4, backgroundColor: '#FDEBD3', fontSize: 11.5, color: ORANGE, overflow: 'hidden' },
  statusDone: { backgroundColor: '#E5F6EB', color: '#15803D' },
});
