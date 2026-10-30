import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Button, Card, Field, Grid, ProgressBar, ToggleRow } from '@/components/ui';
import { Radius, Spacing, type Theme, Type } from '@/constants/theme';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { useStyles } from '@/hooks/use-styles';

/** Inventory 25: the live classroom with low-data mode, a pulse poll, hand-raising and chat. */
export default function LiveRoomScreen() {
  const { theme, styles } = useStyles(makeStyles);
  const [hand, setHand] = useState(false);
  const [message, setMessage] = useState('');
  return (
    <PreviewScreen back title="Live class">
      {(m) => {
        const room = m.learner.classroom;
        const votes = room.poll.votes.reduce((a, b) => a + b, 0);
        return (
          <>
            <View style={styles.stage} accessibilityLabel={`${room.teacher} is teaching. Whiteboard showing simultaneous equations.`}>
              <Text style={styles.board}>2x + 3y = 12{'\n'}x − y = 1   (×3)</Text>
              <View style={styles.stageFoot}>
                <Icon name="live" size={16} color={theme.sidebarText} />
                <Text style={styles.stageText}>
                  {room.teacher} · {room.participants} learners · about 24 MB an hour in low-data mode
                </Text>
              </View>
            </View>
            <View style={styles.controls}>
              <Button label={hand ? 'Lower hand' : 'Raise hand'} icon="hand" variant={hand ? 'primary' : 'secondary'} compact onPress={() => setHand(!hand)} />
              <Button label="Mute" icon="mic" variant="secondary" compact onPress={() => undefined} />
              <Button label="Leave" variant="danger" compact onPress={() => undefined} />
            </View>
            <ToggleRow label="Low-data mode" detail="Audio and whiteboard only, no video" initial />
            <Grid min={320}>
              <Card title="Pulse poll" subtitle={room.poll.question} icon="chart">
                {room.poll.options.map((o, i) => (
                  <ProgressBar key={o} label={o} value={room.poll.votes[i] / votes} />
                ))}
              </Card>
              <Card title="Class chat" subtitle="Moderated by your teacher" icon="chat">
                {room.chat.map((c) => (
                  <View key={c.text} style={styles.msg}>
                    <Text style={styles.msgName}>{c.name}</Text>
                    <Text style={styles.msgText}>{c.text}</Text>
                  </View>
                ))}
                <Field label="Message" value={message} onChangeText={setMessage} placeholder="Ask or answer…" />
              </Card>
            </Grid>
          </>
        );
      }}
    </PreviewScreen>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    stage: { aspectRatio: 16 / 9, borderRadius: Radius.lg, backgroundColor: t.sidebar, justifyContent: 'center', alignItems: 'center' },
    board: { ...Type.title, color: t.sidebarText, textAlign: 'center', fontFamily: 'monospace' },
    stageFoot: { position: 'absolute', left: Spacing.three, bottom: Spacing.three, flexDirection: 'row', gap: Spacing.two, alignItems: 'center' },
    stageText: { ...Type.caption, color: t.sidebarText },
    controls: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
    msg: { gap: 2, paddingVertical: Spacing.one },
    msgName: { ...Type.caption, color: t.accentText },
    msgText: { ...Type.small, color: t.text },
  });
}
