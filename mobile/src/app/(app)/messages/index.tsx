import { useMemo } from 'react';

import { useShell } from '@/components/ui';
import { MessagesPage } from '@/features/messages/MessagesPage';
import { MessagesDesk, MessagesPhone } from '@/features/parent/messages/MessagesViews';
import { mockData } from '@/lib/mock';
import { usePortal } from '@/lib/portal-context';

/** Conversations between the school and families (inventory screen 57); parents in a design build see the Messaging & Meeting Booker reference. */
export default function MessagesScreen() {
  const mock = useMemo(() => mockData(), []);
  const { portal } = usePortal();
  const { wide } = useShell();
  if (mock && portal === 'parent') {
    const p = mock.portal.parent;
    return wide ? <MessagesDesk p={p} /> : <MessagesPhone p={p} />;
  }
  return <MessagesPage />;
}
