import { Image } from '@/components/picture';
import { Fragment, type ReactNode, useState } from 'react';
import { Pressable, type StyleProp, StyleSheet, Text, TextInput, View, type ViewStyle } from 'react-native';

import { Icon } from '@/components/icon';
import { Btn, Card, UnderTabs } from '@/features/portal/PortalParts';
import { BLUE, BODY, GREEN, LINE, MUTED, NAVY, RED, SELECT, SOFT, WHITE } from '@/features/portal/tokens';
import { toast } from '@/lib/toast';
import type { SchoolAdmin } from '@/mock/portal';
import { Maple } from '@/constants/maple';

type Onboarding = SchoolAdmin['onboarding'];
export type Profile = Onboarding['profile'];

const isHex = (v: string) => /^#[0-9a-f]{6}$/i.test(v);

/** A labelled text field ("School Name *"). */
export function Field({ label, required, value, onChange, optional }: { label: string; required?: boolean; optional?: boolean; value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
        {optional ? <Text style={styles.optional}> (Optional)</Text> : null}
      </Text>
      <TextInput style={styles.input} value={value} onChangeText={onChange} accessibilityLabel={label} placeholderTextColor={MUTED} />
    </View>
  );
}

/** A labelled pick-one field; tapping moves to the next option. */
export function SelectField({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (v: string) => void }) {
  const next = () => onChange(options[(options.indexOf(value) + 1) % options.length]);
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>
        {label}
        <Text style={styles.required}> *</Text>
      </Text>
      <Pressable style={[styles.input, styles.select]} onPress={next} accessibilityRole="button" accessibilityLabel={`${label}: ${value}. Tap to change`}>
        <Text style={styles.inputText} numberOfLines={1}>
          {value}
        </Text>
        <Icon name="chevronDown" size={18} color={NAVY} />
      </Pressable>
    </View>
  );
}

/** The step tracker: numbered circles joined by lines; done steps get a tick. */
export function Stepper({ steps, current, done, onPick }: { steps: Onboarding['steps']; current: number; done: readonly number[]; onPick: (i: number) => void }) {
  return (
    <Card style={styles.stepper}>
      {steps.map((s, i) => {
        const on = i === current;
        const finished = done.includes(i);
        return (
          <Fragment key={s.title}>
            {i > 0 ? <View style={styles.stepLine} /> : null}
            <Pressable
              style={styles.step}
              onPress={() => onPick(i)}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`Step ${i + 1}: ${s.title}${finished ? ', done' : ''}`}>
              <View style={[styles.stepDot, on && styles.stepDotOn, finished && !on && styles.stepDotDone]}>
                {finished && !on ? <Icon name="check" size={22} color={WHITE} /> : <Text style={[styles.stepNum, on && styles.stepNumOn]}>{i + 1}</Text>}
              </View>
              <Text style={styles.stepText}>{s.short}</Text>
            </Pressable>
          </Fragment>
        );
      })}
    </Card>
  );
}

/** A colour row: swatch and hex code. */
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.input, styles.colorRow]}>
        <View style={[styles.swatch, { backgroundColor: isHex(value) ? value : Maple.borderStrong }]} />
        <TextInput style={styles.colorInput} value={value} onChangeText={onChange} autoCapitalize="characters" accessibilityLabel={label} />
      </View>
    </View>
  );
}

function Panel({ title, children, style }: { title: string; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.panel, style]}>
      <Text style={styles.panelTitle}>{title}</Text>
      {children}
    </View>
  );
}

