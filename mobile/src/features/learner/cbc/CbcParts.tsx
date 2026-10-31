import { StyleSheet, Text, View } from 'react-native';

import { DOMAINS, type Domain, GENERIC_SKILLS, type GenericSkill, type Identifier, RACE, type RaceScore, raceTotal } from '@/lib/cbc';

const INK = '#0B1424';
const BODY = '#4A5263';
export const DOMAIN_TONE: Record<Domain, { bg: string; fg: string }> = {
  knowledge: { bg: '#E6EEFC', fg: '#1450C8' },
  skills: { bg: '#E3F6E9', fg: '#15803D' },
  values: { bg: '#F1E8FD', fg: '#6D28D9' },
};
export const ID_TONE: Record<Identifier['id'], { bg: string; fg: string; bar: string }> = {
  1: { bg: '#FDECEC', fg: '#C2410C', bar: '#F0475B' },
  2: { bg: '#E6EEFC', fg: '#1450C8', bar: '#1463F3' },
  3: { bg: '#DDF3E5', fg: '#15803D', bar: '#22A35A' },
};

/** A learning-domain tag: Knowledge, Skills or Values. */
export function DomainChip({ domain, long = false }: { domain: Domain; long?: boolean }) {
  const t = DOMAIN_TONE[domain];
  return (
    <Text style={[styles.chip, { backgroundColor: t.bg, color: t.fg }]} accessibilityLabel={`Learning domain: ${DOMAINS[domain].label}`}>
      {long ? DOMAINS[domain].label : DOMAINS[domain].short}
    </Text>
  );
}

/** A generic-skill tag, optionally with the identifier the teacher observed. */
export function SkillChip({ skill, id }: { skill: GenericSkill; id?: Identifier['id'] }) {
  const s = GENERIC_SKILLS.find((g) => g.key === skill);
  return (
    <View style={styles.skill} accessible accessibilityLabel={`Generic skill: ${s?.label}${id ? `, identifier ${id}` : ''}`}>
      <Text style={styles.skillText}>{s?.short}</Text>
      {id ? <Text style={[styles.skillId, { color: ID_TONE[id].fg, backgroundColor: ID_TONE[id].bg }]}>{id}</Text> : null}
    </View>
  );
}

export function ValueChip({ value }: { value: string }) {
  return (
    <Text style={[styles.chip, styles.value]} accessibilityLabel={`Value shown: ${value}`}>
      {value}
    </Text>
  );
}

/** The 1–3 identifier's descriptor as a soft pill, e.g. "Moderate". */
export function IdentifierPill({ identifier, withNumber = false }: { identifier: Identifier; withNumber?: boolean }) {
  const t = ID_TONE[identifier.id];
  return (
    <Text style={[styles.idPill, { backgroundColor: t.bg, color: t.fg }]} accessibilityLabel={`Identifier ${identifier.id}, ${identifier.label}`}>
      {withNumber ? `${identifier.id} · ${identifier.label}` : identifier.label}
    </Text>
  );
}

/** RACE marks: Relevance, Accuracy, Coherence (0–3) and Excellence (0–1), each with the teacher's note. */
export function RaceGrid({ race, notes, phone = false }: { race: RaceScore; notes: Partial<Record<keyof RaceScore, string>>; phone?: boolean }) {
  return (
    <View>
      <View style={styles.th}>
        <Text style={[styles.thText, styles.flex]}>RACE domain</Text>
        <Text style={[styles.thText, styles.thMax]}>Max</Text>
        <Text style={[styles.thText, styles.thScore]}>Score</Text>
      </View>
      {RACE.map((r) => {
        const score = race[r.key];
        const full = score >= r.max;
        return (
          <View key={r.key} style={[styles.tr, phone && styles.trP]} accessible accessibilityLabel={`${r.label}: ${score} of ${r.max}. ${notes[r.key] ?? r.hint}`}>
            <Text style={styles.letter}>{r.label[0]}</Text>
            <View style={styles.flex}>
              <Text style={styles.crit}>{r.label}</Text>
              <Text style={styles.critSub}>{notes[r.key] ?? r.hint}</Text>
            </View>
            <Text style={styles.max}>{r.max}</Text>
            <View style={[styles.score, full ? styles.scoreFull : styles.scorePart]}>
              <Text style={[styles.scoreText, { color: full ? '#15803D' : '#B45309' }]}>{score}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

export const raceSummary = (race: RaceScore) => {
  const t = raceTotal(race);
  return { ...t, percent: Math.round((t.score / t.max) * 100) };
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  chip: { alignSelf: 'flex-start', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4, fontSize: 10.5, fontWeight: '600', overflow: 'hidden' },
  value: { backgroundColor: '#F1E8FD', color: '#6D28D9' },
  skill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingLeft: 7, paddingRight: 3, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#F3C99B', backgroundColor: '#FFF7EE' },
  skillText: { fontSize: 10.5, fontWeight: '600', color: '#B45309' },
  skillId: { minWidth: 15, paddingHorizontal: 3, borderRadius: 3, fontSize: 10, fontWeight: '800', textAlign: 'center', overflow: 'hidden' },
  idPill: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, fontSize: 10.5, fontWeight: '600', overflow: 'hidden' },
  th: { flexDirection: 'row', alignItems: 'center', height: 26, marginTop: 8, paddingHorizontal: 10, borderRadius: 4, backgroundColor: '#F1F4F9' },
  thText: { fontSize: 12, color: INK },
  thMax: { width: 44, textAlign: 'center' },
  thScore: { width: 44, textAlign: 'center' },
  tr: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: '#EEF1F6' },
  trP: { paddingVertical: 10 },
  letter: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#DCE8FD', fontSize: 12, lineHeight: 22, fontWeight: '800', color: '#1463F3', textAlign: 'center', overflow: 'hidden' },
  crit: { fontSize: 12, fontWeight: '600', color: INK },
  critSub: { marginTop: 2, fontSize: 10.5, lineHeight: 14, color: BODY },
  max: { width: 34, textAlign: 'center', fontSize: 12, color: BODY },
  score: { width: 34, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 5 },
  scoreFull: { backgroundColor: '#DDF3E5' },
  scorePart: { backgroundColor: '#FDEBD3' },
  scoreText: { fontSize: 14, fontWeight: '700' },
});
