import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { Badge, Body, Button, Card, ErrorText, Field, Heading, Loading, Row, Screen } from '@/components/ui';
import { api } from '@/lib/api/client';
import { useMe } from '@/lib/auth/auth-context';
import { checkNewLink, libraryChoices, resourceDetail, resourceHref, type LibraryChoice, type Resource } from '@/lib/resources/library';
import { useAddResource, useClassResources, useResources } from '@/lib/resources/queries';

/** Uploaded files are still served by the Django media server. */
const MEDIA_URL = process.env.EXPO_PUBLIC_MEDIA_URL ?? 'http://localhost:8000';

async function openResource(r: Resource, onError: (message: string) => void) {
  const href = resourceHref(r, MEDIA_URL);
  if (!href) {
    onError('This resource has no file or link yet.');
    return;
  }
  try {
    await Linking.openURL(href);
  } catch {
    onError('Could not open this resource on this device.');
  }
}

/** The resource library: class resources, search, and adding a link (staff). */
export default function LibraryScreen() {
  const me = useMe();
  const [search, setSearch] = useState('');
  const [openError, setOpenError] = useState<string | null>(null);
  const choices = me.data ? libraryChoices(me.data.memberships) : [];

  return (
    <Screen>
      <Button label="Back" variant="secondary" onPress={() => router.back()} />
      <Heading>Library</Heading>
      <ErrorText message={openError} />
      <ClassResourcesCard onError={setOpenError} />
      <Card title="Find resources">
        <Field label="Search" value={search} onChangeText={setSearch} placeholder="Title, topic or author" autoCorrect={false} />
        <ResourceList search={search} onError={setOpenError} />
      </Card>
      {choices.length > 0 ? <AddLinkCard choices={choices} /> : null}
    </Screen>
  );
}

function ClassResourcesCard({ onError }: { onError: (message: string) => void }) {
  const links = useClassResources();
  if (links.isPending) return <Loading label="Loading class resources" />;
  if (links.error) return <ErrorText message={links.error.message} />;
  if (links.data.length === 0) return null;

  async function open(resourceId: number) {
    const { data, error } = await api.GET('/api/v1/resources/{id}/', { params: { path: { id: resourceId } } });
    if (error || !data) {
      onError('This resource is no longer available.');
      return;
    }
    await openResource(data, onError);
  }

  return (
    <Card title="Shared with your classes">
      {links.data.map((l) => (
        <Row key={l.id} title={l.resource_title} onPress={() => open(l.resource)} accessibilityHint="Opens the resource" />
      ))}
    </Card>
  );
}

function ResourceList({ search, onError }: { search: string; onError: (message: string) => void }) {
  const resources = useResources(search);
  if (resources.isPending) return <Loading label="Searching the library" />;
  if (resources.error) return <ErrorText message={resources.error.message} />;
  if (resources.data.length === 0) {
    return <Body muted>{search.trim() ? 'Nothing matches that search.' : 'The library is empty for now.'}</Body>;
  }
  return (
    <>
      {resources.data.map((r) => (
        <Row
          key={r.id}
          title={r.title}
          detail={resourceDetail(r)}
          badge={r.file_path ? <Badge label="File" /> : r.external_url ? <Badge label="Link" tone="accent" /> : undefined}
          onPress={() => openResource(r, onError)}
          accessibilityHint="Opens the resource"
        />
      ))}
    </>
  );
}

/** Staff add a resource by link, to their own shelf or a school library. */
function AddLinkCard({ choices }: { choices: LibraryChoice[] }) {
  const add = useAddResource();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [school, setSchool] = useState<number | null>(choices[0]?.id ?? null);
  const [touched, setTouched] = useState(false);
  const problem = checkNewLink(title, url);

  async function save() {
    setTouched(true);
    if (problem) return;
    await add.mutateAsync({
      title: title.trim(),
      external_url: url.trim(),
      visibility: school ? 'institution_only' : 'private',
      owner_institution: school,
    });
    setTitle('');
    setUrl('');
    setTouched(false);
  }

  return (
    <Card title="Add a link">
      <Field label="Title" value={title} onChangeText={setTitle} maxLength={255} placeholder="e.g. Photosynthesis video" />
      <Field label="Web address" value={url} onChangeText={setUrl} autoCapitalize="none" keyboardType="url" placeholder="https://" />
      <Body muted>Who can see it</Body>
      <View style={styles.choices}>
        {choices.map((c) => (
          <Button key={c.id} label={picked(c.name, school === c.id)} variant="secondary" onPress={() => setSchool(c.id)} />
        ))}
        <Button label={picked('Only me', school === null)} variant="secondary" onPress={() => setSchool(null)} />
      </View>
      <ErrorText message={touched ? problem : null} />
      <ErrorText message={add.error?.message} />
      <Button label="Add to library" onPress={save} busy={add.isPending} />
    </Card>
  );
}

/** Marks the chosen option with a tick, so the choice doesn't rely on colour. */
function picked(label: string, chosen: boolean): string {
  return chosen ? `✓ ${label}` : label;
}

const styles = StyleSheet.create({
  choices: { gap: 8 },
});
