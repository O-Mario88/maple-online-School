import { Badge, Card, Table } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';

const SEVERITY = {
  high: 'danger',
  medium: 'warning',
  info: 'neutral',
} as const;

type Severity = keyof typeof SEVERITY;

/** Inventory 77: privileged actions, blocked cross-school access, and privacy requests. */
export default function SecurityScreen() {
  return (
    <PreviewScreen title="Security" subtitle="Privileged actions, blocked access between schools, and data requests">
      {(m) => (
        <Card title="Security events" icon="alert">
          <Table
            rows={m.command.security}
            rowKey={(s) => `${s.when}-${s.kind}`}
            columns={[
              { key: 'when', label: 'When', render: (s) => s.when },
              { key: 'kind', label: 'Event', flex: 1.5, render: (s) => s.kind },
              { key: 'detail', label: 'Detail', flex: 3, render: (s) => s.detail },
              { key: 'sev', label: 'Severity', align: 'right', render: (s) => <Badge label={s.severity} tone={SEVERITY[s.severity as Severity] ?? 'neutral'} /> },
            ]}
          />
        </Card>
      )}
    </PreviewScreen>
  );
}