/** Step 1, Basic Information: the school's name, type, place, motto and website. */
export function BasicInfo({ p, set, style }: { p: Profile; set: (patch: Partial<Profile>) => void; style?: StyleProp<ViewStyle> }) {
  return (
    <Panel title="Basic Information" style={style}>
      <Field label="School Name" required value={p.name} onChange={(name) => set({ name })} />
      <SelectField label="School Type" value={p.type} options={p.types} onChange={(type) => set({ type })} />
      <View style={styles.pair}>
        <View style={styles.flex}>
          <SelectField label="Country" value={p.country} options={p.countries} onChange={(country) => set({ country })} />
        </View>
        <View style={styles.flex}>
          <Field label="City / Town" required value={p.city} onChange={(city) => set({ city })} />
        </View>
      </View>
      <Field label="Address" value={p.address} onChange={(address) => set({ address })} />
      <Field label="School Motto" optional value={p.motto} onChange={(motto) => set({ motto })} />
      <Field label="Website" optional value={p.website} onChange={(website) => set({ website })} />
    </Panel>
  );
}

/** Step 1, School Branding: logo, the two colours and the banner. */
export function Branding({ p, set, style, phone = false }: { p: Profile; set: (patch: Partial<Profile>) => void; style?: StyleProp<ViewStyle>; phone?: boolean }) {
  return (
    <Panel title="School Branding" style={style}>
      <View style={[styles.brandTop, phone && styles.brandTopPhone]}>
        <View style={styles.logoCol}>
          <Text style={styles.fieldLabel}>Logo</Text>
          <View style={[styles.logoBox, phone && styles.logoBoxPhone]}>
            <Image source={p.crest} style={styles.crest} contentFit="contain" accessibilityLabel={`${p.name} crest`} />
            <Pressable style={styles.logoBtn} onPress={() => toast('Choose a PNG or JPG up to 2 MB.')} accessibilityRole="button" accessibilityLabel="Change Logo">
              <Text style={styles.logoBtnText}>Change Logo</Text>
            </Pressable>
          </View>
          <Text style={styles.note}>PNG, JPG (Max 2MB)</Text>
        </View>
        <View style={[styles.flex, styles.colors]}>
          <ColorField label="Primary Color" value={p.primary} onChange={(primary) => set({ primary })} />
          <ColorField label="Secondary Color" value={p.secondary} onChange={(secondary) => set({ secondary })} />
        </View>
      </View>
      <Text style={styles.fieldLabel}>
        <Text style={styles.bold}>School Banner</Text>
        <Text style={styles.optional}> (Optional)</Text>
      </Text>
      <View>
        <Image source={p.banner} style={styles.banner} contentFit="cover" accessibilityLabel="School banner photo" />
        <Pressable style={styles.bannerBtn} onPress={() => toast('Choose a wide photo, about 1200 × 400.')} accessibilityRole="button" accessibilityLabel="Change Banner">
          <Icon name="camera" size={20} color={NAVY} />
          <Text style={styles.bannerBtnText}>Change Banner</Text>
        </Pressable>
      </View>
      <Text style={styles.note}>PNG, JPG (Recommended 1200 × 400)</Text>
    </Panel>
  );
}

/** Step 1, Preview: how the school will look on Maple, updated as the fields change. */
export function Preview({ p, style }: { p: Profile; style?: StyleProp<ViewStyle> }) {
  return (
    <Panel title="Preview" style={[styles.previewPanel, style]}>
      <View style={styles.previewCard}>
        <Image decorative source={p.crest} style={styles.previewCrest} contentFit="contain" />
        <Text style={[styles.previewName, isHex(p.primary) && { color: p.primary }]} numberOfLines={2}>
          {p.name || 'Your school'}
        </Text>
        {p.motto ? <Text style={styles.previewMotto}>{p.motto}</Text> : null}
        <View style={styles.previewMeta}>
          <Icon name="pin" size={18} color={BODY} />
          <Text style={styles.previewMetaText}>{`${p.city}, ${p.country}`}</Text>
          <Icon name="people" size={18} color={BODY} />
          <Text style={styles.previewMetaText}>{p.type}</Text>
        </View>
        <Image decorative source={p.banner} style={styles.previewBanner} contentFit="cover" />
      </View>
    </Panel>
  );
}

/** A numbered step heading for the step 2–4 cards. */
function StepHead({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <View style={styles.stepHead}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepBadgeText}>{n}</Text>
      </View>
      <View style={styles.flex}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepBody}>{body}</Text>
      </View>
    </View>
  );
}

