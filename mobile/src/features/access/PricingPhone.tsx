import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { RefScale } from '@/features/public/home/RefScale';

import { C, LOGO, Pill, PlanIcon, Popular, per, type Pricing, STUDENT, ugx, usePricing } from './pricing-parts';

/** The phone reference is 863px wide; the page is laid out in its pixels (from just under its status bar) and scaled to the phone. */
const REF_WIDTH = 863;

function Header({ p }: { p: Pricing }) {
  return (
    <View style={s.header}>
      <View style={s.blob} />
      <Image source={STUDENT} style={s.photo} contentFit="contain" accessibilityLabel="A smiling Maple learner" />
      <View style={s.brand}>
        <Image source={LOGO} style={s.leaf} contentFit="contain" />
        <View>
          <Text style={s.brandName}>Maple</Text>
          <Text style={s.brandSub}>Global Online School</Text>
        </View>
      </View>
      <View style={s.heroText}>
        <Pill p={p} size={18} height={40} />
        <Text style={s.title} accessibilityRole="header">
          {p.copy.title}
        </Text>
        <Text style={s.sub}>{p.copy.phone ?? p.copy.subtitle}</Text>
      </View>
      <View style={s.brings}>
        {p.brings.map((b, i) => (
          <View key={b.label} style={s.bring}>
            <View style={s.bringIcon}>
              <Icon name={b.icon} size={30} color={C.blue} />
            </View>
            <Text style={s.bringText}>{b.label}</Text>
            {i < p.brings.length - 1 ? <View style={s.bringLine} /> : null}
          </View>
        ))}
      </View>
      <Pressable style={s.mode} onPress={p.browseFree} accessibilityRole="button">
        <Icon name="people" size={40} color={C.blue} />
        <View style={s.modeText}>
          <Text style={s.modeTitle}>{p.modeLabel}</Text>
          <Text style={s.modeBody}>{p.currentId && p.currentId !== 'free' ? 'Carry on with everything in your plan.' : 'Free plan: 5 lessons, 1 live class and 10 papers a month.'}</Text>
        </View>
        <Icon name="arrowRight" size={28} color={C.ink} />
      </Pressable>
    </View>
  );
}

