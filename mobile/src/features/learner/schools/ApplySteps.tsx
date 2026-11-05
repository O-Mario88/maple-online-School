import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { L } from '@/features/learner/frame/LightFrame';

import type { StepKey } from './applicationForm';
import { Check, DateField, dayLabel, Field, PhoneField, Row, SectionHead, Select } from './ApplyParts';
import { LAVENDER, PURPLE, ugx } from './SchoolParts';
import type { Apply } from './useApply';

const STAYS = ['Day', 'Boarding', 'Day & Boarding'] as const;

function Divider() {
  return <View style={s.divider} />;
}

/** Step 1: the learner, their parent or guardian, and their current school. */
export function ApplicantStep({ a, phone }: { a: Apply; phone: boolean }) {
  const f = a.form;
  const e = a.errors;
  return (
    <View style={s.card}>
      <SectionHead
        icon="person"
        title="Applicant Details"
        sub="Tell us about the learner."
        right={
          phone ? null : (
            <View style={s.applyingFor}>
              <Text style={s.applyingLabel}>Applying for</Text>
              <Select bare label="Applying for" value={f.applyingFor} options={a.net.apply.programs} onChange={(v) => a.set({ applyingFor: v })} />
            </View>
          )
        }
      />
      {phone ? <Select label="Applying for" required value={f.applyingFor} options={a.net.apply.programs} onChange={(v) => a.set({ applyingFor: v })} /> : null}
      <Row phone={phone}>
        <Field label="First Name" required value={f.first} onChange={(v) => a.set({ first: v })} error={e.first} />
        <Field label="Middle Name" value={f.middle} onChange={(v) => a.set({ middle: v })} />
        <Field label="Last Name" required value={f.last} onChange={(v) => a.set({ last: v })} error={e.last} />
      </Row>
      <Row phone={phone}>
        <DateField label="Date of Birth" required value={f.dob} onChange={(v) => a.set({ dob: v })} years={a.birthYears} error={e.dob} />
        <Select label="Gender" required value={f.gender} options={a.net.apply.genders} onChange={(v) => a.set({ gender: v })} error={e.gender} />
        <Select label="Nationality" required value={f.nationality} options={a.net.apply.nationalities} onChange={(v) => a.set({ nationality: v })} error={e.nationality} />
      </Row>
      <Divider />
      <SectionHead icon="people" title="Parent / Guardian Information" sub="Provide details of the parent or legal guardian." />
      <Row phone={phone}>
        <Field label="Full Name" required value={f.guardian.name} onChange={(v) => a.setGuardian({ name: v })} error={e['guardian.name']} />
        <Select label="Relationship" required value={f.guardian.relationship} options={a.net.apply.relationships} onChange={(v) => a.setGuardian({ relationship: v })} error={e['guardian.relationship']} />
        <PhoneField label="Phone Number" required value={f.guardian.phone} onChange={(v) => a.setGuardian({ phone: v })} error={e['guardian.phone']} />
      </Row>
      <Row phone={phone}>
        <Field label="Email Address" value={f.guardian.email} onChange={(v) => a.setGuardian({ email: v })} keyboardType="email-address" error={e['guardian.email']} />
        <Field label="Occupation" value={f.guardian.occupation} onChange={(v) => a.setGuardian({ occupation: v })} />
        <Field label="Residential Address" required icon="pin" value={f.guardian.address} onChange={(v) => a.setGuardian({ address: v })} error={e['guardian.address']} />
      </Row>
      <Divider />
      <SectionHead icon="home" title="Current School" note="(if any)" sub="Tell us about the school the learner currently attends." />
      <Row phone={phone}>
        <Field label="School Name" flex={phone ? 1 : 2.3} value={f.current.school} onChange={(v) => a.setCurrent({ school: v })} />
        <Select label="Class / Grade" value={f.current.grade} options={a.net.apply.grades} onChange={(v) => a.setCurrent({ grade: v })} />
        <Select label="Year" value={f.current.year} options={a.net.apply.years} onChange={(v) => a.setCurrent({ year: v })} />
      </Row>
    </View>
  );
}

