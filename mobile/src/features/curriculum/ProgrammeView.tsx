import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Badge, Body, Button, Card, EmptyState, ErrorText, Grid, Loading, Row, Section, Segmented, Stat } from '@/components/ui';
import { Radius, Spacing, type Theme, Type } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import {
  combinationsFor,
  describeRule,
  groupsFor,
  type ProgrammeClass,
  type ProgrammeRule,
  type ProgrammeTrack,
  rulesFor,
  subjectCounts,
  subjectNames,
} from '@/lib/curriculum/programme';
import { useProgramme } from '@/lib/curriculum/queries';
import type { IconName } from '@/lib/icons';

const RULE_ICONS: Partial<Record<string, IconName>> = {
  exam: 'flag',
  elective_limit: 'info',
  alternative: 'swap',
  approach: 'map',
  components: 'book',
  principal_subjects: 'clipboard',
};

/** The national curriculum: levels, each class's subjects and its rules. */
export function ProgrammeView({ country }: { country: string }) {
  const programme = useProgramme(country);
  if (programme.isPending) return <Loading label="Loading the curriculum" />;
  if (programme.isError) {
    return (
      <Card>
        <ErrorText message={programme.error.message} />
        <Button label="Try again" variant="secondary" onPress={() => programme.refetch()} />
      </Card>
    );
  }
  const track = programme.data.tracks[0];
  if (!track) {
    return <EmptyState icon="map" title="No curriculum yet" body="This country's curriculum hasn't been added." />;
  }
  return <TrackView track={track} />;
}

function TrackView({ track }: { track: ProgrammeTrack }) {
  const names = useMemo(() => subjectNames(track), [track]);
  // Open on the first level that has subjects, not an empty one.
  const first = track.levels.find((l) => l.classes.some((c) => c.subjects.length > 0)) ?? track.levels[0];
  const [levelId, setLevelId] = useState(String(first?.id ?? ''));
  const level = track.levels.find((l) => String(l.id) === levelId) ?? track.levels[0];
  const [classId, setClassId] = useState<string | null>(null);
  const current = level?.classes.find((c) => String(c.id) === classId) ?? level?.classes[0];

  const classes = track.levels.reduce((n, l) => n + l.classes.length, 0);
  const exams = track.rules.filter((r) => r.kind === 'exam').length;

  return (
    <>
      <Grid min={120}>
        <Stat label="Levels" value={String(track.levels.length)} icon="map" tone="accent" />
        <Stat label="Classes" value={String(classes)} icon="school" tone="info" />
        <Stat label="Subjects" value={String(names.size)} icon="book" tone="good" />
        <Stat label="National exams" value={String(exams)} icon="flag" tone="warning" detail="UNEB" />
      </Grid>

      <Section title="Browse by level" description={`${track.name} · choose a level, then a class`}>
        <Segmented
          label="Level"
          options={track.levels.map((l) => ({ value: String(l.id), label: l.name }))}
          value={String(level?.id ?? '')}
          onChange={(v) => {
            setLevelId(v);
            setClassId(null);
          }}
        />
        {level && level.classes.length > 1 ? (
          <Segmented
            label="Class"
            options={level.classes.map((c) => ({ value: String(c.id), label: c.name }))}
            value={String(current?.id ?? '')}
            onChange={setClassId}
          />
        ) : null}
      </Section>

      {current ? <ClassView key={current.id} cls={current} rules={track.rules} names={names} /> : null}
    </>
  );
}

interface ClassViewProps {
  cls: ProgrammeClass;
  rules: readonly ProgrammeRule[];
  names: ReadonlyMap<string, string>;
}

