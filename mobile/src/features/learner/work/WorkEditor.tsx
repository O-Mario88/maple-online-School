import { Image } from 'expo-image';
import { type ReactNode, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { mmss } from '@/lib/feedback';
import type { IconName } from '@/lib/icons';

import { BLUE, BODY, GREEN, INK, MathDoc } from './MathText';
import type { Work, WorkState, WorkTab } from './useWork';

const TABS: readonly { key: WorkTab; label: string }[] = [
  { key: 'text', label: 'Text Editor' },
  { key: 'code', label: 'Code (if required)' },
  { key: 'files', label: 'Upload Files' },
  { key: 'scanner', label: 'Camera Scanner' },
  { key: 'viva', label: 'Viva Recording' },
];
const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'ui-monospace, Menlo, monospace' });

function Tool({ icon, label, onPress, disabled = false }: { icon: IconName; label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable style={[styles.tool, disabled && styles.toolOff]} onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label} hitSlop={4}>
      <Icon name={icon} size={16} color={INK} />
    </Pressable>
  );
}

function Toolbar({ s, editing, setEditing, tall, setTall, phone }: { s: WorkState; editing: boolean; setEditing: (v: boolean) => void; tall: boolean; setTall: (v: boolean) => void; phone: boolean }) {
  const e = s.editor;
  const [heading, setHeading] = useState(false);
  return (
    <View style={[styles.toolbar, phone && styles.toolbarP]}>
      <Tool icon="undo" label="Undo" onPress={e.undo} disabled={!e.canUndo} />
      <Tool icon="redo" label="Redo" onPress={e.redo} disabled={!e.canRedo} />
      <View style={styles.sep} />
      <Pressable
        style={styles.para}
        onPress={() => {
          e.prefix('# ');
          setHeading(!heading);
        }}
        accessibilityRole="button"
        accessibilityLabel="Toggle heading on this line">
        <Text style={styles.paraText}>{heading ? 'Heading' : 'Paragraph'}</Text>
        <Icon name="chevronDown" size={12} color={INK} />
      </Pressable>
      <Tool icon="bold" label="Bold" onPress={() => e.wrap('**')} />
      <Tool icon="italic" label="Italic" onPress={() => e.wrap('*')} />
      <Tool icon="underline" label="Underline" onPress={() => e.wrap('__')} />
      <View style={styles.sep} />
      <Tool icon="listBullet" label="Bulleted list" onPress={() => e.prefix('• ')} />
      <Tool icon="listNumber" label="Numbered list" onPress={() => e.prefix('1. ')} />
      <Tool icon="link" label="Insert link" onPress={() => e.insert(' https://')} />
      <Tool icon="sigma" label="Insert fraction" onPress={() => e.insert(' 1/2 ')} />
      <View style={styles.sep} />
      <Tool icon="columns" label={editing ? 'Show preview' : 'Edit text'} onPress={() => setEditing(!editing)} />
      <View style={styles.flex} />
      <Tool icon="expand" label={tall ? 'Make editor smaller' : 'Make editor taller'} onPress={() => setTall(!tall)} />
    </View>
  );
}

/** The answer: rendered with stacked fractions; tap to edit the plain text ("2/3", **bold**, "# " headings). */
function TextPane({ s, phone }: { s: WorkState; phone: boolean }) {
  const [editing, setEditing] = useState(false);
  const [tall, setTall] = useState(false);
  const e = s.editor;
  return (
    <>
      <Toolbar s={s} editing={editing} setEditing={setEditing} tall={tall} setTall={setTall} phone={phone} />
      <View style={styles.savedRow}>
        <Icon name="check" size={12} color={GREEN} />
        <Text style={styles.saved}>{s.saved}</Text>
      </View>
      <View style={[styles.body, phone && styles.bodyP, tall && styles.bodyTall]}>
        {editing ? (
          <TextInput
            style={styles.input}
            value={e.text}
            onChangeText={e.setText}
            onSelectionChange={(ev) => e.setSel(ev.nativeEvent.selection)}
            multiline
            autoFocus
            textAlignVertical="top"
            accessibilityLabel="Your answers. Write fractions as 2/3 and headings with #"
          />
        ) : (
          <ScrollView>
            <Pressable onPress={() => setEditing(true)} accessibilityRole="button" accessibilityLabel="Edit your answers">
              <MathDoc text={e.text} size={phone ? 13.5 : 14.5} />
            </Pressable>
          </ScrollView>
        )}
      </View>
    </>
  );
}

function CodePane({ s }: { s: WorkState }) {
  const lines = Math.max(6, s.code.split('\n').length);
  return (
    <View style={styles.code}>
      <View style={styles.gutter}>
        {Array.from({ length: lines }, (_, i) => (
          <Text key={i} style={styles.lineNo}>
            {i + 1}
          </Text>
        ))}
      </View>
      <TextInput style={styles.codeInput} value={s.code} onChangeText={s.setCode} multiline autoCapitalize="none" autoCorrect={false} placeholder="// Code is not required for this assignment." placeholderTextColor="#8A93A6" accessibilityLabel="Code answer" />
    </View>
  );
}

