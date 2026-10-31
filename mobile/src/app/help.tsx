import { type Href, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Badge, Button, Card, EmptyState, Field, Grid, Row } from '@/components/ui';
import { Sheet, SheetButton } from '@/components/ui/Sheet';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { toast } from '@/lib/toast';
import type { MockData } from '@/mock';

type Topic = MockData['publicPages']['help'][number];
type Article = Topic['articles'][number];

const matches = (a: Article, q: string) => `${a.title} ${a.answer}`.toLowerCase().includes(q.trim().toLowerCase());

/** The help topics, filtered by the search box; each article opens with its answer. */
function HelpTopics({ topics }: { topics: readonly Topic[] }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<Article | null>(null);
  const shown = topics.map((t) => ({ ...t, articles: t.articles.filter((a) => matches(a, query)) })).filter((t) => t.articles.length > 0);
  return (
    <>
      <Field label="Search help" placeholder="e.g. pay fees with MTN" value={query} onChangeText={setQuery} />
      {shown.length === 0 ? <EmptyState icon="search" title="No articles match" body="Try other words, or chat with support below." /> : null}
      <Grid min={280}>
        {shown.map((h) => (
          <Card key={h.topic} title={h.topic} icon="flag">
            {h.articles.map((a) => (
              <Row key={a.title} icon="chat" title={a.title} onPress={() => setOpen(a)} />
            ))}
          </Card>
        ))}
      </Grid>
      <Sheet visible={open != null} title={open?.title ?? ''} onClose={() => setOpen(null)}>
        <Text style={styles.answer}>{open?.answer}</Text>
        {open && 'href' in open && open.href ? (
          <SheetButton
            primary
            label="Open it"
            onPress={() => {
              const href = open.href as Href;
              setOpen(null);
              router.push(href);
            }}
          />
        ) : null}
      </Sheet>
    </>
  );
}

/** Inventory 14: help articles and live service status. */
export default function HelpScreen() {
  return (
    <PreviewScreen publicNav title="Help" subtitle="Answers for learners, parents, teachers and schools">
      {(m) => (
        <>
          <HelpTopics topics={m.publicPages.help} />
          <Card title="Service status" icon="live">
            {m.publicPages.status.map((s) => (
              <Row key={s.service} icon={s.state === 'Working' ? 'check' : 'alert'} title={s.service} badge={<Badge label={s.state} tone={s.state === 'Working' ? 'good' : 'warning'} />} />
            ))}
          </Card>
          <Button label="Chat with support on WhatsApp" icon="chat" variant="secondary" onPress={() => toast('Support will message you on WhatsApp within an hour (8am to 8pm EAT).')} />
        </>
      )}
    </PreviewScreen>
  );
}

const styles = StyleSheet.create({
  answer: { fontSize: 14, lineHeight: 21, color: '#3D4656' },
});