function ClassView({ cls, rules, names }: ClassViewProps) {
  const { styles } = useStyles(makeStyles);
  const counts = subjectCounts(cls);
  const classRules = rulesFor(rules, cls.name).filter((r) => describeRule(r, names) !== '');
  const groups = groupsFor(rules, cls.name, names);
  const combos = combinationsFor(rules, cls.name, names);
  const compulsory = cls.subjects.filter((s) => s.compulsory);
  const electives = cls.subjects.filter((s) => !s.compulsory);

  if (cls.subjects.length === 0) {
    return (
      <EmptyState
        icon="book"
        title={`No learning areas for ${cls.name} yet`}
        body="Schools can add their own learning areas for this class."
      />
    );
  }

  return (
    <Section
      title={cls.name}
      description={`${counts.compulsory} compulsory · ${counts.electives} ${counts.electives === 1 ? 'elective' : 'electives'}`}>
      <Grid min={320}>
        <Card title="Compulsory" subtitle="Every learner takes these" icon="check">
          <View style={styles.list}>
            {compulsory.map((s) => (
              <SubjectLine key={s.id} name={s.name} code={s.code} />
            ))}
          </View>
        </Card>
        {electives.length > 0 ? (
          <Card title="Electives" subtitle="Offered for learners to choose" icon="plus">
            <View style={styles.list}>
              {electives.map((s) => (
                <SubjectLine key={s.id} name={s.name} code={s.code} />
              ))}
            </View>
          </Card>
        ) : null}
      </Grid>

      {classRules.length > 0 ? (
        <Card title="How this class works" icon="info">
          {classRules.map((r) => (
            <Row key={r.key} icon={RULE_ICONS[r.kind] ?? 'info'} title={ruleTitle(r)} detail={describeRule(r, names)} />
          ))}
        </Card>
      ) : null}

      {groups.length > 0 ? (
        <Card title="Subject groups" subtitle="A-Level subjects by discipline" icon="library">
          {groups.map((g) => (
            <View key={g.code} style={styles.group}>
              <View style={styles.groupHead}>
                <Badge label={g.code} tone="accent" />
                <Text style={styles.groupName}>{g.name}</Text>
              </View>
              <Body muted>{g.subjects.join(' · ')}</Body>
            </View>
          ))}
        </Card>
      ) : null}

      {combos.length > 0 ? (
        <Card title="Common combinations" subtitle="Three principal subjects; schools may set their own" icon="people">
          <Grid min={220}>
            {combos.map((c) => (
              <View key={c.code} style={styles.combo}>
                <Text style={styles.comboCode}>{c.code}</Text>
                <Text style={styles.comboSubjects}>{c.subjects}</Text>
              </View>
            ))}
          </Grid>
        </Card>
      ) : null}
    </Section>
  );
}

function ruleTitle(rule: ProgrammeRule): string {
  switch (rule.kind) {
    case 'exam':
      return 'National examination';
    case 'elective_limit':
      return 'Elective limit';
    case 'alternative':
      return 'Alternative subject';
    case 'approach':
      return 'Approach';
    case 'components':
      return 'Subject components';
    case 'principal_subjects':
      return 'Principal subjects';
    default:
      return 'Rule';
  }
}

function SubjectLine({ name, code }: { name: string; code: string }) {
  const { theme, styles } = useStyles(makeStyles);
  return (
    <View style={styles.subject} accessible accessibilityLabel={name}>
      <Icon name="book" size={16} color={theme.textMuted} />
      <Text style={styles.subjectName}>{name}</Text>
      <Text style={styles.code}>{code}</Text>
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    list: { gap: 2 },
    subject: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.three,
      minHeight: 40,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.border,
    },
    subjectName: { ...Type.body, color: t.text, flex: 1 },
    code: { ...Type.caption, color: t.textMuted, fontVariant: ['tabular-nums'], letterSpacing: 0.4 },
    group: { gap: Spacing.one, paddingVertical: Spacing.two },
    groupHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
    groupName: { ...Type.bodyStrong, color: t.text },
    combo: {
      padding: Spacing.three,
      borderRadius: Radius.md,
      backgroundColor: t.backgroundSelected,
      gap: Spacing.one,
    },
    comboCode: { ...Type.heading, color: t.accentText, letterSpacing: 1 },
    comboSubjects: { ...Type.small, color: t.textSecondary },
  });
}
