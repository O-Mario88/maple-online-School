import { Badge, Card, Grid, ProgressBar, Row, Stat } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';

/** Inventory 71 and 76: north-star numbers, retention by cohort, and system health. */
export default function OpsScreen() {
  return (
    <PreviewScreen title="Operations" subtitle="How Maple is doing, and whether the system is healthy">
      {(m) => (
        <>
          <Grid min={200}>
            {m.command.northStar.map((n) => (
              <Stat key={n.label} label={n.label} value={n.value} detail={n.delta || undefined} icon="chart" tone={n.delta.startsWith('+') ? 'good' : 'neutral'} />
            ))}
          </Grid>
          <Grid min={320}>
            <Card title="Retention by sign-up month" icon="people">
              {m.command.retention.map((c) => (
                <ProgressBar key={c.cohort} label={`${c.cohort} · day 7`} value={c.d7} />
              ))}
            </Card>
            <Card title="System health" icon="live">
              {m.command.ops.map((o) => (
                <Row key={o.label} icon={o.ok ? 'check' : 'alert'} title={o.label} detail={o.value} badge={<Badge label={o.ok ? 'OK' : 'Watch'} tone={o.ok ? 'good' : 'warning'} />} />
              ))}
            </Card>
          </Grid>
        </>
      )}
    </PreviewScreen>
  );
}
