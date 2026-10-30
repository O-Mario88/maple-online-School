import { router } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, Row } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Me } from '@/lib/api/client';
import { AttendanceSection } from '@/features/learner/AttendanceSection';
import { ParentResultsSection } from '@/features/parent/ParentResultsSection';
import { ReportsSection } from '@/features/shared/ReportsSection';
import { TodaySection } from '@/features/shared/TodaySection';
import { ClassesSection } from '@/features/teacher/ClassesSection';
import { StudentWorkSection } from '@/features/student/StudentWorkSection';
import { TeacherWorkSection } from '@/features/teacher/TeacherWorkSection';
import { useAuth, useMe } from '@/lib/auth/auth-context';
import { homeFor, isStaff } from '@/lib/roles';

type Theme = ReturnType<typeof useTheme>;
type Styles = ReturnType<typeof makeStyles>;

export default function HomeScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { signOut } = useAuth();
  const me = useMe();

  if (me.isPending) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <ActivityIndicator color={theme.accent} accessibilityLabel="Loading your account" />
      </SafeAreaView>
    );
  }

  if (me.isError) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <Text style={styles.body} accessibilityRole="alert">
          {me.error.message}
        </Text>
        <Pressable style={styles.secondaryButton} onPress={() => me.refetch()} accessibilityRole="button">
          <Text style={styles.secondaryButtonText}>Try again</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const user = me.data;
  const home = homeFor(user.role);
  const firstName = user.full_name.split(' ')[0] || user.full_name;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.greeting}>Hello, {firstName}</Text>
        <Text style={styles.title} accessibilityRole="header">
          {home.title}
        </Text>
        <Text style={styles.subtitle}>{home.subtitle}</Text>

        <RoleWork user={user} />
        <Card title="Lessons">
          <Row
            title="Upcoming lessons"
            detail="What's planned for your classes"
            onPress={() => router.push('/lessons')}
            accessibilityHint="Opens the lesson plan"
          />
        </Card>
        <Card title="Fees">
          <Row
            title="School fees"
            detail="Invoices, balances and paying by mobile money"
            onPress={() => router.push('/fees')}
            accessibilityHint="Opens school fees"
          />
        </Card>
        <Card title="Library">
          <Row
            title="Notes, guides and links"
            detail="Your class resources and your schools' libraries"
            onPress={() => router.push('/library')}
            accessibilityHint="Opens the resource library"
          />
        </Card>
        <SchoolsCard user={user} styles={styles} />
        {user.role === 'parent' ? <ChildrenCard user={user} styles={styles} /> : null}

        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          onPress={signOut}
          accessibilityRole="button"
          accessibilityLabel="Sign out">
          <Text style={styles.secondaryButtonText}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

/** The main work area for the person's role. */
function RoleWork({ user }: { user: Me }) {
  if (isStaff(user.memberships)) {
    return (
      <>
        <TodaySection />
        <ClassesSection />
        <TeacherWorkSection />
        <ReportsSection staff />
      </>
    );
  }
  if (user.role === 'student') {
    return (
      <>
        <TodaySection />
        <StudentWorkSection />
        <AttendanceSection />
        <ReportsSection staff={false} />
      </>
    );
  }
  if (user.role === 'parent') {
    return (
      <>
        <TodaySection />
        <ParentResultsSection />
        <AttendanceSection />
        <ReportsSection staff={false} />
      </>
    );
  }
  return null;
}

interface CardProps {
  user: Me;
  styles: Styles;
}

function SchoolsCard({ user, styles }: CardProps) {
  return (
    <View style={styles.card} accessible accessibilityLabel="Your schools">
      <Text style={styles.cardTitle}>Your schools</Text>
      {user.memberships.length === 0 ? (
        <Text style={styles.body}>You haven’t joined a school yet.</Text>
      ) : (
        user.memberships.map((m) => (
          <View key={`${m.institution_id}-${m.role}`} style={styles.row}>
            <Text style={styles.body}>{m.institution_name}</Text>
            <Text style={styles.meta}>
              {humanize(m.role)}
              {m.status === 'active' ? '' : ` · ${m.status}`}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

function ChildrenCard({ user, styles }: CardProps) {
  return (
    <View style={styles.card} accessible accessibilityLabel="Your children">
      <Text style={styles.cardTitle}>Your children</Text>
      {user.children.length === 0 ? (
        <Text style={styles.body}>
          No children are linked yet. Your school confirms each link before you can see a child’s records.
        </Text>
      ) : (
        user.children.map((c) => (
          <View key={c.user_id} style={styles.row}>
            <Text style={styles.body}>{c.full_name}</Text>
            <Text style={styles.meta}>{humanize(c.relationship)}</Text>
          </View>
        ))
      )}
    </View>
  );
}

function humanize(value: string): string {
  const words = value.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    center: { alignItems: 'center', justifyContent: 'center', gap: Spacing.three, padding: Spacing.four },
    container: { padding: Spacing.four, gap: Spacing.three, maxWidth: 640, width: '100%', alignSelf: 'center' },
    greeting: { fontSize: 17, color: t.textSecondary },
    title: { fontSize: 32, fontWeight: '700', color: t.text, letterSpacing: -0.5 },
    subtitle: { fontSize: 17, color: t.textSecondary, marginBottom: Spacing.two },
    card: {
      backgroundColor: t.backgroundElement,
      borderColor: t.border,
      borderWidth: 1,
      borderRadius: 16,
      padding: Spacing.three,
      gap: Spacing.two,
    },
    cardTitle: { fontSize: 15, fontWeight: '600', color: t.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two, minHeight: 32 },
    body: { fontSize: 17, color: t.text, flexShrink: 1 },
    meta: { fontSize: 15, color: t.textSecondary },
    secondaryButton: {
      minHeight: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: t.border,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.four,
      marginTop: Spacing.two,
    },
    secondaryButtonText: { fontSize: 17, fontWeight: '600', color: t.text },
    pressed: { opacity: 0.6 },
  });
}
