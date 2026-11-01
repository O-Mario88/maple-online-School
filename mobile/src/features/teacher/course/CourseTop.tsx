import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/components/icon";
import { useTeacherGo } from "@/features/teacher/frame/TeacherFrame";
import { PopMenu } from "@/features/teacher/frame/TeacherInputs";
import {
  BLUE,
  BODY,
  INK,
  LINE,
  MUTED,
  Pill,
  TButton,
} from "@/features/teacher/frame/TeacherParts";
import { toast } from "@/lib/toast";
import type { CourseBuilder } from "@/mock/teacher-course";

import type { Builder } from "./useCourseBuilder";

/** The course's title row: thumbnail, title, status, details and the save and publish buttons. */
export function CourseHeader({ c, b }: { c: CourseBuilder; b: Builder }) {
  const k = c.course;
  return (
    <View style={styles.header}>
      <Image
        source={k.thumb}
        style={styles.thumb}
        contentFit="cover"
        accessibilityLabel="Course cover: maths on a chalkboard"
      />
      <View style={styles.flex}>
        <View style={styles.titleRow}>
          <Text style={styles.title} accessibilityRole="header">
            {k.title}
          </Text>
          <Pill
            label={b.status}
            tone={b.status === "Draft" ? "blue" : "amber"}
            style={styles.center}
          />
          <View style={styles.flex} />
          <Actions c={c} b={b} />
        </View>
        <Text style={styles.desc}>{k.description}</Text>
        <View style={styles.meta}>
          <Meta icon="calendar" text={k.board} />
          <Meta icon="link" text={k.subject} />
          <Meta icon="notes" text={`${b.lessonCount} lessons`} />
          <Meta icon="clipboard" text={`${b.modules.length} modules`} />
          <Text style={styles.metaText} numberOfLines={1}>
            {b.saved}
          </Text>
        </View>
      </View>
    </View>
  );
}

/** Preview, save, publish and the "⋮" menu, on the title's row. */
function Actions({ c, b }: { c: CourseBuilder; b: Builder }) {
  const go = useTeacherGo();
  return (
    <View style={styles.actions}>
      <TButton
        small
        label="Preview Course"
        icon="eye"
        variant="outline"
        onPress={() => go(c.preview)}
      />
      <TButton
        small
        label="Save Draft"
        variant="outline"
        onPress={b.saveDraft}
      />
      <TButton
        small
        label="Publish Course"
        icon="arrowRight"
        iconRight
        onPress={b.publish}
      />
      <PopMenu
        label="More course actions"
        items={[
          {
            label: "Course settings",
            icon: "settings",
            onPress: () => b.setSection("setup"),
          },
          {
            label: "Duplicate course",
            icon: "grid",
            onPress: () =>
              toast("A copy of this course was saved to your drafts."),
          },
          {
            label: "Archive course",
            icon: "folder",
            danger: true,
            onPress: () =>
              toast(
                "Archiving needs the course to be unpublished first. It is still a draft.",
              ),
          },
        ]}
      >
        <View style={styles.moreBtn}>
          <Icon name="more" size={16} color={BLUE} />
        </View>
      </PopMenu>
    </View>
  );
}

