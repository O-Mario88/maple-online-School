import { Badge, Banner, Button, Card, Grid, Row, Table } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import type { RosterIssue } from '@/mock/school';

const ISSUE = {
  ok: { label: 'Ready', tone: 'good' },
  duplicate: { label: 'Duplicate', tone: 'warning' },
  missing: { label: 'No parent phone', tone: 'danger' },
} as const satisfies Record<RosterIssue, { label: string; tone: 'good' | 'warning' | 'danger' }>;

/** Inventory 62: import learners, teachers and parents from a spreadsheet, fix rows, send parent codes. */
export default function RostersScreen() {
  return (
    <PreviewScreen title="Rosters" subtitle="Import from Excel or CSV; Maple matches the columns and flags problems">
      {(m) => {
        const r = m.school.rosterImport;
        const problems = r.rows.filter((x) => x.issue !== 'ok').length;
        return (
          <>
            <Button label="Upload a spreadsheet" icon="download" onPress={() => undefined} />
            <Grid min={320}>
              <Card title="Columns matched" subtitle={r.file} icon="check">
                {r.mapping.map((c) => (
                  <Row key={c.column} icon="check" title={c.column} detail={`→ ${c.field}`} />
                ))}
              </Card>
              <Card title="What happens next" icon="qr">
                <Row icon="people" title={`${r.total} learners`} detail="Accounts created as pending" />
                <Row icon="qr" title="Parent claim codes" detail="Print the QR sheet, or send by SMS" />
                <Button label="Send claim codes by SMS" variant="secondary" compact onPress={() => undefined} />
              </Card>
            </Grid>
            <Banner tone="warning" title={`${problems} rows need you`} body="Fix them here, or import the rest and come back." />
            <Table
              rows={r.rows}
              rowKey={(x) => `${x.adm}-${x.issue}-${x.name}`}
              columns={[
                { key: 'name', label: 'Learner', flex: 1.5, render: (x) => x.name },
                { key: 'adm', label: 'Admission no.', render: (x) => x.adm },
                { key: 'parent', label: 'Parent phone', render: (x) => x.parent || '—' },
                { key: 'cls', label: 'Class', render: (x) => x.cls },
                { key: 'issue', label: 'Status', align: 'right', render: (x) => <Badge label={ISSUE[x.issue].label} tone={ISSUE[x.issue].tone} /> },
              ]}
            />
            <Button label={`Import ${r.total - problems} learners`} icon="check" onPress={() => undefined} />
          </>
        );
      }}
    </PreviewScreen>
  );
}
