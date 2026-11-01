import { Pressable, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { useTeacherGo } from '@/features/teacher/frame/TeacherFrame';
import { PopMenu, TSelect } from '@/features/teacher/frame/TeacherInputs';
import { BLUE, BODY, GREEN, MUTED, Panel } from '@/features/teacher/frame/TeacherParts';
import { formatHourLabel } from '@/lib/teacher-calendar';
import { toast } from '@/lib/toast';
import type { SyncProvider, TeacherCalendar } from '@/mock/teacher-calendar';

import type { CalendarController } from './useTeacherCalendar';
import { styles } from './CalendarCards.styles';

/** Custom brand mark for Google, Outlook, and Apple Calendar rows. */
function ProviderLogo({ id }: { id: SyncProvider['id'] }) {
  if (id === 'google') {
    return (
      <View style={styles.googleLogo}>
        <View style={styles.googleRing}>
          <Text style={styles.googleG}>G</Text>
        </View>
      </View>
    );
  }
  if (id === 'outlook') {
    return (
      <View style={styles.outlookLogo}>
        <Icon name="calendar" size={13} color="#FFFFFF" />
      </View>
    );
  }
  return (
    <View style={styles.appleLogo}>
      <Text style={styles.appleGlyph}></Text>
    </View>
  );
}

/** Green or blue pill switch used in the sidebar, Availability Settings, and phone Instant Help card. */
export function PillSwitch({
  value,
  onChange,
  color = GREEN,
  label,
  large = false,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  color?: string;
  label: string;
  large?: boolean;
}) {
  return (
    <Pressable
      style={[
        styles.switchTrack,
        large && styles.switchTrackLg,
        { backgroundColor: value ? color : '#CBD5E1' },
      ]}
      onPress={() => onChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
      hitSlop={8}>
      <View style={[styles.switchKnob, large && styles.switchKnobLg, value && styles.switchKnobOn]} />
    </Pressable>
  );
}

/** Left sidebar footer card: "Available Now" toggle, Next available slot, and "Open Instant Help ->" button. */
export function SidebarAvailableCard({ c, ctl }: { c: TeacherCalendar; ctl: CalendarController }) {
  const go = useTeacherGo();
  return (
    <View style={styles.sideWrap}>
      <View style={styles.sideDivider} />
      <View style={styles.sideCard}>
        <View style={styles.sideTopRow}>
          <View style={[styles.statusDot, { backgroundColor: ctl.availableNow ? GREEN : MUTED }]} />
          <Text style={[styles.sideAvailTitle, !ctl.availableNow && { color: BODY }]}>Available Now</Text>
          <PillSwitch
            value={ctl.availableNow}
            onChange={ctl.toggleAvailableNow}
            color={GREEN}
            label="Available Now for 15-minute instant help"
          />
        </View>
        <Text style={styles.sideAvailDesc}>
          Show yourself as available for 15-minute instant help sessions.
        </Text>
        <View style={styles.nextSlotBox}>
          <Icon name="bolt" size={16} color="#F59E0B" />
          <View style={styles.flex}>
            <Text style={styles.nextSlotLabel}>Next available slot:</Text>
            <Text style={styles.nextSlotTime}>
              {ctl.availableNow ? c.nextAvailableSlot : 'Paused'}
            </Text>
          </View>
        </View>
        <Pressable
          style={styles.openInstantBtn}
          onPress={() => go('/teach/host')}
          accessibilityRole="button"
          accessibilityLabel="Open Instant Help">
          <Text style={styles.openInstantText}>Open Instant Help</Text>
          <Icon name="arrowRight" size={12} color={BLUE} />
        </Pressable>
      </View>
    </View>
  );
}

/** Bottom Card 1: External Calendar Sync (Google, Outlook, Apple). */
export function ExternalCalendarSyncCard({ ctl }: { ctl: CalendarController }) {
  return (
    <Panel style={styles.bottomCard}>
      <Text style={styles.cardTitle} accessibilityRole="header">
        External Calendar Sync
      </Text>
      <Text style={styles.cardSub}>
        Connect your Google, Outlook, or Apple calendar to avoid double bookings. Your busy times will be shown but cannot be edited here.
      </Text>
      <View style={styles.providerList}>
        {ctl.providers.map((p) => (
          <View key={p.id} style={styles.providerRow}>
            <ProviderLogo id={p.id} />
            <Text style={styles.providerName}>{p.name}</Text>
            {p.connected ? (
              <>
                <View style={styles.connectedPill}>
                  <View style={styles.connectedDot} />
                  <Text style={styles.connectedText}>Connected</Text>
                </View>
                <PopMenu
                  label={`${p.name} options`}
                  width={165}
                  items={[
                    { label: 'Sync now', icon: 'sync', onPress: () => ctl.syncProviderNow(p.name) },
                    { label: 'Disconnect', icon: 'close', danger: true, onPress: () => ctl.toggleProvider(p.id) },
                  ]}>
                  <View style={styles.moreBtn}>
                    <Text style={styles.moreDots}>⋮</Text>
                  </View>
                </PopMenu>
              </>
            ) : (
              <>
                <View style={styles.notConnectedPill}>
                  <Text style={styles.notConnectedText}>Not Connected</Text>
                </View>
                <Pressable
                  style={styles.connectBtn}
                  onPress={() => ctl.toggleProvider(p.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Connect ${p.name}`}>
                  <Text style={styles.connectBtnText}>Connect</Text>
                </Pressable>
              </>
            )}
          </View>
        ))}
      </View>
    </Panel>
  );
}

/** Bottom Card 2: Availability Settings. */
export function AvailabilitySettingsCard({ c, ctl }: { c: TeacherCalendar; ctl: CalendarController }) {
  return (
    <Panel style={[styles.bottomCard, styles.raisedCard]}>
      <Text style={styles.cardTitle} accessibilityRole="header">
        Availability Settings
      </Text>
      <View style={styles.availToggleBox}>
        <View style={styles.availToggleHead}>
          <View style={styles.greenCheckCircle}>
            <Icon name="check" size={12} color="#FFFFFF" />
          </View>
          <Text style={styles.availToggleTitle}>Available Now for 15-Min Instant Help</Text>
          <PillSwitch
            value={ctl.availableNow}
            onChange={ctl.toggleAvailableNow}
            color={BLUE}
            label="Available Now for 15-Min Instant Help"
          />
        </View>
        <Text style={styles.availToggleSub}>
          When on, learners can book a 15-minute instant help session if you are available.
        </Text>
      </View>

      <View style={[styles.selectRow, { zIndex: 25 }]}>
        <View style={styles.flex}>
          <TSelect
            label="Instant Help Duration"
            value={ctl.duration}
            options={c.availability.durations}
            onChange={ctl.setDuration}
          />
        </View>
        <View style={styles.flex}>
          <TSelect
            label="Daily Availability"
            value={ctl.daily}
            options={c.availability.dailyOptions}
            onChange={ctl.setDaily}
          />
        </View>
      </View>

      <View style={{ zIndex: 15 }}>
        <TSelect
          label="Buffer Time Between Sessions"
          value={ctl.buffer}
          options={c.availability.buffers}
          onChange={ctl.setBuffer}
        />
      </View>

      <Pressable
        style={styles.advLinkRow}
        onPress={() => toast('Advanced availability rules: Mon–Sat 8:00 AM – 8:00 PM EAT, Sunday Personal Time.')}
        accessibilityRole="link"
        accessibilityLabel="Advanced Availability Settings">
        <Text style={styles.advLinkText}>Advanced Availability Settings</Text>
        <Icon name="arrowRight" size={12} color={BLUE} />
      </Pressable>
    </Panel>
  );
}

/** Bottom Card 3: Upcoming (Next 7 Days). */
export function UpcomingEventsCard({ c }: { c: TeacherCalendar }) {
  const go = useTeacherGo();
  const catColors: Record<string, { bg: string; fg: string }> = {
    school: { bg: '#DCEAFE', fg: '#1D63ED' },
    tutoring: { bg: '#FEF0C7', fg: '#D97706' },
    external: { bg: '#E2E8F0', fg: '#475569' },
    instant: { bg: '#DCFCE7', fg: '#1F9D55' },
  };
  return (
    <Panel style={styles.bottomCard}>
      <View style={styles.upcomingHead}>
        <Text style={styles.cardTitle} accessibilityRole="header">
          Upcoming (Next 7 Days)
        </Text>
        <Pressable
          onPress={() => toast('Showing all upcoming sessions for the next 7 days.')}
          accessibilityRole="link"
          accessibilityLabel="See All Upcoming">
          <Text style={styles.seeAllLink}>See All</Text>
        </Pressable>
      </View>
      <View style={styles.upcomingList}>
        {c.upcoming.map((u, idx) => {
          const palette = catColors[u.category] ?? catColors.school;
          return (
            <Pressable
              key={u.id}
              style={[styles.upcomingRow, idx > 0 && styles.upcomingBorder]}
              onPress={() => go(u.go)}
              accessibilityRole="button"
              accessibilityLabel={`${u.title}, ${u.when}`}>
              <View style={[styles.upcomingIcon, { backgroundColor: palette.bg }]}>
                <Icon name={u.icon} size={13} color={palette.fg} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.upcomingTitle} numberOfLines={1}>
                  {u.title}
                </Text>
                <Text style={styles.upcomingWhen} numberOfLines={1}>
                  {u.when}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </Panel>
  );
}

/** Phone bottom green card: "Available Now for Instant Help" + toggle + "Open Instant Help" button. */
export function PhoneInstantHelpCard({ ctl }: { ctl: CalendarController }) {
  const go = useTeacherGo();
  return (
    <View style={styles.phoneInstantCard}>
      <View style={styles.phoneInstantTop}>
        <Icon name="bolt" size={20} color="#16A34A" />
        <View style={styles.flex}>
          <Text style={styles.phoneInstantTitle}>Available Now for Instant Help</Text>
          <Text style={styles.phoneInstantSub}>Available for 15-minute sessions</Text>
        </View>
        <PillSwitch
          value={ctl.availableNow}
          onChange={ctl.toggleAvailableNow}
          color={GREEN}
          label="Available Now for Instant Help"
          large
        />
      </View>
      <Pressable
        style={styles.phoneOpenInstantBtn}
        onPress={() => go('/teach/host')}
        accessibilityRole="button"
        accessibilityLabel="Open Instant Help">
        <Text style={styles.phoneOpenInstantText}>Open Instant Help</Text>
      </Pressable>
    </View>
  );
}

/** Interactive Add Event panel with Zero-Collision clash check and suggested free slots. */
export function AddEventPanel({ c, ctl }: { c: TeacherCalendar; ctl: CalendarController }) {
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
  return (
    <Panel style={styles.addPanel}>
      <View style={styles.addHead}>
        <View>
          <Text style={styles.addTitle}>Schedule New Event (Zero-Collision Check)</Text>
          <Text style={styles.addSub}>
            Automatically checks school classes, private tutoring, and synced Google/Outlook/Apple busy blocks.
          </Text>
        </View>
        <Pressable
          onPress={() => ctl.setAdding(false)}
          accessibilityRole="button"
          accessibilityLabel="Close Add Event"
          hitSlop={8}>
          <Icon name="close" size={16} color={BODY} />
        </Pressable>
      </View>

      <View style={styles.addFormRow}>
        <View style={styles.flex}>
          <Text style={styles.fieldLabel}>Event Title</Text>
          <TextInput
            style={styles.textInput}
            value={ctl.newTitle}
            onChangeText={ctl.setNewTitle}
            placeholder="e.g. O-Level Maths Revision"
            accessibilityLabel="Event Title"
          />
        </View>
        <View>
          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.pillRow}>
            {c.categories.slice(0, 4).map((cat) => {
              const on = ctl.newCategory === cat.key;
              return (
                <Pressable
                  key={cat.key}
                  style={[styles.choicePill, on && { backgroundColor: cat.cardBg, borderColor: cat.border }]}
                  onPress={() => ctl.setNewCategory(cat.key)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}>
                  <Text style={[styles.choiceText, on && { color: cat.titleColor, fontWeight: '700' }]}>
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.addFormRow}>
        <View>
          <Text style={styles.fieldLabel}>Day</Text>
          <View style={styles.pillRow}>
            {c.days.slice(0, 6).map((d) => {
              const on = ctl.newDay === d.index;
              return (
                <Pressable
                  key={d.index}
                  style={[styles.choicePill, on && styles.choicePillBlue]}
                  onPress={() => ctl.setNewDay(d.index)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}>
                  <Text style={[styles.choiceText, on && styles.choiceTextBlue]}>{`${d.short} ${d.num}`}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View style={styles.flex}>
          <Text style={styles.fieldLabel}>Start Time (1 hr)</Text>
          <View style={styles.pillRow}>
            {hours.map((h) => {
              const on = ctl.newStart === h;
              return (
                <Pressable
                  key={h}
                  style={[styles.choicePill, on && styles.choicePillBlue]}
                  onPress={() => ctl.setNewStart(h)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}>
                  <Text style={[styles.choiceText, on && styles.choiceTextBlue]}>{formatHourLabel(h)}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {ctl.collision ? (
        <View style={styles.clashBanner}>
          <Icon name="alert" size={16} color="#B45309" />
          <View style={styles.flex}>
            <Text style={styles.clashTitle}>
              {`Collision detected: ${ctl.collision.title} (${ctl.collision.timeLabel})`}
            </Text>
            <Text style={styles.clashBody}>Pick one of these clash-free slots to schedule immediately:</Text>
            <View style={styles.freeSlotsRow}>
              {ctl.freeSlots.map((slot) => (
                <Pressable
                  key={slot.label}
                  style={styles.freeSlotBtn}
                  onPress={() => ctl.addEventAt(slot.day, slot.start)}
                  accessibilityRole="button"
                  accessibilityLabel={`Schedule at ${slot.label}`}>
                  <Icon name="check" size={12} color="#166534" />
                  <Text style={styles.freeSlotText}>{slot.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.clearBanner}>
          <Icon name="check" size={15} color="#166534" />
          <Text style={styles.clearText}>
            {`No collision on ${c.days[ctl.newDay]?.short} ${c.days[ctl.newDay]?.label} at ${formatHourLabel(ctl.newStart)}.`}
          </Text>
          <Pressable
            style={styles.confirmAddBtn}
            onPress={() => ctl.addEventAt(ctl.newDay, ctl.newStart)}
            accessibilityRole="button"
            accessibilityLabel="Confirm Add Event">
            <Text style={styles.confirmAddText}>Add to Calendar</Text>
          </Pressable>
        </View>
      )}
    </Panel>
  );
}

/** Optional drawer/banner when the teacher selects Meeting Links or Recurring Schedule from the sidebar. */
export function SidebarSectionBanner({ c, ctl }: { c: TeacherCalendar; ctl: CalendarController }) {
  if (ctl.section === 'My Calendar' || ctl.section === 'Availability' || ctl.section === 'External Sync') {
    return null;
  }
  return (
    <Panel style={styles.addPanel}>
      <View style={styles.addHead}>
        <Text style={styles.addTitle}>{ctl.section}</Text>
        <Pressable
          onPress={() => ctl.setSection('My Calendar')}
          accessibilityRole="button"
          accessibilityLabel="Back to My Calendar">
          <Text style={styles.seeAllLink}>Back to My Calendar</Text>
        </Pressable>
      </View>
      {ctl.section === 'Meeting Links' ? (
        <View style={styles.sectionItems}>
          {c.meetingLinks.map((m) => (
            <View key={m.id} style={styles.providerRow}>
              <Icon name="video" size={15} color={BLUE} />
              <View style={styles.flex}>
                <Text style={styles.providerName}>{m.label}</Text>
                <Text style={styles.upcomingWhen}>{m.url}</Text>
              </View>
              <Pressable
                style={styles.connectBtn}
                onPress={() => toast(`Copied link: https://${m.url}`)}
                accessibilityRole="button"
                accessibilityLabel={`Copy ${m.label} link`}>
                <Text style={styles.connectBtnText}>Copy Link</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
      {ctl.section === 'Recurring Schedule' ? (
        <View style={styles.sectionItems}>
          {c.recurringRules.map((r) => (
            <View key={r.id} style={styles.providerRow}>
              <Icon name="timer" size={15} color={BLUE} />
              <View style={styles.flex}>
                <Text style={styles.providerName}>{r.title}</Text>
                <Text style={styles.upcomingWhen}>{r.schedule}</Text>
              </View>
              <View style={styles.connectedPill}>
                <View style={styles.connectedDot} />
                <Text style={styles.connectedText}>Active</Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}
      {ctl.section === 'Time Zone & Settings' ? (
        <View style={styles.sectionItems}>
          <Text style={styles.cardSub}>
            {`Current Time Zone: ${ctl.timezone} · Daily window: ${ctl.daily} · Buffer: ${ctl.buffer}`}
          </Text>
        </View>
      ) : null}
    </Panel>
  );
}
