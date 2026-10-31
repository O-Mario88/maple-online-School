import { type Href, router } from 'expo-router';

import { Card, Row, Screen } from '@/components/ui';
import { MOCK_DATA } from '@/lib/mock';
import { navFor, PORTAL_LABELS, tabBar } from '@/lib/navigation';
import { usePortal } from '@/lib/portal-context';

/** On phones: everything in the portal's menu that the tab bar can't fit. */
export default function MoreScreen() {
  const { portal } = usePortal();
  const all = navFor(portal, MOCK_DATA);
  const { tabs } = tabBar(all);
  const rest = all.filter((i) => !tabs.includes(i));
  return (
    <Screen title="More" subtitle={`Everything in ${PORTAL_LABELS[portal]}`}>
      <Card>
        {rest.map((i) => (
          <Row key={i.key} icon={i.icon} title={i.label} onPress={() => router.navigate(i.href as Href)} />
        ))}
      </Card>
    </Screen>
  );
}
