import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { L } from '@/features/learner/frame/LightFrame';
import type { IconName } from '@/lib/icons';
import type { Career, Program, University } from '@/mock/career-compass';
import { Maple, Radii } from '@/constants/maple';

export const BRAND_BLUE = Maple.blue;
export const BRAND_SOFT = Maple.blueSoft;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const shortDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};
export const ugx = (n: number) => `UGX ${n.toLocaleString('en-US')}`;

type Tone = { fg: string; bg: string };
const GREEN: Tone = { fg: Maple.successText, bg: Maple.successSoft };
const AMBER: Tone = { fg: Maple.warningText, bg: Maple.warningSoft };
const GREY: Tone = { fg: Maple.body, bg: Maple.blueSoft };
const RED: Tone = { fg: Maple.error, bg: Maple.errorSoft };

function Pill({ text, tone, icon }: { text: string; tone: Tone; icon?: 'check' | 'alert' | 'clock' }) {
  return (
    <View style={[s.pill, { backgroundColor: tone.bg }]}>
      {icon ? <Icon name={icon} size={12} color={tone.fg} /> : null}
      <Text style={[s.pillText, { color: tone.fg }]}>{text}</Text>
    </View>
  );
}

/** A program's own accreditation check, never borrowed from its university. */
export function VerifyPill({ status, on }: { status: 'verified' | 'review-due' | 'unverified'; on: string | null }) {
  if (status === 'verified' && on) return <Pill text={`Accredited · checked ${shortDate(on)}`} tone={GREEN} icon="check" />;
  if (status === 'review-due') return <Pill text="Accreditation check due for review" tone={AMBER} icon="clock" />;
  return <Pill text="Accreditation not yet verified" tone={GREY} icon="alert" />;
}

export function InstitutionPill({ u }: { u: University }) {
  return u.verification.status === 'verified' ? (
    <Pill text="Verified institution" tone={GREEN} icon="check" />
  ) : (
    <Pill text="Verification pending" tone={AMBER} icon="clock" />
  );
}

export function FitPill({ fit }: { fit: { status: 'meets' | 'partly' | 'missing'; missing: readonly string[] } }) {
  if (fit.status === 'meets') return <Pill text="Your subjects fit" tone={GREEN} icon="check" />;
  return <Pill text={`Needs ${fit.missing.join(' and ')}`} tone={fit.status === 'partly' ? AMBER : RED} icon="alert" />;
}

