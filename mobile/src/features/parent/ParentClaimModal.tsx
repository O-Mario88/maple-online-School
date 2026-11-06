import { Image } from '@/components/picture';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { parseChildClaimInput } from '@/lib/family/links';
import type { ParentChildProfile } from '@/mock/family';

import { BLUE, BODY } from './ParentHomeViews.styles';
import { useParentSheet } from './ParentSheet';
import { Maple } from '@/constants/maple';

/**
 * Interactive Cross-School Child Claim Panel (opened when parent clicks "+ Add Child"):
 * Fetches student profiles across any school using the Maple platform via QR code scan, 8-character claim code, or platform login claim.
 */
export function AddChildClaimModal({
  claimable,
  alreadyLinked,
  schools,
  onClose,
  onLinkChild,
}: {
  claimable: ParentChildProfile;
  alreadyLinked: boolean;
  schools: readonly string[];
  onClose: () => void;
  onLinkChild: (child: ParentChildProfile) => void;
}) {
  const styles = useParentSheet();
  const [method, setMethod] = useState<'qr' | 'code' | 'login'>('qr');
  const [input, setInput] = useState('A7K9M3D2');
  const parsed = parseChildClaimInput(input);

  return (
    <View style={styles.claimModal}>
      <View style={styles.claimHead}>
        <View style={styles.claimBadgeIcon}>
          <Icon name="qr" size={17} color={BLUE} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.claimTitle}>Link a Child Across Any Maple School</Text>
          <Text style={styles.claimSub}>
            {`Currently syncing ${schools.length} schools (${schools.join(' • ')}). Use a school QR code, 8-character claim code, or platform login to fetch another child's profile.`}
          </Text>
        </View>
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close claim panel" hitSlop={8}>
          <Icon name="close" size={17} color={BODY} />
        </Pressable>
      </View>

      <View style={styles.claimMethodRow}>
        {[
          {
            key: 'qr' as const,
            label: 'Scan School QR Code',
            icon: 'qr' as const,
          },
          {
            key: 'code' as const,
            label: '8-Character Claim Code',
            icon: 'grid' as const,
          },
          {
            key: 'login' as const,
            label: 'Platform Login Claim',
            icon: 'person' as const,
          },
        ].map((m) => {
          const on = method === m.key;
          return (
            <Pressable
              key={m.key}
              style={[styles.claimMethodBtn, on && styles.claimMethodBtnOn]}
              onPress={() => {
                setMethod(m.key);
                setInput(m.key === 'qr' ? 'maple://claim/A7K9M3D2' : m.key === 'code' ? 'A7K9M3D2' : 'amina.k@kisubi.maple');
              }}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}>
              <Icon name={m.icon} size={14} color={on ? BLUE : BODY} />
              <Text style={[styles.claimMethodText, on && styles.claimMethodTextOn]}>{m.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.claimBodyRow}>
        <View style={styles.claimInputCol}>
          <Text style={styles.claimInputLabel}>
            {method === 'qr'
              ? 'QR Payload / School Badge Token'
              : method === 'code'
                ? 'School-Issued 8-Character Claim Code'
                : 'Student Platform Handle or Admission Login'}
          </Text>
          <View style={styles.claimInputRow}>
            <TextInput
              style={styles.claimInput}
              value={input}
              onChangeText={setInput}
              placeholder="e.g. A7K9M3D2 or amina.k@kisubi.maple"
              placeholderTextColor={Maple.faint}
              autoCapitalize="none"
              accessibilityLabel="Child claim token"
            />
            <Pressable
              style={styles.fullWizardBtn}
              onPress={() => router.push('/claim-child')}
              accessibilityRole="link"
              accessibilityLabel="Open full QR scanner">
              <Icon name="camera" size={14} color={BLUE} />
              <Text style={styles.fullWizardText}>Full Scanner</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.matchedCard}>
          <Image source={claimable.avatar} style={styles.matchedAvatar} />
          <View style={styles.flex}>
            <View style={styles.matchedTagRow}>
              <Text style={styles.matchedName}>{claimable.fullName}</Text>
              <View style={styles.matchedSchoolPill}>
                <Text style={styles.matchedSchoolText}>{claimable.school}</Text>
              </View>
            </View>
            <Text style={styles.matchedMeta}>
              {`${claimable.grade} • Adm ${claimable.admissionNo} • Matched via ${parsed?.mode.toUpperCase() ?? 'QR'}`}
            </Text>
          </View>
          <Pressable
            style={[styles.linkNowBtn, alreadyLinked && styles.linkNowBtnDone]}
            onPress={() => onLinkChild(claimable)}
            accessibilityRole="button"
            accessibilityLabel={alreadyLinked ? `Switch to ${claimable.fullName}` : `Link ${claimable.fullName} to dashboard`}>
            <Icon name="check" size={13} color={Maple.surface} />
            <Text style={styles.linkNowText}>{alreadyLinked ? 'Switch Profile' : 'Link Child'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