function PlanRows({ p }: { p: Pricing }) {
  return (
    <>
      {p.phonePlans.map((x) => {
        const on = x.id === p.chosen;
        return (
          <Pressable
            key={x.id}
            style={[s.row, x.popular && s.rowPopular]}
            onPress={() => p.setChosen(x.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`${x.name}, ${ugx(x.monthly)} ${per(p.school)}`}>
            {x.popular ? (
              <View style={s.popularAt}>
                <Popular size={18.3} height={41} />
              </View>
            ) : null}
            <PlanIcon plan={x} size={76} />
            <View style={s.rowText}>
              <Text style={s.rowName}>{x.name}</Text>
              <Text style={s.rowBlurb}>{x.phoneBlurb ?? x.blurb}</Text>
            </View>
            <View style={s.rowLine} />
            <View style={s.rowPrice}>
              <Text style={s.rowAmount}>{x.monthly ? ugx(x.monthly) : 'UGX 0'}</Text>
              <Text style={s.rowPer}>{per(p.school)}</Text>
            </View>
            <View style={[s.radio, on && s.radioOn]}>{on ? <View style={s.radioDot} /> : null}</View>
          </Pressable>
        );
      })}
    </>
  );
}

/** Pricing on phones: the phone reference, scaled to the screen. */
export function PricingPhone() {
  const p = usePricing();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const plan = p.phonePlans.find((x) => x.id === p.chosen);
  return (
    <ScrollView style={s.root} contentContainerStyle={{ paddingTop: insets.top }}>
      <RefScale width={width} refWidth={REF_WIDTH}>
        <View style={s.canvas}>
          <Header p={p} />
              <Text style={s.planHead}>Choose Your Plan</Text>
          <Text style={s.planSub}>Get back to full learning and reach your goals faster.</Text>
          <PlanRows p={p} />
          {plan && plan.id === p.currentId ? (
            <View style={[s.pay, s.payCurrent]} accessibilityLabel={`${plan.name} is your current plan`}>
              <Icon name="check" size={32} color={C.green} />
              <Text style={[s.payText, s.payCurrentText]}>Your current plan</Text>
            </View>
          ) : (
            <Pressable style={s.pay} onPress={() => (plan?.monthly ? p.pay(plan.id) : p.browseFree())} accessibilityRole="button">
              <LinearGradient colors={['#1F7BF2', '#0457D8']} style={StyleSheet.absoluteFill} />
              <Icon name={plan?.monthly ? 'lock' : 'gift'} size={32} color={C.white} />
              <Text style={s.payText}>{!plan?.monthly ? 'Continue free' : p.currentId ? `Switch to ${plan.short ?? plan.name}` : 'Pay to Continue'}</Text>
              <Icon name="arrowRight" size={32} color={C.white} />
            </Pressable>
          )}
          <View style={s.promises}>
            {p.promisesPhone.map((m, i) => (
              <View key={m.title} style={[s.promise, i > 0 && s.promiseLine]}>
                <Icon name={m.icon} size={27} color={C.blue} />
                <Text style={s.promiseText}>{m.title}</Text>
              </View>
            ))}
          </View>
        </View>
      </RefScale>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.canvas },
  canvas: { width: REF_WIDTH, paddingBottom: 56, backgroundColor: C.canvas },

  header: { height: 622 },
  blob: { position: 'absolute', left: 512, top: 92, width: 330, height: 330, borderTopLeftRadius: 150, borderTopRightRadius: 90, borderBottomLeftRadius: 40, backgroundColor: '#E2ECFC' },
  photo: { position: 'absolute', left: 526, top: 81, width: 339, height: 393 },
  brand: { position: 'absolute', left: 57, top: 19, flexDirection: 'row', alignItems: 'center', gap: 13 },
  leaf: { width: 51, height: 52 },
  brandName: { fontSize: 32.6, lineHeight: 36, fontWeight: '700', color: C.navy },
  brandSub: { fontSize: 15.5, lineHeight: 19, fontWeight: '600', color: C.navy },
  heroText: { position: 'absolute', left: 58, top: 118, width: 450 },
  title: { marginTop: 7, fontSize: 52, lineHeight: 57, fontWeight: '800', letterSpacing: -0.8, color: C.navy },
  sub: { marginTop: 19, width: 445, fontSize: 20, lineHeight: 30, color: C.body },

  brings: { position: 'absolute', left: 45, top: 408, width: 775, height: 92, flexDirection: 'row', borderRadius: 20, backgroundColor: C.white, shadowColor: '#1E3A8A', shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 4 } },
  bring: { width: 261, flexDirection: 'row', alignItems: 'center', gap: 20, paddingLeft: 40 },
  bringLine: { position: 'absolute', right: 6, top: 20, bottom: 20, width: 1.5, backgroundColor: '#E5EAF2' },
  bringIcon: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: '#EEF4FF' },
  bringText: { width: 110, fontSize: 20, lineHeight: 28, color: C.ink },

  mode: { position: 'absolute', left: 45, top: 522, width: 775, height: 100, flexDirection: 'row', alignItems: 'center', paddingLeft: 37, paddingRight: 32, borderRadius: 22, borderWidth: 1.5, borderColor: '#D9E5FA', backgroundColor: '#EDF3FE' },
  modeText: { flex: 1, marginLeft: 29 },
  modeTitle: { fontSize: 25, lineHeight: 31, fontWeight: '700', color: C.navy },
  modeBody: { marginTop: 4, fontSize: 20, lineHeight: 26, color: C.body },


  planHead: { marginTop: 38, marginLeft: 50, fontSize: 38.5, lineHeight: 46, fontWeight: '700', color: C.navy },
  planSub: { marginTop: 7, marginLeft: 50, fontSize: 23.2, lineHeight: 30, color: C.body },

  row: { marginTop: 25, marginLeft: 40, width: 782, flexDirection: 'row', alignItems: 'center', paddingLeft: 28, paddingVertical: 22, borderRadius: 22, borderWidth: 1.5, borderColor: '#EDF0F6', backgroundColor: C.white, shadowColor: '#1E3A8A', shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 3 } },
  rowPopular: { marginTop: 30, paddingTop: 34, paddingBottom: 26, borderWidth: 2, borderColor: C.goldLine, backgroundColor: '#FFF6E6' },
  popularAt: { position: 'absolute', top: -14, right: 49 },
  rowText: { marginLeft: 31, width: 320 },
  rowName: { fontSize: 27.4, lineHeight: 34, fontWeight: '700', color: C.navy },
  rowBlurb: { marginTop: 6, fontSize: 20, lineHeight: 29.5, color: C.body },
  rowLine: { marginLeft: 15, width: 1.5, height: 75, backgroundColor: '#E5EAF2' },
  rowPrice: { flex: 1, marginLeft: 38 },
  rowAmount: { fontSize: 28.5, lineHeight: 34, fontWeight: '700', color: C.navy },
  rowPer: { marginTop: 9, fontSize: 22, lineHeight: 28, color: C.body },
  radio: { width: 36, height: 36, marginRight: 18, alignItems: 'center', justifyContent: 'center', borderRadius: 18, borderWidth: 2.5, borderColor: '#A3AAB8' },
  radioOn: { borderWidth: 3.5, borderColor: C.blue },
  radioDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: C.blue },

  pay: { marginTop: 48, marginLeft: 40, width: 783, height: 84, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 26, overflow: 'hidden', borderRadius: 42, backgroundColor: '#0368E6' },
  payText: { fontSize: 29.5, fontWeight: '700', color: C.white },
  payCurrent: { borderWidth: 2, borderColor: '#BBE5C8', backgroundColor: '#EEF9F1' },
  payCurrentText: { color: C.green },

  promises: { marginTop: 36, marginLeft: 20, width: 823, height: 40, flexDirection: 'row', alignItems: 'center' },
  promise: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 11 },
  promiseLine: { borderLeftWidth: 1.5, borderLeftColor: '#E2E8F0' },
  promiseText: { fontSize: 19.5, color: C.ink },
});