function Chips({ options, isOn, onPress }: { options: readonly string[]; isOn: (v: string) => boolean; onPress: (v: string) => void }) {
  return (
    <View style={s.chips}>
      {options.map((o) => (
        <Pressable key={o} style={[s.chip, isOn(o) && s.chipOn]} onPress={() => onPress(o)} accessibilityRole="checkbox" accessibilityState={{ checked: isOn(o) }}>
          <Text style={[s.chipText, isOn(o) && s.chipTextOn]}>{o}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/** Step 2: stream, subjects, PLE results, day or boarding, and any support the learner needs. */
export function AcademicStep({ a, phone }: { a: Apply; phone: boolean }) {
  const ac = a.form.academic;
  const e = a.errors;
  return (
    <View style={s.card}>
      <SectionHead icon="cap" title="Academic Information" sub="The learner’s results and what they want to study." />
      <Row phone={phone}>
        <Select label="Preferred Stream" required value={ac.stream} options={a.net.apply.streams} onChange={(v) => a.setAcademic({ stream: v })} error={e.stream} />
        <Field label="PLE Aggregate" required keyboardType="number-pad" placeholder="e.g. 8" value={ac.pleAggregate} onChange={(v) => a.setAcademic({ pleAggregate: v })} error={e.pleAggregate} />
        <Field label="PLE Index Number" required placeholder="e.g. 012345/089" value={ac.pleIndex} onChange={(v) => a.setAcademic({ pleIndex: v })} error={e.pleIndex} />
        <Select label="PLE Year" required value={ac.pleYear} options={a.net.apply.years} onChange={(v) => a.setAcademic({ pleYear: v })} error={e.pleYear} />
      </Row>
      <View style={s.group}>
        <Text style={s.groupTitle}>Subjects of interest</Text>
        <Chips options={a.net.apply.subjects} isOn={(v) => ac.subjects.includes(v)} onPress={a.toggleSubject} />
      </View>
      <View style={s.group}>
        <Text style={s.groupTitle}>Day or boarding</Text>
        <Chips options={STAYS} isOn={(v) => ac.boarding === v} onPress={(v) => a.setAcademic({ boarding: ac.boarding === v ? '' : (v as (typeof STAYS)[number]) })} />
      </View>
      <View style={s.group}>
        <Text style={s.groupTitle}>Learning support (optional)</Text>
        <TextInput style={s.area} multiline value={ac.needs} onChangeText={(v) => a.setAcademic({ needs: v })} placeholder="Anything the school should know to support the learner" placeholderTextColor={L.muted} accessibilityLabel="Learning support" />
      </View>
    </View>
  );
}

/** Step 3: attach each required document. */
export function DocumentsStep({ a }: { a: Apply }) {
  return (
    <View style={s.card}>
      <SectionHead icon="doc" title="Documents" sub="Attach clear copies. Only this school will see them." />
      {a.net.apply.documents.map((d) => {
        const file = a.form.documents[d.id];
        const error = a.errors[d.id];
        return (
          <View key={d.id} style={[s.doc, !!error && s.docError]}>
            <View style={[s.docIcon, file && s.docIconOn]}>
              <Icon name={file ? 'tick' : 'doc'} size={18} color={file ? L.green : PURPLE} />
            </View>
            <View style={s.flex}>
              <Text style={s.docTitle}>{d.label}</Text>
              <Text style={[s.small, !!error && s.errorText]}>{file ?? error ?? 'Not attached yet'}</Text>
            </View>
            <Pressable style={file ? s.remove : s.attach} onPress={() => (file ? a.detach(d.id) : a.attach(d.id))} accessibilityRole="button" accessibilityLabel={`${file ? 'Remove' : 'Attach'} ${d.label}`}>
              <Icon name={file ? 'trash' : 'upload'} size={15} color={file ? L.body : L.white} />
              <Text style={file ? s.removeText : s.attachText}>{file ? 'Remove' : 'Attach'}</Text>
            </Pressable>
          </View>
        );
      })}
      <Text style={s.small}>In this preview, Attach adds a sample file.</Text>
    </View>
  );
}

function Summary({ title, step, rows, onEdit }: { title: string; step: StepKey; rows: readonly [string, string][]; onEdit: (k: StepKey) => void }) {
  return (
    <View style={s.summary}>
      <View style={s.summaryHead}>
        <Text style={s.groupTitle}>{title}</Text>
        <Pressable onPress={() => onEdit(step)} accessibilityRole="button" accessibilityLabel={`Edit ${title}`}>
          <Text style={s.edit}>Edit</Text>
        </Pressable>
      </View>
      {rows.map(([k, v]) => (
        <View key={k} style={s.summaryRow}>
          <Text style={s.summaryKey}>{k}</Text>
          <Text style={s.summaryValue}>{v || '—'}</Text>
        </View>
      ))}
    </View>
  );
}

/** Step 4: check everything, see exactly what the school receives, agree and submit. */
export function ReviewStep({ a }: { a: Apply }) {
  const f = a.form;
  const docs = a.net.apply.documents;
  const name = [f.first, f.middle, f.last].filter(Boolean).join(' ');
  return (
    <View style={s.card}>
      <SectionHead icon="check" title="Review & Submit" sub={`Check the application before it goes to ${a.school.name}.`} />
      <Summary title="Applicant" step="applicant" onEdit={a.goTo} rows={[['Applying for', f.applyingFor], ['Name', name], ['Date of birth', dayLabel(f.dob)], ['Gender', f.gender], ['Nationality', f.nationality]]} />
      <Summary title="Parent / guardian" step="applicant" onEdit={a.goTo} rows={[['Name', `${f.guardian.name} (${f.guardian.relationship})`], ['Phone', `+256 ${f.guardian.phone}`], ['Email', f.guardian.email], ['Address', f.guardian.address]]} />
      <Summary title="Academic" step="academic" onEdit={a.goTo} rows={[['Current school', [f.current.school, f.current.grade, f.current.year].filter(Boolean).join(', ')], ['Stream', f.academic.stream], ['PLE', `Aggregate ${f.academic.pleAggregate} · ${f.academic.pleIndex} · ${f.academic.pleYear}`], ['Subjects', f.academic.subjects.join(', ')], ['Day or boarding', f.academic.boarding]]} />
      <Summary title="Documents" step="documents" onEdit={a.goTo} rows={docs.map((d) => [d.label, f.documents[d.id] ?? 'Missing'])} />
      <View style={s.notice}>
        <Icon name="shield" size={18} color={PURPLE} />
        <Text style={s.noticeText}>{`When you submit, ${a.school.name} receives only this application and its documents. Nothing else from your Maple account is shared, and your browsing, likes and saves stay private. The school decides on admission; Maple never promises a place.`}</Text>
      </View>
      <View style={s.notice}>
        <Icon name="wallet" size={18} color={PURPLE} />
        <Text style={s.noticeText}>{`Application fee: ${ugx(a.net.apply.feeUGX)}, non-refundable, paid when you submit. In this preview no payment is taken.`}</Text>
      </View>
      <Check checked={f.consent} onPress={() => a.set({ consent: !f.consent })} label={`I confirm these details are true, and I agree to share this application with ${a.school.name} only.`} error={a.errors.consent} />
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  card: { gap: 18, padding: 22, borderRadius: 16, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  divider: { height: 1, backgroundColor: L.line },
  applyingFor: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  applyingLabel: { fontSize: 15, color: L.ink },
  group: { gap: 8 },
  groupTitle: { fontSize: 14.5, fontWeight: '600', color: L.navy },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: '#D5DCE7', backgroundColor: L.white },
  chipOn: { borderColor: PURPLE, backgroundColor: LAVENDER },
  chipText: { fontSize: 13.5, color: L.ink },
  chipTextOn: { fontWeight: '600', color: PURPLE },
  area: { minHeight: 80, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#D5DCE7', fontSize: 14.5, color: L.ink, textAlignVertical: 'top' },
  doc: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: L.line },
  docError: { borderColor: '#F3B4B4', backgroundColor: '#FFF7F7' },
  docIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: LAVENDER },
  docIconOn: { backgroundColor: '#DDF4E4' },
  docTitle: { fontSize: 14.5, fontWeight: '600', color: L.navy },
  small: { fontSize: 13, lineHeight: 18, color: L.body },
  errorText: { color: '#DC2626' },
  attach: { height: 34, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, borderRadius: 8, backgroundColor: L.blue },
  attachText: { fontSize: 13, fontWeight: '600', color: L.white },
  remove: { height: 34, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#F1F4F9' },
  removeText: { fontSize: 13, fontWeight: '600', color: L.body },
  summary: { gap: 6, padding: 14, borderRadius: 12, backgroundColor: '#F7F9FD' },
  summaryHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  edit: { fontSize: 13.5, fontWeight: '600', color: L.blue },
  summaryRow: { flexDirection: 'row', gap: 12 },
  summaryKey: { width: 170, fontSize: 13.5, color: L.body },
  summaryValue: { flex: 1, fontSize: 13.5, color: L.ink },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14, borderRadius: 12, backgroundColor: '#F4F1FE' },
  noticeText: { flex: 1, fontSize: 13.5, lineHeight: 19, color: L.ink },
});
