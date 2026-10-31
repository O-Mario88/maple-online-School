import { Badge, Card, Grid, KeyValue, Table } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';

/** Inventory 70: staff roles, the school's plan, and the activity log. */
export default function AdminSettingsScreen() {
  return (
    <PreviewScreen title="Roles and audit" subtitle="Who can do what, your plan, and a log of every important change">
      {(m) => (
        <>
          <Grid min={320}>
            <Card title="Roles" icon="people">
              <Table
                rows={m.school.roles}
                rowKey={(r) => r.role}
                columns={[
                  { key: 'role', label: 'Role', render: (r) => r.role },
                  { key: 'people', label: 'People', align: 'right', render: (r) => String(r.people) },
                  { key: 'can', label: 'Can', flex: 2, render: (r) => r.can },
                ]}
              />
            </Card>
            <Card title="Plan" icon="wallet">
              <KeyValue
                items={[
                  { label: 'Plan', value: <Badge label="Pilot term" tone="accent" /> },
                  { label: 'Learners', value: '1,240 of 1,500' },
                  { label: 'Renews', value: '4 Dec 2026' },
                ]}
              />
            </Card>
          </Grid>
          <Card title="Activity log" subtitle="Kept for 7 years; can't be edited" icon="clock">
            <Table
              rows={m.school.audit}
              rowKey={(a) => `${a.when}-${a.action}`}
              columns={[
                { key: 'when', label: 'When', render: (a) => a.when },
                { key: 'who', label: 'Who', render: (a) => a.who },
                { key: 'action', label: 'What', flex: 2, render: (a) => a.action },
              ]}
            />
          </Card>
        </>
      )}
    </PreviewScreen>
  );
}
