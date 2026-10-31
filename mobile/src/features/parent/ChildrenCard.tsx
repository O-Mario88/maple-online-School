import { Badge, Body, Card, Row } from '@/components/ui';
import type { Me } from '@/lib/api/client';
import { linkStatus, relationshipLabel } from '@/lib/family/links';
import { useFamilyLinks } from '@/lib/family/queries';
import { humanize } from '@/lib/home';

/** A parent's children: confirmed ones, and links still waiting for the school. */
export function ChildrenCard({ user }: { user: Me }) {
  const links = useFamilyLinks();
  // Confirmed children come from the account; the rest show where they stand.
  const waiting = (links.data ?? []).filter((l) => l.status !== 'approved' && l.parent.id === user.id);
  return (
    <Card title="Your children" icon="people">
      {user.children.length === 0 && waiting.length === 0 ? (
        <Body muted>No children are linked yet. Your school confirms each link before you can see a child’s records.</Body>
      ) : null}
      {user.children.map((c) => (
        <Row key={c.user_id} title={c.full_name} detail={humanize(c.relationship)} badge={<Badge label="Confirmed" tone="good" />} />
      ))}
      {waiting.map((l) => {
        const status = linkStatus(l.status);
        return (
          <Row
            key={l.id}
            title={l.student.name}
            detail={[relationshipLabel(l.relationship), l.school_name].filter(Boolean).join(' · ')}
            badge={<Badge label={status.label} tone={status.tone} />}
          />
        );
      })}
    </Card>
  );
}