/** Step 2: pick a national or international curriculum template. */
export function CurriculumCard({ o, phone = false }: { o: Onboarding; phone?: boolean }) {
  const [pick, setPick] = useState('uneb');
  return (
    <Card style={styles.stepCard}>
      <StepHead n={2} title="Step 2: Choose Curriculum Template" body="Select the national or international curriculum for your school." />
      <View style={styles.curricula}>
        {o.curricula.map((c) => {
          const on = c.key === pick;
          return (
            <Pressable
              key={c.key}
              style={[styles.curriculum, phone && styles.curriculumPhone, on && styles.curriculumOn]}
              onPress={() => setPick(c.key)}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              accessibilityLabel={`${c.name}: ${c.body.replace('\n', ' ')}`}>
              <View style={styles.curriculumHead}>
                {c.flag ? <Image decorative source={c.flag} style={styles.flag} contentFit="cover" /> : <Icon name="doc" size={24} color={BLUE} />}
                <Text style={styles.curriculumName}>{c.name}</Text>
              </View>
              <Text style={styles.curriculumBody}>{c.body}</Text>
              {on ? (
                <View style={styles.tick}>
                  <Icon name="check" size={18} color={BLUE} />
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
      <View style={styles.info}>
        <Icon name="info" size={30} color={BLUE} />
        <Text style={styles.infoText}>The template will include grade levels, subjects, and standard class structure. You can customize it later.</Text>
      </View>
    </Card>
  );
}

/** Step 3: upload the roster as a CSV, or download the template. */
export function ImportCard({ o }: { o: Onboarding }) {
  const [tab, setTab] = useState(o.importTabs[0]);
  const what = tab.replace(' (Optional)', '');
  return (
    <Card style={styles.stepCard}>
      <StepHead n={3} title="Step 3: Import Students & Teachers" body="Upload a CSV file or use our smart import to add your school roster." />
      <UnderTabs items={o.importTabs} active={tab} onChange={setTab} size={13} stretch />
      <View style={styles.drop}>
        <Icon name="upload" size={30} color={BLUE} />
        <Text style={styles.dropTitle}>Upload Your CSV File</Text>
        <Text style={styles.dropBody}>{'Drag and drop your file here, or click to browse\nSupports CSV, XLSX (Max 10MB)'}</Text>
        <Btn label="Choose File" kind="outline" onPress={() => toast(`Choose a CSV or XLSX file of ${what.toLowerCase()}, up to 10 MB.`)} height={44} style={styles.chooseBtn} />
        <Pressable style={styles.template} onPress={() => toast(`Downloading the ${what} template (CSV)…`)} accessibilityRole="button" accessibilityLabel={`Download the ${what} template`}>
          <Icon name="download" size={20} color={BLUE} />
          <Text style={styles.templateText}>Download Template</Text>
        </Pressable>
      </View>
      <View style={styles.checks}>
        {o.importChecks.map((c) => (
          <View key={c} style={styles.checkRow}>
            <Icon name="check" size={20} color={GREEN} />
            <Text style={styles.checkText}>{c}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

/** Step 4: choose a plan (starting on the one picked on the pricing page) or claim existing teacher class spaces. */
export function PlanCard({ o, initial }: { o: Onboarding; initial?: string }) {
  const [tab, setTab] = useState('Choose a Plan');
  const [plan, setPlan] = useState(o.plans.find((p) => p.key === initial)?.key ?? o.plans.find((p) => p.recommended)?.key ?? o.plans[0].key);
  return (
    <Card style={styles.stepCard}>
      <StepHead n={4} title="Step 4: Activate Subscription" body="Choose a plan or claim existing teacher class spaces." />
      <UnderTabs items={['Choose a Plan', 'Claim Existing Spaces']} active={tab} onChange={setTab} size={15} stretch />
      {tab === 'Choose a Plan' ? (
        <>
          <View style={styles.plans}>
            {o.plans.map((p) => {
              const on = p.key === plan;
              return (
                <Pressable
                  key={p.key}
                  style={[styles.plan, on && styles.planOn]}
                  onPress={() => setPlan(p.key)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on }}
                  accessibilityLabel={`${p.name}, UGX ${p.price.toLocaleString('en-US')} a term, up to ${p.learners} learners`}>
                  {p.recommended ? (
                    <View style={styles.recommended}>
                      <Text style={styles.recommendedText}>Recommended</Text>
                    </View>
                  ) : null}
                  <Text style={styles.planName}>{p.name}</Text>
                  <Text style={styles.planBody}>{p.body}</Text>
                  <Text style={styles.price}>
                    {`UGX ${p.price.toLocaleString('en-US')}`}
                    <Text style={styles.per}> /term</Text>
                  </Text>
                  {p.features.map((f) => (
                    <View key={f} style={styles.feature}>
                      <Icon name="check" size={17} color={GREEN} />
                      <Text style={styles.featureText}>{f}</Text>
                    </View>
                  ))}
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.billingText}>Billed per academic term. Nothing is charged until your school is verified and you accept the contract.</Text>
        </>
      ) : (
        <View style={styles.claim}>
          <Icon name="people" size={34} color={BLUE} />
          <Text style={styles.claimTitle}>Already teaching on Maple?</Text>
          <Text style={styles.claimBody}>Teachers who run class spaces can bring them into your school. Their classes, learners and work move across.</Text>
          <Btn label="Find teacher class spaces" icon="search" onPress={() => toast('Search by teacher name or class space code.')} height={46} />
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  bold: { fontWeight: '700', color: NAVY },
  field: { gap: 7 },
  fieldLabel: { fontSize: 15, color: NAVY },
  required: { color: RED },
  optional: { color: BODY },
  input: { height: 50, paddingVertical: 0, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE, fontSize: 15.5, color: NAVY },
  inputText: { flex: 1, fontSize: 15.5, color: NAVY },
  select: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pair: { flexDirection: 'row', gap: 16 },
  stepper: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 24 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepLine: { flex: 1, height: 2, marginHorizontal: 18, backgroundColor: Maple.blueLine, minWidth: 30 },
  stepDot: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: NAVY, backgroundColor: WHITE },
  stepDotOn: { borderColor: BLUE, backgroundColor: BLUE },
  stepDotDone: { borderColor: GREEN, backgroundColor: GREEN },
  stepNum: { fontSize: 20, fontWeight: '700', color: NAVY },
  stepNumOn: { color: WHITE },
  stepText: { fontSize: 16, fontWeight: '600', color: NAVY },
  colorRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 12 },
  swatch: { width: 30, height: 30, borderRadius: 15 },
  colorInput: { flex: 1, height: 48, paddingVertical: 0, fontSize: 15.5, color: NAVY },
  colors: { gap: 14 },
  panel: { gap: 16, padding: 20, borderRadius: 14, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  panelTitle: { fontSize: 19, fontWeight: '800', color: NAVY },
  brandTop: { flexDirection: 'row', gap: 18 },
  brandTopPhone: { flexDirection: 'column' },
  logoCol: { gap: 8 },
  logoBox: { width: 190, alignItems: 'center', paddingTop: 14, borderRadius: 12, borderWidth: 1, borderColor: LINE, overflow: 'hidden' },
  logoBoxPhone: { width: '100%' },
  crest: { width: 110, height: 110, marginBottom: 12 },
  logoBtn: { alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', height: 44, backgroundColor: SELECT, borderTopWidth: 1, borderColor: Maple.blueLine },
  logoBtnText: { fontSize: 15, fontWeight: '600', color: BLUE },
  note: { fontSize: 13.5, color: MUTED },
  banner: { width: '100%', aspectRatio: 276 / 105, borderRadius: 12 },
  bannerBtn: { position: 'absolute', right: 12, bottom: 12, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, height: 42, borderRadius: 10, backgroundColor: WHITE },
  bannerBtnText: { fontSize: 15, fontWeight: '600', color: NAVY },
  previewPanel: { backgroundColor: SOFT },
  previewCard: { alignItems: 'center', gap: 10, padding: 20, borderRadius: 12, backgroundColor: WHITE },
  previewCrest: { width: 130, height: 130 },
  previewName: { fontSize: 25, fontWeight: '800', color: NAVY, textAlign: 'center' },
  previewMotto: { fontSize: 16.5, color: BODY, textAlign: 'center' },
  previewMeta: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 8, marginVertical: 6 },
  previewMetaText: { fontSize: 15, color: BODY, marginRight: 10 },
  previewBanner: { width: '100%', aspectRatio: 276 / 105, borderRadius: 10, marginTop: 4 },
  stepCard: { gap: 18 },
  stepHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  stepBadge: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: BLUE },
  stepBadgeText: { fontSize: 19, fontWeight: '700', color: WHITE },
  stepTitle: { fontSize: 20, fontWeight: '800', color: NAVY, letterSpacing: -0.2 },
  stepBody: { marginTop: 4, fontSize: 14.5, lineHeight: 20, color: BODY },
  curricula: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  curriculum: { flexBasis: '30%', flexGrow: 1, minWidth: 0, gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  curriculumPhone: { flexBasis: '45%' },
  curriculumOn: { borderColor: BLUE, borderWidth: 1.5, backgroundColor: Maple.blueSoft },
  curriculumHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  curriculumName: { flex: 1, minWidth: 0, paddingRight: 16, fontSize: 15, fontWeight: '700', color: NAVY },
  curriculumBody: { fontSize: 12.5, lineHeight: 18, color: BODY },
  flag: { width: 26, height: 22, borderRadius: 4 },
  tick: { position: 'absolute', top: 6, right: 6 },
  info: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 18, borderRadius: 12, backgroundColor: SELECT },
  infoText: { flex: 1, fontSize: 14, lineHeight: 20, color: BODY },
  drop: { alignItems: 'center', gap: 8, padding: 20, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', borderColor: Maple.blueLine, backgroundColor: Maple.blueSoft },
  dropTitle: { fontSize: 16, fontWeight: '700', color: NAVY },
  dropBody: { fontSize: 14, lineHeight: 20, color: BODY, textAlign: 'center' },
  chooseBtn: { paddingHorizontal: 30, marginTop: 4 },
  template: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  templateText: { fontSize: 15, fontWeight: '600', color: BLUE },
  checks: { gap: 8 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkText: { flex: 1, fontSize: 14, color: BODY },
  plans: { flexDirection: 'row', gap: 12 },
  plan: { flex: 1, minWidth: 0, gap: 6, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  planOn: { borderColor: Maple.success, borderWidth: 2, backgroundColor: Maple.successSoft },
  recommended: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, backgroundColor: Maple.successText },
  recommendedText: { fontSize: 12.5, fontWeight: '700', color: WHITE },
  planName: { fontSize: 15, fontWeight: '800', color: NAVY },
  planBody: { fontSize: 12, lineHeight: 16, color: BODY },
  price: { marginVertical: 4, fontSize: 15, fontWeight: '800', color: NAVY },
  per: { fontSize: 12, fontWeight: '400', color: BODY },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { flex: 1, fontSize: 12, color: NAVY },
  billing: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  billingText: { fontSize: 15, color: BODY },
  billingOn: { color: NAVY, fontWeight: '600' },
  save: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, backgroundColor: Maple.successSoft },
  saveText: { fontSize: 13.5, fontWeight: '600', color: GREEN },
  claim: { alignItems: 'center', gap: 10, padding: 24, borderRadius: 12, backgroundColor: SOFT },
  claimTitle: { fontSize: 17, fontWeight: '700', color: NAVY },
  claimBody: { fontSize: 14.5, lineHeight: 21, color: BODY, textAlign: 'center' },
});
