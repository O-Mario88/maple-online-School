import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { BLUE, BODY, GREEN, INK, IconTile, LINE, MUTED, RED, StepBadge, TButton } from '@/features/teacher/frame/TeacherParts';
import { processingSteps, sourceLinkError } from '@/lib/teacher-home';
import { toast } from '@/lib/toast';
import type { SourceKey, StudioNew } from '@/mock/teacher-studio';

/** Simulated seconds per real second, so the "60 seconds" run plays in about five. */
const SPEED = 12;
const TICK_MS = 100;

export interface StudioRun {
  elapsed: number;
  running: boolean;
  source: string;
  start: (source: string) => void;
}

/** Plays the AI processing steps for a chosen source. It opens finished, as the reference shows. */
export function useStudioRun(s: StudioNew): StudioRun {
  const last = s.steps[s.steps.length - 1].at;
  const [elapsed, setElapsed] = useState(last);
  const [source, setSource] = useState(s.sampleFile);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };
  useEffect(() => stop, []);
  const start = useCallback(
    (label: string) => {
      stop();
      setSource(label);
      setElapsed(0);
      const began = Date.now();
      timer.current = setInterval(() => {
        const e = ((Date.now() - began) / 1000) * SPEED;
        if (e < last) {
          setElapsed(e);
          return;
        }
        stop();
        setElapsed(last);
        toast('Course generated. Review it below before you publish.');
      }, TICK_MS);
    },
    [last],
  );
  return { elapsed, running: elapsed < last, source, start };
}

function StepHead({ n, title, sub, compact = false }: { n: number; title: string; sub: string; compact?: boolean }) {
  return (
    <View style={styles.stepHead}>
      <StepBadge n={n} size={32} />
      <View style={styles.flex}>
        <Text style={styles.stepTitle} accessibilityRole="header">
          {title}
        </Text>
        <Text style={[styles.stepSub, compact && styles.stepSubSmall]}>{sub}</Text>
      </View>
    </View>
  );
}

