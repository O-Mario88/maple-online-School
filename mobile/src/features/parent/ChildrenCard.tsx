import { router } from 'expo-router';
import { useState } from 'react';

import { Badge, Body, Button, Card, Row, Segmented } from '@/components/ui';
import type { Me } from '@/lib/api/client';
import { linkStatus, relationshipLabel } from '@/lib/family/links';
import { useFamilyLinks } from '@/lib/family/queries';
import { humanize } from '@/lib/home';

/** A parent's children across all Maple-powered schools: toggle between profiles or claim via QR / platform login. */
export function ChildrenCard({ user }: { user: Me }) {
  const links = useFamilyLinks();
  const [selectedId, setSelectedId] = useState<string>(user.children[0] ? String(user.children[0].user_id) : '');
  // Confirmed children come from the account; the rest show where they stand across schools.
  const waiting = (links.data ?? []).filter((l) => l.status !== 'approved' && l.parent.id === user.id);
  const activeChild = user.children.find((c) => String(c.user_id) === selectedId) ?? user.children[0];

  return (
    <Card
      title="My Children"
      subtitle="Switch between your children across all Maple-powered schools or claim a profile via QR code"
      icon="people">
      {user.children.length > 1 ? (
        <Segmented
          label="Active child profile"
          options={user.children.map((c) => ({
            value: String(c.user_id),
            label: c.full_name,
          }))}
          value={selectedId || String(user.children[0].user_id)}
          onChange={setSelectedId}
        />
      ) : null}
      {user.children.length === 0 && waiting.length === 0 ? (
        <Body muted>No children are linked yet. Scan a school QR code or enter a platform claim code to link your child.</Body>
      ) : null}
      {activeChild ? (
        <Row
          key={activeChild.user_id}
          title={activeChild.full_name}
          detail={`${humanize(activeChild.relationship)} · Active student profile`}
          badge={<Badge label="Active Learner" tone="good" />}
        />
      ) : null}
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
      <Button label="Add Child via QR Code or Claim Code" variant="secondary" icon="qr" onPress={() => router.push('/claim-child')} />
    </Card>
  );
}