function Meta({
  icon,
  text,
}: {
  icon: "calendar" | "link" | "notes" | "clipboard";
  text: string;
}) {
  return (
    <View style={styles.metaItem}>
      <Icon name={icon} size={12} color={MUTED} />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

/** The phone's course row: thumbnail, title, status and counts. */
export function CourseHeaderPhone({ c, b }: { c: CourseBuilder; b: Builder }) {
  return (
    <View style={styles.headerP}>
      <Image source={c.course.thumb} style={styles.thumbP} contentFit="cover" />
      <View style={styles.flex}>
        <Text style={styles.titleP}>{c.course.title}</Text>
        <Text
          style={styles.metaP}
        >{`${b.modules.length} modules  •  ${b.lessonCount} lessons`}</Text>
      </View>
      <Pill label={b.status} tone={b.status === "Draft" ? "blue" : "amber"} />
    </View>
  );
}

/** Modules that fold open to their lessons; tap a lesson to edit it, "⋮" to move, copy or delete it. */
export function StructurePanel({ b }: { b: Builder }) {
  return (
    <View>
      <View style={styles.structHead}>
        <Text style={styles.structTitle} accessibilityRole="header">
          Course Structure
        </Text>
        <Pressable
          style={styles.addModule}
          onPress={b.addModule}
          accessibilityRole="button"
          accessibilityLabel="Add module"
        >
          <Icon name="plus" size={11} color={BLUE} />
          <Text style={styles.addModuleText}>Add Module</Text>
        </Pressable>
      </View>
      {b.modules.map((m, mi) => {
        const isOpen = b.open.has(m.id);
        return (
          <View key={m.id} style={[styles.module, mi > 0 && styles.moduleLine]}>
            <Pressable
              style={styles.moduleHead}
              onPress={() => b.toggleModule(m.id)}
              accessibilityRole="button"
              accessibilityState={{ expanded: isOpen }}
              accessibilityLabel={`Module ${mi + 1}: ${m.title}, ${m.lessons.length} lessons`}
            >
              <Icon
                name={isOpen ? "chevronDown" : "chevronRight"}
                size={14}
                color={INK}
              />
              <View style={styles.flex}>
                <Text
                  style={styles.moduleTitle}
                >{`Module ${mi + 1}: ${m.title}`}</Text>
                <Text
                  style={styles.moduleSub}
                >{`${m.lessons.length} lessons`}</Text>
              </View>
              <Icon name="chevronDown" size={14} color={BODY} />
            </Pressable>
            {isOpen ? (
              <View>
                {m.lessons.map((l, li) => {
                  const on = l.id === b.current?.lesson.id;
                  return (
                    <View
                      key={l.id}
                      style={[styles.lesson, on && styles.lessonOn]}
                    >
                      <Icon name="grid" size={11} color={MUTED} />
                      <Pressable
                        style={styles.lessonMain}
                        onPress={() => b.select(l.id)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: on }}
                        accessibilityLabel={`Edit lesson ${mi + 1}.${li + 1}: ${l.title}`}
                      >
                        {l.kind === "quiz" ? (
                          <View style={styles.quizIcon}>
                            <Text style={styles.quizMark}>?</Text>
                          </View>
                        ) : (
                          <Icon name="play" size={13} color={BLUE} />
                        )}
                        <Text
                          style={styles.lessonNum}
                        >{`${mi + 1}.${li + 1}`}</Text>
                        <Text style={styles.lessonTitle} numberOfLines={1}>
                          {l.title}
                        </Text>
                      </Pressable>
                      <PopMenu
                        label={`Actions for ${l.title}`}
                        width={160}
                        items={[
                          {
                            label: "Move up",
                            icon: "arrowRight",
                            turn: -90,
                            onPress: () => b.moveLesson(l.id, -1),
                            disabled: li === 0,
                          },
                          {
                            label: "Move down",
                            icon: "arrowRight",
                            turn: 90,
                            onPress: () => b.moveLesson(l.id, 1),
                            disabled: li === m.lessons.length - 1,
                          },
                          {
                            label: "Edit",
                            icon: "edit",
                            onPress: () => b.select(l.id),
                          },
                        ]}
                      />
                    </View>
                  );
                })}
                <TButton
                  label="Add Lesson"
                  icon="plus"
                  variant="outline"
                  onPress={() => b.addLesson(m.id)}
                  style={styles.addLesson}
                />
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    zIndex: 10,
  },
  thumb: { width: 72, height: 74, borderRadius: 6 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  title: { fontSize: 24, fontWeight: "800", color: INK, letterSpacing: -0.5 },
  desc: { marginTop: 4, fontSize: 11.5, color: BODY, letterSpacing: -0.15 },
  center: { alignSelf: "center" },
  meta: { flexDirection: "row", alignItems: "center", gap: 18, marginTop: 14 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { flexShrink: 0, fontSize: 10.5, color: MUTED },
  actions: { flexDirection: "row", alignItems: "center", gap: 8 },
  moreBtn: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: "#FFFFFF",
  },
  headerP: { flexDirection: "row", alignItems: "center", gap: 10 },
  thumbP: { width: 52, height: 50, borderRadius: 6 },
  titleP: { fontSize: 16, fontWeight: "800", color: INK },
  metaP: { marginTop: 4, fontSize: 11, color: MUTED },
  structHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  structTitle: { fontSize: 15.5, fontWeight: "700", color: INK },
  addModule: {
    height: 25,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: LINE,
  },
  addModuleText: { fontSize: 10.5, fontWeight: "600", color: BLUE },
  module: { paddingVertical: 6 },
  moduleLine: { borderTopWidth: 1, borderColor: "#EEF2F8" },
  moduleHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 2,
  },
  moduleTitle: {
    fontSize: 11.5,
    fontWeight: "700",
    color: INK,
    letterSpacing: -0.2,
  },
  moduleSub: { marginTop: 2, fontSize: 10.5, color: MUTED },
  lesson: {
    height: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  lessonOn: { backgroundColor: "#EAF1FD" },
  lessonMain: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  quizIcon: {
    width: 13,
    height: 13,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 3,
    backgroundColor: "#F5A300",
  },
  quizMark: { fontSize: 9, fontWeight: "800", color: "#FFFFFF" },
  lessonNum: { width: 20, fontSize: 10.5, color: BODY },
  lessonTitle: { flex: 1, fontSize: 10.5, color: INK, letterSpacing: -0.1 },
  addLesson: {
    marginTop: 16,
    marginBottom: 14,
    marginHorizontal: 6,
    height: 34,
  },
});
