import { Badge, Button, Card, ProgressBar, Row } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import type { SyncState } from '@/mock/learner';

const STATE = {
  saved: { label: 'Saved on device', tone: 'warning' },
  syncing: { label: 'Syncing…', tone: 'info' },
  backed_up: { label: 'Synced and verified', tone: 'good' },
} as const satisfies Record<SyncState, { label: string; tone: 'warning' | 'info' | 'good' }>;

/** Inventory 30: encrypted downloads and work waiting to sync. */
export default function OfflineScreen() {
  return (
    <PreviewScreen title="Offline" subtitle="Lessons and papers saved encrypted on this phone, and work waiting to sync">
      {(m) => {
        const o = m.learner.offline;
        return (
          <>
            <Card title="Storage" icon="download">
              <ProgressBar label={`${o.usedMB} MB of ${o.limitMB} MB used`} value={o.usedMB / o.limitMB} showValue={false} />
              <Button label="Download this week's lessons on Wi-Fi" icon="download" variant="secondary" compact onPress={() => undefined} />
            </Card>
            <Card title="On this phone" icon="lock">
              {o.items.map((it) => (
                <Row
                  key={it.id}
                  icon={it.kind === 'Homework' ? 'clipboard' : it.kind === 'Videos' ? 'play' : 'book'}
                  title={it.title}
                  detail={`${it.kind} · ${it.sizeMB} MB`}
                  badge={<Badge label={STATE[it.state].label} tone={STATE[it.state].tone} />}
                />
              ))}
            </Card>
          </>
        );
      }}
    </PreviewScreen>
  );
}
