import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Avatar, Badge, Button, Card, EmptyState, ErrorText, Loading, Segmented } from '@/components/ui';
import { Spacing, type Theme, Type } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { type FamilyLink, type LinkStatus, linkStatus, relationshipLabel } from '@/lib/family/links';
import { useDecideLink, useFamilyLinks } from '@/lib/family/queries';

const FILTERS: readonly { value: LinkStatus; label: string }[] = [
  { value: 'pending', label: 'Waiting' },
  { value: 'approved', label: 'Confirmed' },
  { value: 'declined', label: 'Declined' },
];

/** For leaders and the registrar: confirm which adults belong to each learner. */
export function FamilyLinksCard() {
  const [status, setStatus] = useState<LinkStatus>('pending');
  const links = useFamilyLinks(status);
  const decide = useDecideLink();

  return (
    <Card title="Family links" subtitle="Confirm who can see each learner's records" icon="people">
      <Segmented label="Show links" options={FILTERS} value={status} onChange={setStatus} />
      <ErrorText message={decide.error?.message} />
      {links.isPending ? (
        <Loading label="Loading family links" />
      ) : links.isError ? (
        <ErrorText message={links.error.message} />
      ) : links.data.length === 0 ? (
        <EmptyState
          icon="people"
          title={status === 'pending' ? 'Nothing waiting' : `No ${FILTERS.find((f) => f.value === status)?.label.toLowerCase()} links`}
          body={status === 'pending' ? 'When a parent is linked to a learner at your school, it appears here for you to confirm.' : undefined}
        />
      ) : (
        links.data.map((link) => (
          <LinkRow
            key={link.id}
            link={link}
            busy={decide.isPending && decide.variables?.id === link.id}
            onDecide={(approve) => decide.mutate({ id: link.id, approve })}
          />
        ))
      )}
    </Card>
  );
}

interface LinkRowProps {
  link: FamilyLink;
  busy: boolean;
  onDecide: (approve: boolean) => void;
}

function LinkRow({ link, busy, onDecide }: LinkRowProps) {
  const { styles } = useStyles(makeStyles);
  const status = linkStatus(link.status);
  const parentLine = [link.parent.name, relationshipLabel(link.relationship), link.parent.email].filter(Boolean).join(' · ');
  return (
    <View style={styles.row} accessible={false}>
      <Avatar name={link.student.name} size={40} />
      <View style={styles.text}>
        <Text style={styles.student}>{link.student.name}</Text>
        <Text style={styles.parent}>{parentLine}</Text>
        <Badge label={status.label} tone={status.tone} />
      </View>
      <View style={styles.actions}>
        {link.status !== 'approved' ? (
          <Button label="Approve" compact icon="check" busy={busy} onPress={() => onDecide(true)} />
        ) : null}
        {link.status !== 'declined' ? (
          <Button
            label={link.status === 'approved' ? 'Remove access' : 'Decline'}
            compact
            variant="secondary"
            disabled={busy}
            onPress={() => onDecide(false)}
          />
        ) : null}
      </View>
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: Spacing.three,
      paddingVertical: Spacing.three,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: t.border,
    },
    text: { flexGrow: 1, flexShrink: 1, flexBasis: 200, gap: Spacing.one },
    student: { ...Type.bodyStrong, color: t.text },
    parent: { ...Type.small, color: t.textSecondary },
    actions: { flexDirection: 'row', gap: Spacing.two },
  });
}
