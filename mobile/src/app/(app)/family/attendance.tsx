import { useMemo, useState } from 'react';

import { Badge, Banner, Button, Card, Chip, ChipRow, Field, Row, Segmented } from '@/components/ui';
import { LiveAttendance } from '@/features/parent/LiveAttendance';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { mockData } from '@/lib/mock';

const TONE = { present: 'good', late: 'warning', excused: 'info', absent: 'danger' } as const;

/** Inventory 53: a child's attendance and a one-tap excused absence. */
export default function FamilyAttendanceScreen() {
  const design = useMemo(() => mockData() != null, []);
  // Real builds read the register from the API; design builds keep the sample week and the excuse form.
  return design ? <DesignAttendance /> : <LiveAttendance />;
}

function DesignAttendance() {
  const [child, setChild] = useState('k1');
  const [reason, setReason] = useState<'Sick' | 'Offline' | 'Family'>('Sick');
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);
  return (
    <PreviewScreen title="Attendance" subtitle="Every school day, and a quick way to tell the school when your child can't come">
      {(m) => (
        <>
          <Segmented label="Child" options={m.family.children.map((c) => ({ value: c.id, label: c.name }))} value={child} onChange={setChild} />
          <Card title="Excuse an absence" subtitle="The class teacher sees it before the register" icon="calendar">
            <ChipRow>
              {(['Sick', 'Offline', 'Family'] as const).map((r) => (
                <Chip key={r} label={r} selected={r === reason} onPress={() => setReason(r)} />
              ))}
            </ChipRow>
            <Field label="Note (optional)" value={note} onChangeText={setNote} placeholder="e.g. Fever, back on Monday" />
            {sent ? <Banner tone="good" title="Sent to the school" body="Saved with today's date and your name." /> : null}
            <Button label="Excuse today" icon="check" onPress={() => setSent(true)} />
          </Card>
          <Card title="This week" icon="check">
            {m.family.attendanceFeed.map((d) => (
              <Row
                key={d.day}
                icon={d.status === 'present' ? 'check' : d.status === 'late' ? 'clock' : 'info'}
                title={d.day}
                detail={d.detail}
                badge={<Badge label={d.status} tone={TONE[d.status as keyof typeof TONE]} />}
              />
            ))}
          </Card>
        </>
      )}
    </PreviewScreen>
  );
}
