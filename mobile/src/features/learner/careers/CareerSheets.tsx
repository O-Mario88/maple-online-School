import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { L } from '@/features/learner/frame/LightFrame';
import type { Career, Program, University } from '@/mock/career-compass';

import type { Answers } from './careers';
import { Bullets, Chips, cs, FitPill, BRAND_BLUE, Section, Sheet, shortDate, ugx, VerifyPill } from './CareerParts';
import { Maple, Radii } from '@/constants/maple';

type Fit = { status: 'meets' | 'partly' | 'missing'; missing: readonly string[] };
type Status = 'verified' | 'review-due' | 'unverified';

/** A career's profile: what the work is, the subjects and routes into it, where it leads, and programs that teach it. */
export function CareerSheet({
  c,
  programs,
  uni,
  status,
  saved,
  onSave,
  onPlan,
  onProgram,
  onClose,
}: {
  c: Career;
  programs: readonly Program[];
  uni: (id: string) => University | undefined;
  status: (p: Program) => Status;
  saved: boolean;
  onSave: () => void;
  onPlan: () => void;
  onProgram: (p: Program) => void;
  onClose: () => void;
}) {
  return (
    <Sheet title={c.title} onClose={onClose} wide>
      <Text style={cs.body}>{c.overview}</Text>
      <Section title="What the work involves">
        <Bullets items={c.responsibilities} />
      </Section>
      <Section title="Subjects that help">
        <Text style={cs.body}>{`O-Level: ${c.oLevel}`}</Text>
        <Text style={cs.body}>{c.essentials.length ? `A-Level: most programs ask for ${c.essentials.join(' and ')}.` : 'A-Level: many subject combinations are accepted.'}</Text>
      </Section>
      <Section title="Ways in">
        {c.pathways.map((p) => (
          <View key={p.title} style={s.line}>
            <Text style={s.level}>{p.level}</Text>
            <Text style={[cs.body, s.flex]}>{`${p.title} · ${p.years}`}</Text>
          </View>
        ))}
      </Section>
      <Section title="Programs at verified institutions">
        {programs.length ? (
          programs.map((p) => (
            <Pressable key={p.id} style={s.line} onPress={() => onProgram(p)} accessibilityRole="button">
              <View style={s.flex}>
                <Text style={s.strong}>{p.title}</Text>
                <Text style={cs.small}>{uni(p.universityId)?.name}</Text>
              </View>
              <VerifyPill status={status(p)} on={p.accreditation.verifiedOn} />
            </Pressable>
          ))
        ) : (
          <Text style={cs.small}>No programs listed yet.</Text>
        )}
      </Section>
      <Section title="Where it can lead">
        <Text style={cs.body}>{c.progression.join('  →  ')}</Text>
        <Text style={cs.small}>{`Related: ${c.related.join(', ')}`}</Text>
      </Section>
      <Section title="The job market">
        <Text style={cs.body}>{c.market.note}</Text>
        <Text style={cs.note}>{`Uganda · ${c.market.source} · ${c.market.date}. Pay and job prospects vary and are never guaranteed.`}</Text>
      </Section>
      <View style={s.advice}>
        <Icon name="chat" size={16} color={BRAND_BLUE} />
        <Text style={[cs.body, s.flex]}>{`“${c.advice.text}” — ${c.advice.by}`}</Text>
      </View>
      <View style={s.actions}>
        <Pressable style={s.ghost} onPress={onSave} accessibilityRole="button">
          <Icon name={saved ? 'bookmarkOn' : 'bookmark'} size={16} color={BRAND_BLUE} />
          <Text style={s.ghostText}>{saved ? 'Saved' : 'Save career'}</Text>
        </Pressable>
        <Pressable style={s.primary} onPress={onPlan} accessibilityRole="button">
          <Text style={s.primaryText}>Add to my career plan</Text>
        </Pressable>
      </View>
    </Sheet>
  );
}