function FileRow({ icon, title, meta, onPress }: { icon: number; title: string; meta: string; onPress?: () => void }) {
  return (
    <View style={styles.file}>
      <Image source={icon} style={styles.fileIcon} />
      <View style={styles.flex}>
        <Text style={styles.fileTitle}>{title}</Text>
        <Text style={styles.fileMeta}>{meta}</Text>
      </View>
      {onPress ? (
        <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Edit ${title}`} hitSlop={8}>
          <Text style={styles.edit}>Edit</Text>
        </Pressable>
      ) : null}
    </View>
  );
}


/** Everything that goes in with the submission. */
export function FilesList({ w, s, compact = false }: { w: Work; s: WorkState; compact?: boolean }) {
  const v = s.viva;
  return (
    <View style={compact ? styles.filesCompact : styles.files}>
      <FileRow icon={w.fileIcons.text} title="My Solution (Text)" meta={s.progress.answered > 0 ? 'Saved in editor' : 'Not started'} />
      <FileRow icon={w.fileIcons.image} title="Handwritten Work" meta={`${s.scanner.pages.length} image${s.scanner.pages.length === 1 ? '' : 's'}`} onPress={() => s.setTab('scanner')} />
      <FileRow icon={w.fileIcons.video} title="Viva Recording" meta={v.mode === 'idle' ? 'Not recorded' : `${mmss(v.seconds)} / ${mmss(v.max)}`} onPress={() => s.setTab('viva')} />
      {s.extra.map((f) => (
        <FileRow key={f} icon={w.fileIcons.text} title={f} meta="Uploaded" />
      ))}
    </View>
  );
}

/** The "My Work" card: five tabs, with the editor first. Scanner and viva tabs manage what was captured. */
export function WorkEditor({ w, s, phone = false, scanner, viva }: { w: Work; s: WorkState; phone?: boolean; scanner: ReactNode; viva: ReactNode }) {
  return (
    <View>
      <Text style={styles.title}>My Work</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {TABS.map((t) => {
          const on = s.tab === t.key;
          return (
            <Pressable key={t.key} style={[styles.tab, on && styles.tabOn]} onPress={() => s.setTab(t.key)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
              <Text style={[styles.tabText, on && styles.tabTextOn]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {s.tab === 'text' ? <TextPane s={s} phone={phone} /> : null}
      {s.tab === 'code' ? <CodePane s={s} /> : null}
      {s.tab === 'files' ? (
        <View style={styles.pane}>
          <FilesList w={w} s={s} compact />
          <Pressable style={styles.addFile} onPress={s.addFile} accessibilityRole="button">
            <Icon name="upload" size={15} color={BLUE} />
            <Text style={styles.addFileText}>Upload a file</Text>
          </Pressable>
        </View>
      ) : null}
      {s.tab === 'scanner' ? <View style={styles.pane}>{scanner}</View> : null}
      {s.tab === 'viva' ? <View style={styles.pane}>{viva}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700', color: INK },
  tabs: { gap: 0, marginTop: 10, borderRadius: 5, borderWidth: 1, borderColor: '#E1E7F0' },
  tab: { height: 30, justifyContent: 'center', paddingHorizontal: 12 },
  tabOn: { backgroundColor: '#EAF1FE' },
  tabText: { fontSize: 11.5, color: INK },
  tabTextOn: { color: BLUE, fontWeight: '600' },
  toolbar: { height: 38, flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingHorizontal: 6, borderRadius: 5, borderWidth: 1, borderColor: '#E1E7F0' },
  toolbarP: { height: 'auto', flexWrap: 'wrap', rowGap: 4, paddingVertical: 5 },
  tool: { width: 24, height: 26, alignItems: 'center', justifyContent: 'center' },
  toolOff: { opacity: 0.35 },
  sep: { width: 1, height: 20, marginHorizontal: 2, backgroundColor: '#E1E7F0' },
  para: { height: 26, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 8, borderRadius: 4, borderWidth: 1, borderColor: '#E1E7F0' },
  paraText: { fontSize: 12, color: INK },
  savedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 8 },
  saved: { fontSize: 11, color: BODY },
  body: { height: 150, marginTop: 4, paddingHorizontal: 14 },
  bodyP: { height: 220, paddingHorizontal: 4 },
  bodyTall: { height: 360 },
  input: { flex: 1, padding: 8, borderRadius: 5, borderWidth: 1, borderColor: '#BBD0F4', fontSize: 14, lineHeight: 21, color: INK },
  code: { height: 190, flexDirection: 'row', marginTop: 10, borderRadius: 5, backgroundColor: '#0F1729', overflow: 'hidden' },
  gutter: { width: 34, paddingTop: 8, alignItems: 'flex-end', paddingRight: 8, backgroundColor: '#0B1220' },
  lineNo: { fontFamily: MONO, fontSize: 12, lineHeight: 19, color: '#5D6B85' },
  codeInput: { flex: 1, padding: 8, fontFamily: MONO, fontSize: 12.5, lineHeight: 19, color: '#E6EDF7' },
  pane: { marginTop: 12 },
  files: { gap: 10 },
  filesCompact: { gap: 8 },
  file: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#E6EBF2', backgroundColor: '#FFFFFF' },
  fileIcon: { width: 40, height: 40 },
  fileTitle: { fontSize: 13, fontWeight: '500', color: INK },
  fileMeta: { marginTop: 3, fontSize: 12, color: BODY },
  edit: { fontSize: 12, fontWeight: '500', color: BLUE },
  addFile: { height: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10, borderRadius: 6, borderWidth: 1, borderStyle: 'dashed', borderColor: '#A9C4F5' },
  addFileText: { fontSize: 13, color: BLUE },
});
