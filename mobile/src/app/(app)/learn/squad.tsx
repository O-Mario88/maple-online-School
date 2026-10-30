import { Avatar, Card, Grid, ProgressBar, Row, Badge, Body } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';

/** Inventory 32: a 5–8 learner study squad with a shared goal and streaks. */
export default function SquadScreen() {
  return (
    <PreviewScreen title="Study squad">
      {(m) => {
        const s = m.learner.squad;
        const ranked = [...s.members].sort((a, b) => b.minutes - a.minutes);
        return (
          <>
            <Card title={s.name} subtitle="Your squad this week" icon="people">
              <ProgressBar label={s.goal.label} value={s.goal.done / s.goal.target} />
              <Body muted>{`${s.goal.done} of ${s.goal.target} hours done together`}</Body>
            </Card>
            <Grid min={320}>
              <Card title="This week's minutes" icon="chart">
                {ranked.map((p, i) => (
                  <Row
                    key={p.name}
                    title={`${i + 1}. ${p.name}`}
                    detail={`${p.streak}-day streak`}
                    badge={<Badge label={`${p.minutes} min`} tone={i === 0 ? 'good' : 'neutral'} />}
                  />
                ))}
              </Card>
              <Card title="Squad chat" subtitle="Moderated · safe for learners" icon="chat">
                {s.chat.map((c) => (
                  <Row key={c.text} title={c.name} detail={c.text} badge={<Avatar name={c.name} size={28} />} />
                ))}
              </Card>
            </Grid>
          </>
        );
      }}
    </PreviewScreen>
  );
}
