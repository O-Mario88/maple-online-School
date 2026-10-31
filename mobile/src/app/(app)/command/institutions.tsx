import { Badge, Card, Grid, Stat, Table } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';

/** Inventory 73: schools by stage, from bottom-up teacher adoption to signed contract, and reach by region. */
export default function InstitutionsScreen() {
  return (
    <PreviewScreen title="Schools" subtitle="Where each school is, from a few teachers trying Maple to a signed contract">
      {(m) => {
        const totalSchools = m.command.regions.reduce((s, r) => s + r.schools, 0);
        const totalLearners = m.command.regions.reduce((s, r) => s + r.learners, 0);
        return (
          <>
            <Grid min={170}>
              <Stat label="Schools on Maple" value={String(totalSchools)} icon="school" />
              <Stat label="Learners" value={totalLearners.toLocaleString('en-UG')} icon="people" />
              <Stat label="Ready to convert" value={String(m.command.pipeline.filter((p) => p.stage.includes('ready')).length)} icon="sparkle" tone="good" />
            </Grid>
            <Card title="Pipeline" icon="chart">
              <Table
                rows={m.command.pipeline}
                rowKey={(p) => p.school}
                columns={[
                  { key: 'school', label: 'School', flex: 2, render: (p) => p.school },
                  { key: 'stage', label: 'Stage', render: (p) => <Badge label={p.stage} tone={p.stage === 'Contract' ? 'good' : p.stage.includes('ready') ? 'accent' : 'neutral'} /> },
                  { key: 'teachers', label: 'Teachers active', align: 'right', render: (p) => String(p.teachersActive) },
                  { key: 'learners', label: 'Learners', align: 'right', render: (p) => String(p.learners) },
                ]}
              />
            </Card>
            <Card title="By region" icon="map">
              <Table
                rows={m.command.regions}
                rowKey={(r) => r.region}
                columns={[
                  { key: 'region', label: 'Region', render: (r) => r.region },
                  { key: 'schools', label: 'Schools', align: 'right', render: (r) => String(r.schools) },
                  { key: 'learners', label: 'Learners', align: 'right', render: (r) => r.learners.toLocaleString('en-UG') },
                ]}
              />
            </Card>
          </>
        );
      }}
    </PreviewScreen>
  );
}
