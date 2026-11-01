import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import type { HostChatMsg, TeacherHost } from '@/mock/teacher-host';

interface Props {
  h: TeacherHost;
  quizTimer: number;
  quizRunning: boolean;
  onLaunchQuiz: () => void;
}

/**
 * Right-hand column of the Maple Live Teacher Host Console:
 * 1) 1-tap 15-second Pulse Quiz launcher
 * 2) Live Student Comprehension AI gauge & 20-bar heatmap
 * 3) Breakout Room Manager
 * 4) Class Chat
 */
export function HostRightPanels({ h, quizTimer, quizRunning, onLaunchQuiz }: Props) {
  const [selectedOpt, setSelectedOpt] = useState<'A' | 'B' | 'C' | 'D'>('B');
  const [joinedRoomId, setJoinedRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<HostChatMsg[]>(h.chat);
  const [draft, setDraft] = useState('');

  const sendMessage = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        name: 'You (Teacher)',
        time: '10:23 AM',
        text: trimmed,
        photo: h.teacherVideo,
      },
    ]);
    setDraft('');
  };

  const formattedQuizTime = `00:${String(quizTimer).padStart(2, '0')}`;

  return (
    <View style={s.col}>
      {/* 1. Pulse Quiz Card */}
      <View style={s.card}>
        <View style={s.cardHeader}>
          <View style={s.headerIconBlue}>
            <Icon name="bolt" size={11} color="#FFFFFF" />
          </View>
          <Text style={s.cardTitle}>Pulse Quiz</Text>
          <View style={{ flex: 1 }} />
          <View style={[s.timerPill, quizRunning && s.timerPillActive]}>
            <Icon name="clock" size={10} color={quizRunning ? '#1463F3' : '#475569'} />
            <Text style={[s.timerText, quizRunning && { color: '#1463F3' }]}>{formattedQuizTime}</Text>
          </View>
          <Pressable style={s.closeBtn}>
            <Icon name="close" size={11} color="#64748B" />
          </Pressable>
        </View>

        <Text style={s.quizQuestion}>{h.pulseQuiz.question}</Text>

        <View style={s.quizOptions}>
          {h.pulseQuiz.options.map((opt) => {
            const isSelected = selectedOpt === opt.letter;
            return (
              <Pressable
                key={opt.letter}
                style={[s.quizOptRow, isSelected && s.quizOptRowCorrect]}
                onPress={() => setSelectedOpt(opt.letter)}>
                <View style={[s.optLetterCircle, isSelected && s.optLetterCircleCorrect]}>
                  <Text style={[s.optLetterText, isSelected && s.optLetterTextCorrect]}>
                    {opt.letter}
                  </Text>
                </View>
                <Text style={[s.optFormula, isSelected && s.optFormulaCorrect]}>
                  {opt.formula}
                </Text>
                <View style={{ flex: 1 }} />
                {isSelected ? (
                  <View style={s.optCheckCircle}>
                    <Text style={s.optCheckMark}>✓</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={[s.launchBtn, quizRunning && s.launchBtnActive]}
          onPress={onLaunchQuiz}>
          <Text style={s.launchBtnText}>
            {quizRunning ? `Live in Class (${quizTimer}s)...` : 'Launch to Class (15s)'}
          </Text>
        </Pressable>
      </View>

      {/* 2. Live Comprehension Card */}
      <View style={s.card}>
        <View style={s.cardHeader}>
          <View style={s.headerIconBlue}>
            <Icon name="chart" size={11} color="#FFFFFF" />
          </View>
          <Text style={s.cardTitle}>Live Comprehension</Text>
        </View>

        <View style={s.compTopRow}>
          {/* Gauge + 78% */}
          <View style={s.gaugeCluster}>
            <View style={s.gaugeWrap}>
              <View style={s.gaugeArcOuter} />
              <View style={s.gaugeArcGreen} />
              <View style={s.gaugeArcAmber} />
              <View style={s.gaugeNeedle} />
              <View style={s.gaugeHub} />
            </View>
            <View style={s.gaugeTextCol}>
              <Text style={s.compPercent}>{h.comprehension.percent}%</Text>
              <Text style={s.compSub}>Class understanding (AI)</Text>
            </View>
          </View>

          {/* Legend */}
          <View style={s.legendCol}>
            {h.comprehension.legend.map((item) => (
              <View key={item.label} style={s.legendRow}>
                <View style={[s.legendDot, { backgroundColor: item.color }]} />
                <Text style={s.legendText}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 20-bar Comprehension Heatmap */}
        <View style={s.heatmapRow}>
          {h.comprehension.bars.map((bar, idx) => (
            <View key={idx} style={s.heatmapTrack}>
              <View
                style={[
                  s.heatmapBar,
                  {
                    height: `${Math.round(bar.h * 100)}%`,
                    backgroundColor: bar.color,
                  },
                ]}
              />
            </View>
          ))}
        </View>
      </View>

      {/* 3. Breakout Rooms Card */}
      <View style={s.card}>
        <View style={s.cardHeader}>
          <View style={s.headerIconBlue}>
            <Icon name="rooms" size={11} color="#FFFFFF" />
          </View>
          <Text style={s.cardTitle}>Breakout Rooms</Text>
          <View style={{ flex: 1 }} />
          <Pressable style={s.manageBtn} onPress={() => setJoinedRoomId(null)}>
            <Text style={s.manageBtnText}>Manage</Text>
          </Pressable>
        </View>

        <View style={s.roomsList}>
          {h.breakoutRooms.map((room) => {
            const joined = joinedRoomId === room.id;
            return (
              <View key={room.id} style={s.roomRow}>
                <View style={s.roomDotCircle}>
                  <View style={s.roomDotInner} />
                </View>
                <Text style={s.roomName}>{room.name}</Text>
                <View style={s.roomMeta}>
                  <Icon name="people" size={10} color="#64748B" />
                  <Text style={s.roomCount}>{room.students} students</Text>
                </View>
                <View style={{ flex: 1 }} />
                <Pressable
                  style={[s.joinBtn, joined && s.joinBtnActive]}
                  onPress={() => setJoinedRoomId(joined ? null : room.id)}>
                  <Text style={[s.joinBtnText, joined && s.joinBtnTextActive]}>
                    {joined ? 'Joined' : 'Join'}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>

      {/* 4. Class Chat Card */}
      <View style={[s.card, s.chatCard]}>
        <View style={s.cardHeader}>
          <View style={s.headerIconBlue}>
            <Icon name="chat" size={11} color="#FFFFFF" />
          </View>
          <Text style={s.cardTitle}>Class Chat</Text>
          <View style={{ flex: 1 }} />
          <Pressable style={s.everyonePill}>
            <Text style={s.everyoneText}>Everyone</Text>
            <Icon name="chevronDown" size={9} color="#475569" />
          </Pressable>
        </View>

        <View style={s.chatList}>
          {messages.slice(-3).map((msg) => (
            <View key={msg.id} style={s.chatRow}>
              <Image source={msg.photo} style={s.chatAvatar} contentFit="cover" />
              <View style={s.chatBody}>
                <View style={s.chatNameRow}>
                  <Text style={s.chatName}>{msg.name}</Text>
                  <Text style={s.chatTime}>{msg.time}</Text>
                </View>
                <Text style={s.chatText} numberOfLines={1}>
                  {msg.text}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={s.chatInputRow}>
          <View style={s.chatInputBox}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Type a message..."
              placeholderTextColor="#94A3B8"
              style={s.chatInput}
              onSubmitEditing={sendMessage}
            />
            <Icon name="smile" size={13} color="#94A3B8" />
          </View>
          <Pressable style={s.sendBtn} onPress={sendMessage}>
            <Icon name="send" size={11} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/** Hook for managing the 15-second Pulse Quiz countdown timer. */
export function usePulseQuizTimer(initialSeconds = 15) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setRunning(false);
          return initialSeconds;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, initialSeconds]);

  const launch = () => {
    setSeconds(initialSeconds);
    setRunning(true);
  };

  return { seconds, running, launch };
}

const s = StyleSheet.create({
  col: {
    width: 266,
    gap: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    gap: 7,
  },
  chatCard: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerIconBlue: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1463F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontWeight: '700',
    fontSize: 12,
    color: '#0F172A',
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
  },
  timerPillActive: {
    backgroundColor: '#DBEAFE',
  },
  timerText: {
    fontWeight: '600',
    fontSize: 9.5,
    color: '#334155',
  },
  closeBtn: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizQuestion: {
    fontWeight: '500',
    fontSize: 10.5,
    color: '#1E293B',
  },
  quizOptions: {
    gap: 4.5,
  },
  quizOptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 4.5,
  },
  quizOptRowCorrect: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  optLetterCircle: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optLetterCircleCorrect: {
    backgroundColor: '#16A34A',
  },
  optLetterText: {
    fontWeight: '700',
    fontSize: 9.5,
    color: '#475569',
  },
  optLetterTextCorrect: {
    color: '#FFFFFF',
  },
  optFormula: {
    fontWeight: '500',
    fontSize: 10.5,
    color: '#1E293B',
  },
  optFormulaCorrect: {
    fontWeight: '600',
    color: '#0F172A',
  },
  optCheckCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optCheckMark: {
    fontWeight: '700',
    fontSize: 9.5,
    color: '#FFFFFF',
  },
  launchBtn: {
    backgroundColor: '#1463F3',
    borderRadius: 7,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  launchBtnActive: {
    backgroundColor: '#1D4ED8',
  },
  launchBtnText: {
    fontWeight: '700',
    fontSize: 10.5,
    color: '#FFFFFF',
  },

  /* Live Comprehension */
  compTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  gaugeCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gaugeWrap: {
    width: 48,
    height: 28,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  gaugeArcOuter: {
    position: 'absolute',
    top: 2,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 5,
    borderColor: '#E2E8F0',
  },
  gaugeArcGreen: {
    position: 'absolute',
    top: 2,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 5,
    borderLeftColor: '#22C55E',
    borderTopColor: '#4ADE80',
    borderRightColor: '#F59E0B',
    borderBottomColor: 'transparent',
  },
  gaugeArcAmber: {
    position: 'absolute',
    top: 2,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 5,
    borderLeftColor: 'transparent',
    borderTopColor: 'transparent',
    borderRightColor: '#EF4444',
    borderBottomColor: 'transparent',
  },
  gaugeNeedle: {
    width: 2,
    height: 15,
    backgroundColor: '#0F172A',
    borderRadius: 1,
    transform: [{ rotate: '28deg' }],
    marginBottom: 2,
  },
  gaugeHub: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0F172A',
    position: 'absolute',
    bottom: 0,
  },
  gaugeTextCol: {
    gap: 1,
  },
  compPercent: {
    fontWeight: '700',
    fontSize: 16,
    color: '#0F172A',
    lineHeight: 18,
  },
  compSub: {
    fontWeight: '400',
    fontSize: 8.5,
    color: '#64748B',
  },
  legendCol: {
    gap: 2,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6.5,
    height: 6.5,
    borderRadius: 3.5,
  },
  legendText: {
    fontWeight: '500',
    fontSize: 8.5,
    color: '#475569',
  },
  heatmapRow: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    paddingTop: 4,
  },
  heatmapTrack: {
    flex: 1,
    height: '100%',
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  heatmapBar: {
    width: '100%',
    borderRadius: 2,
  },

  /* Breakout Rooms */
  manageBtn: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
  },
  manageBtnText: {
    fontWeight: '600',
    fontSize: 9.5,
    color: '#1463F3',
  },
  roomsList: {
    gap: 4.5,
  },
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E8EEF7',
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 4.5,
  },
  roomDotCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  roomName: {
    fontWeight: '600',
    fontSize: 10.5,
    color: '#0F172A',
    width: 44,
  },
  roomMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  roomCount: {
    fontWeight: '400',
    fontSize: 9.5,
    color: '#64748B',
  },
  joinBtn: {
    backgroundColor: '#EEF4FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 5,
    paddingHorizontal: 9,
    paddingVertical: 2.5,
  },
  joinBtnActive: {
    backgroundColor: '#1463F3',
    borderColor: '#1463F3',
  },
  joinBtnText: {
    fontWeight: '600',
    fontSize: 9.5,
    color: '#1463F3',
  },
  joinBtnTextActive: {
    color: '#FFFFFF',
  },

  /* Class Chat */
  everyonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
  },
  everyoneText: {
    fontWeight: '500',
    fontSize: 9.5,
    color: '#334155',
  },
  chatList: {
    gap: 6,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
  },
  chatAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  chatBody: {
    flex: 1,
    gap: 1,
  },
  chatNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  chatName: {
    fontWeight: '700',
    fontSize: 10,
    color: '#0F172A',
  },
  chatTime: {
    fontWeight: '400',
    fontSize: 8.5,
    color: '#94A3B8',
  },
  chatText: {
    fontWeight: '400',
    fontSize: 10,
    color: '#334155',
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  chatInputBox: {
    flex: 1,
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 7,
    paddingHorizontal: 8,
    gap: 4,
  },
  chatInput: {
    flex: 1,
    fontWeight: '400',
    fontSize: 10,
    color: '#0F172A',
    paddingVertical: 0,
  },
  sendBtn: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
