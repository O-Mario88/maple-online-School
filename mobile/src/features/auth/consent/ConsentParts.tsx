import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Brand } from '@/features/public/palette';
import type { IconName } from '@/lib/icons';
import type { MockData } from '@/mock';

export type Consent = MockData['publicPages']['guardianConsent'];
export type Channel = 'whatsapp' | 'email' | 'phone';

export const MESSAGE_LIMIT = 200;

export const CHANNELS: readonly { key: Channel; title: string; detail: string; short: string; icon: IconName; tint: string; field: string; placeholder: string }[] = [
  { key: 'whatsapp', title: 'WhatsApp', detail: 'Fast & easy', short: 'Fast & easy', icon: 'chat', tint: '#25D366', field: 'Parent or guardian’s WhatsApp number', placeholder: '700 123 456' },
  { key: 'email', title: 'Email', detail: 'Works on any device', short: 'Any device', icon: 'mail', tint: '#1463F3', field: 'Parent or guardian’s email address', placeholder: 'parent@example.com' },
  { key: 'phone', title: 'Phone (SMS)', detail: 'Text message link', short: 'Text message', icon: 'phone', tint: '#8B3DFF', field: 'Parent or guardian’s phone number', placeholder: '700 123 456' },
];

export const CONSENT_STEPS = [
  { label: 'Your Role', short: 'Role', state: 'first' as const },
  { label: 'Country & Curriculum', short: 'Country', state: 'done' as const },
  { label: 'Grade & Subjects', short: 'Grade', state: 'done' as const },
  { label: 'Guardian Consent', short: 'Consent', state: 'current' as const },
  { label: 'Complete', short: 'Complete', state: 'todo' as const },
];

function Tick() {
  return (
    <View style={styles.tick}>
      <Icon name="check" size={13} color={Brand.surface} />
    </View>
  );
}