export function Chips({ options, on, onPress }: { options: readonly string[]; on: readonly string[]; onPress: (v: string) => void }) {
  return (
    <View style={s.chips}>
      {options.map((o) => (
        <Pressable
          key={o}
          style={[s.chip, on.includes(o) && s.chipOn]}
          onPress={() => onPress(o)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: on.includes(o) }}>
          <Text style={[s.chipText, on.includes(o) && s.chipTextOn]}>{o}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function SaveButton({ saved, onPress, label }: { saved: boolean; onPress: () => void; label: string }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityState={{ selected: saved }}
      accessibilityLabel={saved ? `Remove ${label} from saved` : `Save ${label}`}>
      <Icon name={saved ? 'bookmarkOn' : 'bookmark'} size={18} color={saved ? BRAND_BLUE : L.ink} />
    </Pressable>
  );
}

export function CareerCard({
  c,
  reasons,
  saved,
  onSave,
  onOpen,
}: {
  c: Career;
  reasons?: readonly string[];
  saved: boolean;
  onSave: () => void;
  onOpen: () => void;
}) {
  return (
    <View style={s.card}>
      <Pressable style={s.cardInner} onPress={onOpen} accessibilityRole="button" accessibilityLabel={`${c.title}, ${c.field}`}>
        <View style={[s.row, s.saveRoom]}>
          <View style={s.iconTile}>
            <Icon name={c.icon} size={20} color={BRAND_BLUE} />
          </View>
          <View style={s.flex}>
            <Text style={s.title}>{c.title}</Text>
            <Text style={s.small}>{c.field}</Text>
          </View>
        </View>
        <Text style={s.body} numberOfLines={2}>
          {c.overview}
        </Text>
        {reasons?.map((r) => (
          <View key={r} style={s.reason}>
            <Icon name="tick" size={13} color={Maple.successText} />
            <Text style={s.reasonText}>{r}</Text>
          </View>
        ))}
      </Pressable>
      <View style={s.cardSave}>
        <SaveButton saved={saved} onPress={onSave} label={c.title} />
      </View>
    </View>
  );
}

export function ProgramRow({
  p,
  u,
  status,
  fit,
  saved,
  onSave,
  onOpen,
}: {
  p: Program;
  u?: University;
  status: 'verified' | 'review-due' | 'unverified';
  fit?: { status: 'meets' | 'partly' | 'missing'; missing: readonly string[] };
  saved: boolean;
  onSave: () => void;
  onOpen: () => void;
}) {
  return (
    <View>
      <Pressable
        style={[s.program, s.saveRoom]}
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={`${p.title}${u ? `, ${u.name}` : ''}`}>
        <View style={s.flex}>
          <Text style={s.strong}>{p.title}</Text>
          <Text style={s.small}>
            {[u?.name, `${p.award} · ${p.years} · ${p.mode}`, `Apply by ${shortDate(p.deadline)}`].filter(Boolean).join('  ·  ')}
          </Text>
          <View style={s.pills}>
            <VerifyPill status={status} on={p.accreditation.verifiedOn} />
            {fit ? <FitPill fit={fit} /> : null}
          </View>
        </View>
      </Pressable>
      <View style={s.programSave}>
        <SaveButton saved={saved} onPress={onSave} label={p.title} />
      </View>
    </View>
  );
}

export function Sheet({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.scrim}>
        <View style={[s.sheet, wide && s.sheetWide]}>
          <View style={s.sheetHead}>
            <Text style={s.sheetTitle} numberOfLines={2}>
              {title}
            </Text>
            <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel="Close">
              <Icon name="close" size={20} color={L.ink} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={s.sheetBody}>{children}</ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function Bullets({ items }: { items: readonly string[] }) {
  return (
    <View style={s.bullets}>
      {items.map((i) => (
        <View key={i} style={s.reason}>
          <View style={s.dot} />
          <Text style={s.body}>{i}</Text>
        </View>
      ))}
    </View>
  );
}

/** A white Career Compass panel with a title and an optional action on the right. */
export function Panel({ title, sub, right, children }: { title: string; sub?: string; right?: ReactNode; children: ReactNode }) {
  return (
    <View style={s.panel}>
      <View style={s.panelHead}>
        <View style={s.flex}>
          <Text style={s.panelTitle}>{title}</Text>
          {sub ? <Text style={s.small}>{sub}</Text> : null}
        </View>
        {right}
      </View>
      {children}
    </View>
  );
}

export function Btn({
  label,
  onPress,
  ghost = false,
  icon,
  small = false,
}: {
  label: string;
  onPress: () => void;
  ghost?: boolean;
  icon?: IconName;
  small?: boolean;
}) {
  return (
    <Pressable style={[s.btn, ghost ? s.btnGhost : s.btnSolid, small && s.btnSmall]} onPress={onPress} accessibilityRole="button">
      {icon ? <Icon name={icon} size={15} color={ghost ? BRAND_BLUE : L.white} /> : null}
      <Text style={[s.btnText, ghost && s.btnTextGhost, small && s.btnTextSmall]}>{label}</Text>
    </Pressable>
  );
}

export const Tag = ({ text, tone = 'grey' }: { text: string; tone?: 'grey' | 'green' | 'amber' | 'purple' }) => (
  <Pill text={text} tone={tone === 'green' ? GREEN : tone === 'amber' ? AMBER : tone === 'purple' ? { fg: BRAND_BLUE, bg: BRAND_SOFT } : GREY} />
);

export const cs = StyleSheet.create({
  small: { fontSize: 12.5, lineHeight: 17, color: L.body },
  body: { fontSize: 13.5, lineHeight: 19, color: L.ink },
  note: { fontSize: 12, lineHeight: 17, color: L.muted },
});

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  small: cs.small,
  body: cs.body,
  title: { fontSize: 15.5, fontWeight: '700', color: L.navy },
  strong: { fontSize: 14, fontWeight: '700', color: L.navy },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
  },
  pillText: { fontSize: 11.5, fontWeight: '600' },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: L.line,
    backgroundColor: L.white,
  },
  chipOn: { borderColor: BRAND_BLUE, backgroundColor: BRAND_SOFT },
  chipText: { fontSize: 13, color: L.ink },
  chipTextOn: { fontWeight: '600', color: BRAND_BLUE },
  saveRoom: { paddingRight: 30 },
  cardSave: { position: 'absolute', top: 26, right: 16 },
  programSave: { position: 'absolute', top: 12, right: 0 },
  cardInner: { gap: 8 },
  card: {
    flexGrow: 1,
    flexBasis: 260,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: L.line,
    backgroundColor: L.white,
  },
  iconTile: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: BRAND_SOFT,
  },
  reason: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reasonText: { flex: 1, fontSize: 12, fontWeight: '500', color: Maple.successText },
  program: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Maple.blueSelected,
  },
  uni: {
    flexGrow: 1,
    flexBasis: 260,
    overflow: 'hidden',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: L.line,
    backgroundColor: L.white,
  },
  scrim: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(11,26,63,0.35)',
  },
  sheet: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '90%',
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: L.white,
  },
  sheetWide: { maxWidth: 720 },
  sheetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: L.line,
  },
  sheetTitle: { flex: 1, fontSize: 19, fontWeight: '700', color: L.navy },
  sheetBody: { gap: 14, padding: 18 },
  section: { gap: 6 },
  sectionTitle: { fontSize: 14.5, fontWeight: '700', color: L.navy },
  bullets: { gap: 4 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: BRAND_BLUE },
  panel: {
    gap: 12,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: L.line,
    backgroundColor: L.white,
  },
  panelHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  panelTitle: { fontSize: 17, fontWeight: '700', color: L.navy },
  btn: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 16,
    borderRadius: Radii.control,
  },
  btnSmall: { height: 32, paddingHorizontal: 12 },
  btnSolid: { backgroundColor: L.blue },
  btnGhost: {
    borderWidth: 1.5,
    borderColor: Maple.blueLine,
    backgroundColor: L.white,
  },
  btnText: { fontSize: 14, fontWeight: '600', color: L.white },
  btnTextGhost: { color: BRAND_BLUE },
  btnTextSmall: { fontSize: 12.5 },
});
