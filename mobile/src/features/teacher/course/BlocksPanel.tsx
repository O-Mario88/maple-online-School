import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { PopMenu } from '@/features/teacher/frame/TeacherInputs';
import { BLUE, BODY, INK, LINE, MUTED } from '@/features/teacher/frame/TeacherParts';
import type { BlockKind, CourseBuilder } from '@/mock/teacher-course';

import type { Builder } from './useCourseBuilder';

/** The ten kinds of block a lesson can hold; tap one to add it to the end of the lesson. */
export function BlockPalette({ c, b }: { c: CourseBuilder; b: Builder }) {
  return (
    <View>
      <View style={styles.head}>
        <Icon name="grid" size={13} color={INK} />
        <Text style={styles.headTitle} accessibilityRole="header">
          Drag and Drop Content Blocks
        </Text>
        <View style={styles.flex} />
        <Icon name="grid" size={12} color={MUTED} />
      </View>
      <View style={styles.tiles}>
        {c.blocks.map((k) => (
          <Pressable key={k.kind} style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]} onPress={() => b.addBlock(k.kind)} accessibilityRole="button" accessibilityLabel={`Add a ${k.label.replace('\n', ' ')} block`}>
            <Image source={k.icon} style={styles.tileIcon} contentFit="contain" />
            <Text style={styles.tileText}>{k.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/** The lesson's blocks in order; "⋮" moves a block up or down or removes it. */
export function LessonContent({ c, b, phone = false, editing = true }: { c: CourseBuilder; b: Builder; phone?: boolean; editing?: boolean }) {
  const icon = (kind: BlockKind) => c.blocks.find((k) => k.kind === kind)?.icon;
  return (
    <View>
      {phone ? null : (
        <Text style={styles.listTitle} accessibilityRole="header">
          Lesson Content
        </Text>
      )}
      {b.blocks.length === 0 ? <Text style={styles.empty}>This lesson is empty. Tap a block to add the first part.</Text> : null}
      <View style={phone ? null : styles.rows}>
        {b.blocks.map((x, i) => (
          <View key={x.id} style={[styles.row, phone ? styles.rowP : styles.rowBox, b.blocks.length - 1 - i > 0 && !phone && styles.rowGap]}>
            <Icon name="grid" size={phone ? 12 : 11} color={MUTED} />
            {x.kind === 'video' ? (
              <Image source={c.video.frame} style={phone ? styles.thumbP : styles.thumb} contentFit="cover" />
            ) : (
              <View style={phone ? styles.iconBoxP : styles.iconBox}>
                <Image source={icon(x.kind)} style={phone ? styles.iconP : styles.icon} contentFit="contain" />
              </View>
            )}
            <View style={styles.flex}>
              <Text style={[styles.rowText, phone && styles.rowTextP]} numberOfLines={phone ? 2 : 1}>
                {phone ? (
                  `${x.prefix}: ${x.title}`
                ) : (
                  <>
                    <Text style={styles.prefix}>{`${x.prefix}: `}</Text>
                    {x.title}
                  </>
                )}
              </Text>
              {phone && x.meta ? <Text style={styles.metaP}>{x.meta}</Text> : null}
            </View>
            {!phone && x.meta ? <Text style={styles.meta}>{x.meta}</Text> : null}
            {editing ? (
              <PopMenu
                label={`Actions for ${x.title}`}
                width={150}
                items={[
                  { label: 'Move up', icon: 'arrowRight', turn: -90, onPress: () => b.moveBlock(i, -1), disabled: i === 0 },
                  { label: 'Move down', icon: 'arrowRight', turn: 90, onPress: () => b.moveBlock(i, 1), disabled: i === b.blocks.length - 1 },
                  { label: 'Remove', icon: 'trash', danger: true, onPress: () => b.removeBlock(x.id) },
                ]}
              />
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 },
  headTitle: { fontSize: 12.5, fontWeight: '700', color: INK },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tile: { width: 86, height: 66, alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: 8, borderWidth: 1, borderColor: '#E3EAF5', backgroundColor: '#F6F9FE' },
  tilePressed: { borderColor: BLUE, backgroundColor: '#EAF1FD' },
  tileIcon: { width: 26, height: 26 },
  tileText: { fontSize: 10, lineHeight: 12, color: INK, textAlign: 'center' },
  listTitle: { fontSize: 12.5, fontWeight: '700', color: INK, marginTop: 18, marginBottom: 8 },
  empty: { fontSize: 11.5, color: MUTED, paddingVertical: 10 },
  rows: {},
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowBox: { height: 28, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, borderColor: LINE, backgroundColor: '#FFFFFF' },
  rowGap: { marginBottom: 5 },
  rowP: { paddingVertical: 8, borderBottomWidth: 1, borderColor: '#EEF2F8' },
  thumb: { width: 42, height: 22, borderRadius: 3 },
  thumbP: { width: 38, height: 26, borderRadius: 4 },
  iconBox: { width: 42, height: 22, alignItems: 'center', justifyContent: 'center' },
  iconBoxP: { width: 38, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 6, backgroundColor: '#F4F7FC' },
  icon: { width: 20, height: 20 },
  iconP: { width: 22, height: 22 },
  rowText: { fontSize: 10.5, color: INK },
  rowTextP: { fontSize: 11.5 },
  prefix: { fontWeight: '700' },
  meta: { fontSize: 10.5, color: BODY },
  metaP: { marginTop: 2, fontSize: 10.5, color: MUTED },
});