/** A link box with an arrow button; checks the link before starting. */
function LinkBox({ kind, placeholder, icon, color, onUse }: { kind: 'youtube' | 'classroom'; placeholder: string; icon: 'playFill' | 'people'; color: string; onUse: (url: string) => void }) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const use = () => {
    const problem = sourceLinkError(kind, text);
    setError(problem);
    if (!problem) {
      onUse(text.trim());
      setText('');
    }
  };
  return (
    <View>
      <View style={[styles.linkBox, error ? styles.linkBoxBad : null]}>
        <IconTile icon={icon} color={color} size={22} />
        <TextInput style={styles.linkInput} value={text} onChangeText={(t) => { setText(t); setError(null); }} onSubmitEditing={use} placeholder={placeholder} placeholderTextColor={MUTED} autoCapitalize="none" autoCorrect={false} inputMode="url" accessibilityLabel={placeholder} />
        <Pressable onPress={use} accessibilityRole="button" accessibilityLabel={`Use this link: ${placeholder}`} hitSlop={8}>
          <Icon name="arrowRight" size={17} color={INK} />
        </Pressable>
      </View>
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

/** The left half of step 1: whatever the chosen tab asks for. */
function SourcePane({ s, tab, start }: { s: StudioNew; tab: SourceKey; start: (source: string) => void }) {
  const [text, setText] = useState('');
  if (tab === 'youtube' || tab === 'classroom') {
    const yt = tab === 'youtube';
    return (
      <View style={styles.zone}>
        <IconTile icon={yt ? 'playFill' : 'people'} color={yt ? RED : GREEN} size={40} />
        <Text style={styles.zoneTitle}>{yt ? 'Paste a YouTube playlist or video' : 'Paste a Google Classroom class link'}</Text>
        <View style={styles.zoneLink}>
          <LinkBox kind={tab} placeholder={yt ? 'https://youtube.com/playlist?list=…' : 'https://classroom.google.com/c/…'} icon={yt ? 'playFill' : 'people'} color={yt ? RED : GREEN} onUse={(url) => start(url)} />
        </View>
      </View>
    );
  }
  if (tab === 'text') {
    const go = () => (text.trim().length < 40 ? toast('Paste a bit more: at least a paragraph of notes or a topic list.') : start('Pasted notes'));
    return (
      <View style={[styles.zone, styles.zoneText]}>
        <TextInput style={styles.paste} value={text} onChangeText={setText} multiline placeholder="Paste lesson notes, a scheme of work or a topic list…" placeholderTextColor={MUTED} accessibilityLabel="Paste your content" />
        <TButton label="Build my course" icon="sparkle" onPress={go} />
      </View>
    );
  }
  const paper = tab === 'paper';
  return (
    <View style={styles.zone}>
      <Icon name="upload" size={30} color={BLUE} />
      <Text style={styles.zoneTitle}>{paper ? 'Drag and drop a past exam paper (PDF or photos)' : 'Drag and drop a PDF, Word, PowerPoint, or image file'}</Text>
      <Text style={styles.zoneSub}>Supports PDFs, DOCX, PPTX, JPG, PNG (max 50MB)</Text>
      <TButton label="Choose File" onPress={() => start(paper ? 'UCE Mathematics past paper 2023 (Paper 1).pdf' : s.sampleFile)} style={styles.choose} />
    </View>
  );
}

/** Step 1: pick a source, upload or paste it. */
export function AddContent({ s, run }: { s: StudioNew; run: StudioRun }) {
  const [tab, setTab] = useState<SourceKey>('file');
  return (
    <View>
      <StepHead n={1} title="Add Your Content" sub="Upload a file, paste a link, or choose from your existing materials." />
      <View style={styles.tabs} accessibilityRole="tablist">
        {s.sources.map((src) => {
          const on = src.key === tab;
          return (
            <Pressable key={src.key} style={[styles.tab, on && styles.tabOn]} onPress={() => setTab(src.key)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
              <Text style={[styles.tabText, on && styles.tabTextOn]}>{src.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.addRow}>
        <View style={styles.flex}>
          <SourcePane s={s} tab={tab} start={run.start} />
        </View>
        <View style={styles.side}>
          <Text style={styles.sideLabel}>Or use a link</Text>
          <View style={styles.links}>
            <LinkBox kind="youtube" placeholder="Paste YouTube playlist or video link" icon="playFill" color={RED} onUse={run.start} />
            <LinkBox kind="classroom" placeholder="Paste Google Classroom link" icon="people" color={GREEN} onUse={run.start} />
          </View>
          <Text style={[styles.sideLabel, styles.supported]}>Supported sources</Text>
          <View style={styles.sources}>
            {s.supported.map((x) => (
              <View key={x.label} style={styles.source} accessible accessibilityLabel={x.label.replace('\n', ' ')}>
                <IconTile icon={x.icon} color={x.color} size={24} soft />
                <Text style={styles.sourceText}>{x.label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.linkSources}>
            {s.linkSources.map((x) => (
              <View key={x.label} style={styles.linkSource} accessible accessibilityLabel={x.label.replace('\n', ' ')}>
                <IconTile icon={x.icon} color={x.color} size={18} />
                <Text style={styles.sourceText}>{x.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

/** Step 2: the AI's progress, step by step, with the time each step took. */
export function Processing({ s, run, phone = false }: { s: StudioNew; run: StudioRun; phone?: boolean }) {
  const states = processingSteps(s.steps.map((x) => x.at), run.elapsed);
  return (
    <View>
      {phone ? (
        <View style={styles.phoneHead}>
          <StepBadge n={2} size={26} />
          <Text style={styles.phoneTitle}>AI Processing</Text>
        </View>
      ) : (
        <StepHead n={2} compact title="AI Processing" sub={run.running ? `Working on ${run.source}` : 'Our AI analyses your content and generates a complete course.'} />
      )}
      <View style={styles.steps} accessibilityLiveRegion="polite">
        {s.steps.map((x, i) => {
          const st = states[i];
          const label = phone ? x.phone : x.label;
          return (
            <View key={x.label} style={styles.stepRow} accessible accessibilityLabel={`${label} ${st === 'done' ? 'done' : st === 'running' ? 'in progress' : 'waiting'}`}>
              {st === 'done' ? (
                <View style={styles.tick}>
                  <Icon name="check" size={12} color="#FFFFFF" />
                </View>
              ) : st === 'running' ? (
                <ActivityIndicator size="small" color={BLUE} style={styles.tickSpace} />
              ) : (
                <View style={[styles.tick, styles.tickWaiting]} />
              )}
              <Text style={[styles.stepText, st === 'waiting' && styles.waiting, phone && styles.stepTextP]}>{label}</Text>
              <Text style={styles.secs}>{st === 'done' ? `${phone && i === s.steps.length - 1 ? 60 : x.at}s` : st === 'running' ? `${Math.floor(run.elapsed)}s` : ''}</Text>
            </View>
          );
        })}
      </View>
      <View style={[styles.done, run.running && styles.pending]}>
        <Icon name="sparkle" size={phone ? 20 : 24} color={GREEN} />
        <View style={styles.flex}>
          <Text style={styles.doneTitle}>{run.running ? 'Building your course…' : 'Course generated in 60 seconds!'}</Text>
          <Text style={styles.doneSub}>{run.running ? 'This takes about a minute.' : phone ? 'Review and customize.' : 'Review and customize before publishing.'}</Text>
        </View>
        {run.running ? null : (
          <View style={styles.doneTick}>
            <Icon name="check" size={14} color="#FFFFFF" />
          </View>
        )}
      </View>
    </View>
  );
}

/** Step 1 on phones: five source tiles; links and pasted text open a box below them. */
export function PhoneSources({ s, run }: { s: StudioNew; run: StudioRun }) {
  const [open, setOpen] = useState<SourceKey | null>(null);
  const pick = (key: SourceKey) => {
    if (key === 'file') run.start(s.sampleFile);
    else if (key === 'paper') run.start('UCE Mathematics past paper 2023 (Paper 1).pdf');
    else setOpen((o) => (o === key ? null : key));
  };
  return (
    <View>
      <View style={styles.phoneHead}>
        <StepBadge n={1} size={26} />
        <View style={styles.flex}>
          <Text style={styles.phoneTitle}>Add Your Content</Text>
          <Text style={styles.phoneSub}>Upload a file, paste a link, or choose a source.</Text>
        </View>
      </View>
      <View style={styles.tiles}>
        {s.sources.map((src, i) => (
          <Pressable key={src.key} style={[styles.tile, i < 3 ? styles.tileThird : styles.tileHalf, (open === src.key || (i === 0 && open === null)) && styles.tileOn]} onPress={() => pick(src.key)} accessibilityRole="button" accessibilityLabel={src.label}>
            <IconTile icon={src.icon} color={src.color} size={30} soft={src.key !== 'youtube' && src.key !== 'classroom'} />
            <Text style={styles.tileText}>{src.short ?? src.label}</Text>
          </Pressable>
        ))}
      </View>
      {open === 'youtube' || open === 'classroom' ? (
        <View style={styles.openBox}>
          <LinkBox kind={open} placeholder={open === 'youtube' ? 'Paste YouTube link' : 'Paste Google Classroom link'} icon={open === 'youtube' ? 'playFill' : 'people'} color={open === 'youtube' ? RED : GREEN} onUse={run.start} />
        </View>
      ) : null}
      {open === 'text' ? (
        <View style={styles.openBox}>
          <SourcePane s={s} tab="text" start={run.start} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  stepHead: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepTitle: { fontSize: 17, fontWeight: '700', color: INK },
  stepSub: { fontSize: 12.5, color: BODY, marginTop: 2 },
  stepSubSmall: { fontSize: 10 },
  tabs: { flexDirection: 'row', marginTop: 14, borderBottomWidth: 1, borderColor: LINE },
  tab: { paddingHorizontal: 12, paddingVertical: 9, borderBottomWidth: 2.5, borderColor: 'transparent' },
  tabOn: { borderColor: BLUE, backgroundColor: '#EEF4FF' },
  tabText: { fontSize: 13, color: INK },
  tabTextOn: { color: BLUE, fontWeight: '600' },
  addRow: { flexDirection: 'row', gap: 16, marginTop: 14 },
  zone: { height: 210, alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 18, borderRadius: 10, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#C9D6EA', backgroundColor: '#FAFCFF' },
  zoneText: { alignItems: 'stretch', justifyContent: 'flex-start', padding: 12, borderStyle: 'solid' },
  zoneTitle: { fontSize: 13, fontWeight: '600', color: INK, textAlign: 'center' },
  zoneSub: { fontSize: 11, color: MUTED },
  zoneLink: { alignSelf: 'stretch', marginTop: 6 },
  choose: { marginTop: 10, width: 140 },
  paste: { flex: 1, minHeight: 120, marginBottom: 10, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: LINE, backgroundColor: '#FFFFFF', fontSize: 13, color: INK, textAlignVertical: 'top' },
  side: { width: 250 },
  sideLabel: { fontSize: 13, fontWeight: '600', color: INK },
  supported: { marginTop: 16 },
  links: { gap: 8, marginTop: 8 },
  linkBox: { height: 30, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 8, borderRadius: 8, borderWidth: 1, borderColor: LINE, backgroundColor: '#FFFFFF' },
  linkBoxBad: { borderColor: RED },
  linkInput: { flex: 1, minWidth: 0, height: 28, fontSize: 11.5, color: INK },
  error: { marginTop: 4, fontSize: 11, color: RED },
  sources: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 8, marginTop: 8 },
  source: { width: '20%', alignItems: 'center', gap: 3 },
  sourceText: { fontSize: 8.5, color: BODY, textAlign: 'center' },
  linkSources: { flexDirection: 'row', gap: 18, marginTop: 10, paddingLeft: 6 },
  linkSource: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  steps: { gap: 0, marginTop: 12 },
  stepRow: { height: 25.5, flexDirection: 'row', alignItems: 'center', gap: 10 },
  tick: { width: 18, height: 18, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: GREEN },
  tickWaiting: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#C9D6EA' },
  tickSpace: { width: 18, height: 18 },
  stepText: { flex: 1, fontSize: 11.5, color: INK },
  stepTextP: { fontSize: 12 },
  waiting: { color: MUTED },
  secs: { fontSize: 11.5, color: BODY, minWidth: 28, textAlign: 'right' },
  done: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 18, padding: 12, borderRadius: 10, backgroundColor: '#E9F7EF' },
  pending: { backgroundColor: '#EEF4FF' },
  doneTitle: { fontSize: 12, fontWeight: '700', color: INK },
  doneSub: { fontSize: 10.5, color: BODY, marginTop: 3 },
  doneTick: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: GREEN },
  phoneHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  phoneTitle: { fontSize: 15, fontWeight: '700', color: INK },
  phoneSub: { fontSize: 11.5, color: BODY, marginTop: 2 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  tile: { height: 62, alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: 10, borderWidth: 1, borderColor: LINE, backgroundColor: '#FFFFFF' },
  tileThird: { width: '31.5%' },
  tileHalf: { width: '48.5%' },
  tileOn: { borderColor: '#BBD2FA', backgroundColor: '#EEF4FF' },
  tileText: { fontSize: 11, color: INK },
  openBox: { marginTop: 10 },
});