/** A program's record: award, length, mode, fees, entry requirements, its own accreditation check and scholarships. */
export function ProgramSheet({
  p,
  u,
  status,
  fit,
  scholarships,
  saved,
  onSave,
  onUniversity,
  onClose,
}: {
  p: Program;
  u?: University;
  status: Status;
  fit?: Fit;
  scholarships: readonly { id: string; title: string; amount: string; deadline: string }[];
  saved: boolean;
  onSave: () => void;
  onUniversity?: () => void;
  onClose: () => void;
}) {
  const rows: readonly [string, string][] = [
    ['Institution', u?.name ?? ''],
    ['Award', `${p.award} · ${p.faculty}`],
    ['Campus', p.campus],
    ['Length and mode', `${p.years} · ${p.mode}`],
    ['Published fees', `${ugx(p.feesUGX)} a semester`],
    ['Apply by', shortDate(p.deadline)],
  ];
  return (
    <Sheet title={p.title} onClose={onClose}>
      {rows.map(([k, v]) => (
        <View key={k} style={s.row}>
          <Text style={cs.small}>{k}</Text>
          <Text style={s.strong}>{v}</Text>
        </View>
      ))}
      <Section title="Entry requirements">
        <Text style={cs.body}>{p.minimum}</Text>
        <Text style={cs.body}>{p.essentials.length ? `Essential subjects: ${p.essentials.join(', ')}` : 'No specific essential subjects.'}</Text>
        {fit ? <FitPill fit={fit} /> : null}
        <Text style={cs.note}>Requirements can change each intake. Always check the current requirement with the institution before you apply.</Text>
      </Section>
      <Section title="Accreditation">
        <VerifyPill status={status} on={p.accreditation.verifiedOn} />
        <Text style={cs.small}>{p.accreditation.evidence}</Text>
      </Section>
      {scholarships.length ? (
        <Section title="Scholarships">
          {scholarships.map((x) => (
            <Text key={x.id} style={cs.body}>{`${x.title} · ${x.amount} · apply by ${shortDate(x.deadline)}`}</Text>
          ))}
        </Section>
      ) : null}
      <View style={s.actions}>
        <Pressable style={s.ghost} onPress={onSave} accessibilityRole="button">
          <Icon name={saved ? 'bookmarkOn' : 'bookmark'} size={16} color={BRAND_BLUE} />
          <Text style={s.ghostText}>{saved ? 'Saved' : 'Save program'}</Text>
        </Pressable>
        {onUniversity ? (
          <Pressable style={s.primary} onPress={onUniversity} accessibilityRole="link">
            <Text style={s.primaryText}>View institution</Text>
          </Pressable>
        ) : null}
      </View>
    </Sheet>
  );
}

/** The interest activity: what you enjoy, what you’re good at, where you’d like to work. Suggestions, never a verdict. */
export function InterestSheet({ options, answers, onChange, onClose }: { options: { interests: readonly string[]; strengths: readonly string[]; environments: readonly string[] }; answers: Answers; onChange: (a: Answers) => void; onClose: () => void }) {
  const toggle = (key: keyof Answers, v: string) => onChange({ ...answers, [key]: answers[key].includes(v) ? answers[key].filter((x) => x !== v) : [...answers[key], v] });
  return (
    <Sheet title="What interests you?" onClose={onClose}>
      <Text style={cs.small}>Pick as many as you like. This isn’t a test: it only helps Maple suggest careers to explore, and you can change it any time.</Text>
      <Section title="I enjoy…">
        <Chips options={options.interests} on={answers.interests} onPress={(v) => toggle('interests', v)} />
      </Section>
      <Section title="My strongest subjects">
        <Chips options={options.strengths} on={answers.strengths} onPress={(v) => toggle('strengths', v)} />
      </Section>
      <Section title="I’d like to work in…">
        <Chips options={options.environments} on={answers.environments} onPress={(v) => toggle('environments', v)} />
      </Section>
      <Pressable style={s.primary} onPress={onClose} accessibilityRole="button">
        <Text style={s.primaryText}>See my suggestions</Text>
      </Pressable>
    </Sheet>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  strong: { fontSize: 13.5, fontWeight: '700', color: L.navy },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Maple.blueSelected },
  level: { width: 86, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, fontSize: 11.5, fontWeight: '600', color: BRAND_BLUE, backgroundColor: Maple.blueSoft, textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: Maple.blueSelected },
  advice: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: 10, backgroundColor: Maple.blueSoft },
  actions: { flexDirection: 'row', gap: 10 },
  ghost: { flex: 1, height: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: Radii.control, borderWidth: 1.5, borderColor: Maple.blueLine },
  ghostText: { fontSize: 14, fontWeight: '600', color: BRAND_BLUE },
  primary: { flex: 1, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: Radii.control, backgroundColor: L.blue },
  primaryText: { fontSize: 14, fontWeight: '600', color: L.white },
});