/** WhatsApp, Email or Phone (SMS): where the parent gets the link. */
export function ChannelPicker({ c, value, onChange, phone = false }: { c: Consent; value: Channel; onChange: (v: Channel) => void; phone?: boolean }) {
  return (
    <View style={[styles.channels, phone && styles.channelsP]}>
      {CHANNELS.map((ch) => {
        const on = ch.key === value;
        return (
          <Pressable key={ch.key} style={[styles.channel, phone && styles.channelP, on && styles.channelOn]} onPress={() => onChange(ch.key)} accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={ch.title}>
            <Image source={c.art[ch.key]} style={phone ? styles.logoP : styles.logo} />
            <Text style={[styles.chTitle, phone && styles.chTitleP]}>{ch.title}</Text>
            <Text style={[styles.chDetail, phone && styles.chDetailP]}>{phone ? ch.short : ch.detail}</Text>
            {on ? (
              <View style={styles.chTick}>
                <Tick />
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

/** The parent's number (with the country code) or email address. */
export function ContactField({ c, channel, value, onChange, phone = false }: { c: Consent; channel: Channel; value: string; onChange: (v: string) => void; phone?: boolean }) {
  const ch = CHANNELS.find((x) => x.key === channel) ?? CHANNELS[0];
  return (
    <View>
      <Text style={[styles.label, phone && styles.labelP]}>{ch.field}</Text>
      <View style={[styles.contact, phone && styles.contactP]}>
        {channel === 'email' ? null : (
          <View style={styles.dial}>
            <Image source={c.art.flagUg} style={styles.flag} />
            <Text style={styles.dialText}>{c.dialCode}</Text>
            <Icon name="chevronDown" size={14} color={Brand.ink} />
          </View>
        )}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder={ch.placeholder}
          placeholderTextColor="#9AA3B2"
          keyboardType={channel === 'email' ? 'email-address' : 'phone-pad'}
          autoCapitalize="none"
          accessibilityLabel={ch.field}
        />
      </View>
    </View>
  );
}

export function MessageBox({ value, onChange, phone = false }: { value: string; onChange: (v: string) => void; phone?: boolean }) {
  return (
    <View>
      <Text style={[styles.label, phone && styles.labelP]}>
        Add a personal message <Text style={styles.muted}>(optional)</Text>
      </Text>
      <TextInput style={[styles.message, phone && styles.messageP]} value={value} onChangeText={(t) => onChange(t.slice(0, MESSAGE_LIMIT))} multiline placeholderTextColor="#9AA3B2" accessibilityLabel="Personal message" />
      <Text style={styles.count}>{`${value.length}/${MESSAGE_LIMIT}`}</Text>
    </View>
  );
}

/** The "Why do we need this?" note. */
export function WhyBox({ phone = false }: { phone?: boolean }) {
  return (
    <View style={[styles.why, phone && styles.whyP]}>
      <View style={styles.info}>
        <Text style={styles.infoText}>i</Text>
      </View>
      <View style={styles.flex}>
        <Text style={[styles.whyTitle, phone && styles.whyTitleP]}>Why do we need this?</Text>
        <Text style={[styles.whyText, phone && styles.whyTextP]}>We care about your safety. Guardian consent helps us provide an age-appropriate, safe and supportive learning environment.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tick: { width: 20, height: 20, borderRadius: 10, backgroundColor: Brand.blue, alignItems: 'center', justifyContent: 'center' },
  channels: { flexDirection: 'row', gap: 10 },
  channelsP: { gap: 7 },
  channel: { flex: 1, height: 106, alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: 8, borderWidth: 1, borderColor: '#E3E8F0', backgroundColor: Brand.surface },
  channelP: { height: 86 },
  channelOn: { borderWidth: 2, borderColor: Brand.blue },
  logo: { width: 40, height: 40, borderRadius: 20, marginBottom: 6 },
  logoP: { width: 30, height: 30, borderRadius: 15, marginBottom: 4 },
  chTitle: { fontSize: 13.5, fontWeight: '500', color: Brand.ink },
  chTitleP: { fontSize: 12 },
  chDetail: { fontSize: 11.5, color: '#4A5263' },
  chDetailP: { fontSize: 10 },
  chTick: { position: 'absolute', top: 10, right: 10 },
  label: { marginBottom: 9, fontSize: 13.5, color: Brand.ink },
  labelP: { fontSize: 13 },
  muted: { color: '#4A5263' },
  contact: { height: 44, flexDirection: 'row', alignItems: 'center', borderRadius: 7, borderWidth: 1, borderColor: '#DFE4EC', backgroundColor: Brand.surface },
  contactP: { height: 40 },
  dial: { height: '100%', flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 11, borderRightWidth: 1, borderRightColor: '#DFE4EC' },
  flag: { width: 28, height: 18 },
  dialText: { fontSize: 13.5, color: Brand.ink },
  input: { flex: 1, height: '100%', paddingHorizontal: 13, fontSize: 13.5, color: Brand.ink },
  message: { minHeight: 68, paddingHorizontal: 13, paddingTop: 10, borderRadius: 7, borderWidth: 1, borderColor: '#DFE4EC', backgroundColor: Brand.surface, fontSize: 12, lineHeight: 17, color: '#3D4656', textAlignVertical: 'top' },
  messageP: { minHeight: 66, fontSize: 12.5 },
  count: { marginTop: 7, alignSelf: 'flex-end', fontSize: 11.5, color: '#4A5263' },
  why: { flexDirection: 'row', gap: 12, paddingHorizontal: 14, paddingVertical: 13, borderRadius: 8, backgroundColor: '#EEF4FF' },
  whyP: { paddingVertical: 14 },
  info: { width: 24, height: 24, borderRadius: 12, backgroundColor: Brand.blue, alignItems: 'center', justifyContent: 'center' },
  infoText: { fontSize: 13, fontWeight: '800', color: Brand.surface },
  whyTitle: { fontSize: 12.5, fontWeight: '600', color: Brand.ink },
  whyTitleP: { fontSize: 12.5 },
  whyText: { marginTop: 4, fontSize: 11, lineHeight: 16, color: '#3D4656' },
  whyTextP: { fontSize: 11.5 },
});
