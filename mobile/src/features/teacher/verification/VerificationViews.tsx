import { Image } from '@/components/picture';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import {
  TeacherGrowSideNav,
  type TeacherMe,
  TeacherPhoneTop,
  TeacherTopBar,
} from '@/features/teacher/frame/TeacherFrame';
import { BLUE, BODY, Panel, StepBadge } from '@/features/teacher/frame/TeacherParts';
import { toast } from '@/lib/toast';
import type { VerificationKyc } from '@/mock/teacher-verification';
import { VERIFICATION_REF_WIDTH, s as deskS } from './VerificationViews.styles';
import { phoneS } from './VerificationViews.phoneStyles';
import { Maple } from '@/constants/maple';

export { VERIFICATION_REF_WIDTH };

/**
 * Image 2 — Teacher Verification & KYC Credentials Upload (`/(teacher)/verification`).
 * Upload national ID/passport, academic degrees, and teaching certificates
 * to unlock Verified Educator badges and instant payouts.
 */
export function VerificationDesk({ v, me, phone = false }: { v: VerificationKyc; me: TeacherMe; phone?: boolean }) {
  // Phones: the same page without the desktop top bar and side menu, stacked in one column.
  const s = phone ? phoneS : deskS;
  const [idDocType, setIdDocType] = useState<'nationalId' | 'passport'>('nationalId');
  const [confirmed, setConfirmed] = useState(true);
  const [uploadedId, setUploadedId] = useState(true);
  const [uploadedDegree, setUploadedDegree] = useState(false);
  const [uploadedTeaching, setUploadedTeaching] = useState(false);

  return (
    <View style={s.page}>
      {phone ? null : (
        <TeacherTopBar
          active={null}
          tabsVariant="live"
          me={me}
          placeholder="Search students, classes, or resources..."
        />
      )}

      <View style={s.body}>
        {/* Left Sidebar */}
        {phone ? null : (
          <TeacherGrowSideNav active="Verification" />
        )}

        {/* Center Main Column */}
        <View style={s.centerCol}>
          <View style={{ gap: 2 }}>
            <Text style={s.pageTitle}>Teacher Verification</Text>
            <Text style={s.pageSub}>
              Verify your identity and credentials to become a Verified Educator, unlock more opportunities, and receive instant payouts.
            </Text>
          </View>

          {/* 4-Step Horizontal Progress Bar */}
          <Panel style={s.stepperCard}>
            {v.steps.map((st, idx) => (
              <View key={st.num} style={s.stepperItemGroup}>
                <View style={s.stepperItem}>
                  <View
                    style={[
                      s.stepNumCircle,
                      st.active ? s.stepNumCircleOn : s.stepNumCircleIdle,
                    ]}>
                    <Text
                      style={[
                        s.stepNumText,
                        st.active ? s.stepNumTextOn : s.stepNumTextIdle,
                      ]}>
                      {st.num}
                    </Text>
                  </View>
                  <View style={{ gap: 1 }}>
                    <Text style={s.stepItemTitle}>{st.title}</Text>
                    <Text style={s.stepItemSub}>{st.subtitle}</Text>
                  </View>
                </View>
                {idx < v.steps.length - 1 ? (
                  <Text style={s.stepperArrow}>→</Text>
                ) : null}
              </View>
            ))}
          </Panel>

          {/* Section 1: 1. Identity Verification */}
          <Panel style={s.card}>
            <View style={s.secHeader}>
              <StepBadge n={1} size={22} />
              <View style={s.secText}>
                <Text style={s.secTitle}>1. Identity Verification</Text>
                <Text style={s.secSub}>
                  Upload a clear photo or scan of your government-issued ID.
                </Text>
              </View>
            </View>

            {/* National ID / Passport Tabs */}
            <View style={s.idTabsRow}>
              <Pressable
                style={[
                  s.idTab,
                  idDocType === 'nationalId' && s.idTabOn,
                ]}
                onPress={() => setIdDocType('nationalId')}>
                <Icon
                  name="person"
                  size={13}
                  color={idDocType === 'nationalId' ? BLUE : BODY}
                />
                <Text
                  style={[
                    s.idTabText,
                    idDocType === 'nationalId' && s.idTabTextOn,
                  ]}>
                  National ID
                </Text>
              </Pressable>

              <Pressable
                style={[
                  s.idTab,
                  idDocType === 'passport' && s.idTabOn,
                ]}
                onPress={() => setIdDocType('passport')}>
                <Icon
                  name="globe"
                  size={13}
                  color={idDocType === 'passport' ? BLUE : BODY}
                />
                <Text
                  style={[
                    s.idTabText,
                    idDocType === 'passport' && s.idTabTextOn,
                  ]}>
                  Passport
                </Text>
              </Pressable>
            </View>

            <View style={s.uploadRow}>
              {/* Dashed Dropzone */}
              <Pressable
                style={s.bigDropzone}
                onPress={() => {
                  setUploadedId(true);
                  toast('Uploaded National_ID_Front_Back.pdf (1.8 MB)');
                }}>
                <View style={s.uploadIconCircle}>
                  <Icon name="upload" size={16} color={BLUE} />
                </View>
                <Text style={s.dropzoneTitle}>
                  {idDocType === 'nationalId'
                    ? 'Upload National ID (Front and Back)'
                    : 'Upload Passport Bio-Data Page'}
                </Text>
                <Text style={s.dropzoneSub}>
                  Drag and drop files here, or click to browse
                </Text>
                <Text style={s.dropzoneFormats}>
                  JPG, PNG or PDF (max 10 MB each)
                </Text>
              </Pressable>

              {/* Requirements Checklist */}
              <View style={s.checklistCol}>
                <Text style={s.checklistTitle}>Requirements</Text>
                {v.idRequirements.map((req) => (
                  <View key={req} style={s.checkItemRow}>
                    <View style={s.greenCheckCircle}>
                      <Text style={s.greenCheckMark}>✓</Text>
                    </View>
                    <Text style={s.checkItemText}>{req}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Panel>

          {/* Section 2: 2. Academic Qualifications */}
          <Panel style={s.card}>
            <View style={s.secHeader}>
              <StepBadge n={2} size={22} />
              <View style={s.secText}>
                <Text style={s.secTitle}>2. Academic Qualifications</Text>
                <Text style={s.secSub}>
                  Upload your highest academic degree(s) and transcripts.
                </Text>
              </View>
            </View>

            <View style={s.uploadRow}>
              <View style={s.twoUploadBoxes}>
                <Pressable
                  style={s.smallDropzone}
                  onPress={() => {
                    setUploadedDegree(true);
                    toast('Uploaded BSc_Education_Makerere.pdf');
                  }}>
                  <Icon name="cap" size={20} color={BLUE} />
                  <Text style={s.dropzoneTitle}>Upload Degree Certificate</Text>
                  <Text style={s.dropzoneFormats}>JPG, PNG or PDF (max 10 MB)</Text>
                </Pressable>

                <Pressable
                  style={s.smallDropzone}
                  onPress={() => toast('Uploaded Official_Academic_Transcript.pdf')}>
                  <Icon name="clipboard" size={20} color={BLUE} />
                  <Text style={s.dropzoneTitle}>Upload Transcript (optional)</Text>
                  <Text style={s.dropzoneFormats}>JPG, PNG or PDF (max 10 MB)</Text>
                </Pressable>
              </View>

              <View style={s.checklistCol}>
                <Text style={s.checklistTitle}>Accepted documents</Text>
                {v.academicAccepted.map((acc) => (
                  <View key={acc} style={s.checkItemRow}>
                    <View style={s.greenCheckCircle}>
                      <Text style={s.greenCheckMark}>✓</Text>
                    </View>
                    <Text style={s.checkItemText}>{acc}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Panel>

          {/* Section 3: 3. Teaching Credentials */}
          <Panel style={s.card}>
            <View style={s.secHeader}>
              <StepBadge n={3} size={22} />
              <View style={s.secText}>
                <Text style={s.secTitle}>3. Teaching Credentials</Text>
                <Text style={s.secSub}>
                  Upload your teaching certificates, licenses, or proof of teaching experience.
                </Text>
              </View>
            </View>

            <View style={s.uploadRow}>
              <View style={s.twoUploadBoxes}>
                <Pressable
                  style={s.smallDropzone}
                  onPress={() => {
                    setUploadedTeaching(true);
                    toast('Uploaded MoES_Teaching_License_2026.pdf');
                  }}>
                  <Icon name="shield" size={20} color={BLUE} />
                  <Text style={s.dropzoneTitle}>Upload Teaching Certificate</Text>
                  <Text style={s.dropzoneFormats}>JPG, PNG or PDF (max 10 MB)</Text>
                </Pressable>

                <Pressable
                  style={s.smallDropzone}
                  onPress={() => toast('Added additional teaching credential.')}>
                  <View style={s.plusCircleBlue}>
                    <Icon name="plus" size={12} color={Maple.surface} />
                  </View>
                  <Text style={s.dropzoneTitle}>Add Additional Certificate</Text>
                  <Text style={s.dropzoneSub}>Upload more documents (optional)</Text>
                  <Text style={s.dropzoneFormats}>JPG, PNG or PDF (max 10 MB)</Text>
                </Pressable>
              </View>

              <View style={s.checklistCol}>
                <Text style={s.checklistTitle}>Examples of accepted documents</Text>
                {v.teachingAccepted.map((ex) => (
                  <View key={ex} style={s.checkItemRow}>
                    <View style={s.greenCheckCircle}>
                      <Text style={s.greenCheckMark}>✓</Text>
                    </View>
                    <Text style={s.checkItemText}>{ex}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Bottom Confirmation & Submit */}
            <View style={s.confirmFooter}>
              <Pressable
                style={s.confirmCheckRow}
                onPress={() => setConfirmed((c) => !c)}>
                <View style={[s.checkbox, confirmed && s.checkboxOn]}>
                  {confirmed ? <Text style={s.checkboxTick}>✓</Text> : null}
                </View>
                <View style={{ flex: 1, gap: 1 }}>
                  <Text style={s.confirmMainText}>
                    I confirm that the documents I am uploading are genuine and belong to me.
                  </Text>
                  <Text style={s.confirmSubText}>
                    Providing false information may result in account suspension.
                  </Text>
                </View>
              </Pressable>

              <Pressable
                style={s.submitVerifyBtn}
                onPress={() =>
                  toast(
                    'Submitted KYC & Educator Credentials for verification! Review takes <24 hours.',
                  )
                }>
                <Icon name="send" size={13} color={Maple.surface} />
                <Text style={s.submitVerifyBtnText}>Submit for Verification</Text>
              </Pressable>
            </View>
          </Panel>
        </View>

        {/* Right Column: Profile, Benefits, Verification Status, Need Help? */}
        <View style={s.rightCol}>
          {/* Card 1: Profile + Become a Verified Educator */}
          <Panel style={s.rightCard}>
            <View style={s.profileTopRow}>
              <View style={s.rightAvatarWrap}>
                <Image source={v.avatar} style={s.rightAvatar} contentFit="cover" />
                <View style={s.avatarShieldBadge}>
                  <Icon name="shield" size={9} color={Maple.surface} />
                </View>
              </View>
              <View style={{ flex: 1, gap: 1 }}>
                <Text style={s.rightName}>{v.name}</Text>
                <Text style={s.rightHandle}>{v.username}</Text>
                <Text style={s.rightRole} numberOfLines={1}>
                  {v.roleTitle}
                </Text>
              </View>
              <View style={s.unverifiedPill}>
                <Icon name="shield" size={10} color={BLUE} />
                <Text style={s.unverifiedPillText}>Unverified</Text>
              </View>
            </View>

            {/* Cream Callout */}
            <View style={s.becomeCallout}>
              <View style={s.goldShieldCircle}>
                <Icon name="shield" size={16} color={Maple.surface} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={s.becomeTitle}>Become a Verified Educator</Text>
                <Text style={s.becomeDesc}>
                  Complete verification to unlock more features, build trust with students and parents, and receive instant payouts.
                </Text>
              </View>
            </View>

            {/* 5 Benefits List */}
            <View style={s.benefitsList}>
              {v.benefits.map((b) => (
                <View key={b.title} style={s.benefitItem}>
                  <View style={s.benefitIconCircle}>
                    <Icon name={b.icon} size={13} color={Maple.successText} />
                  </View>
                  <View style={{ flex: 1, gap: 1 }}>
                    <Text style={s.benefitTitle}>{b.title}</Text>
                    <Text style={s.benefitSub}>{b.subtitle}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Panel>

          {/* Card 2: Verification Status */}
          <Panel style={s.rightCard}>
            <View style={s.statusHeaderRow}>
              <Text style={s.rightSectionTitle}>Verification Status</Text>
              <View style={s.inProgressPill}>
                <Text style={s.inProgressText}>In Progress</Text>
              </View>
            </View>

            <View style={s.timelineList}>
              {v.statusItems.map((st, idx) => {
                const isDone =
                  st.done ||
                  (idx === 0 && uploadedId) ||
                  (idx === 1 && uploadedDegree) ||
                  (idx === 2 && uploadedTeaching);
                return (
                  <View key={st.id} style={s.timelineRow}>
                    <View style={s.timelineTrackCol}>
                      {isDone ? (
                        <View style={s.timelineCircleDone}>
                          <Text style={s.timelineCheck}>✓</Text>
                        </View>
                      ) : (
                        <View style={s.timelineCircleIdle} />
                      )}
                      {idx < v.statusItems.length - 1 ? (
                        <View style={s.timelineVertLine} />
                      ) : null}
                    </View>
                    <View style={{ flex: 1, paddingBottom: 8 }}>
                      <Text style={s.timelineTitle}>{st.title}</Text>
                      <Text style={s.timelineSub}>{st.subtitle}</Text>
                    </View>
                    <Icon name="chevronRight" size={11} color={BODY} />
                  </View>
                );
              })}
            </View>
          </Panel>

          {/* Card 3: Need Help? */}
          <View style={s.helpCard}>
            <View style={s.helpTopRow}>
              <View style={s.helpQCircle}>
                <Text style={s.helpQMark}>?</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={s.rightSectionTitle}>Need Help?</Text>
                <Text style={s.helpSub}>
                  Read our verification guide or contact support.
                </Text>
              </View>
            </View>

            <View style={s.helpBtnsRow}>
              <Pressable
                style={s.viewGuideBtn}
                onPress={() => toast('Opened Verified Educator KYC Guide.')}>
                <Text style={s.viewGuideText}>View Guide</Text>
              </Pressable>
              <Pressable
                style={s.contactSupportBtn}
                onPress={() => toast('Connected with Maple Educator Support.')}>
                <Text style={s.contactSupportText}>Contact Support</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

export function VerificationPhone({ v, me }: { v: VerificationKyc; me: TeacherMe }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: Maple.blueSelected }}>
      <TeacherPhoneTop me={me} />
      <VerificationDesk v={v} me={me} phone />
    </ScrollView>
  );
}
