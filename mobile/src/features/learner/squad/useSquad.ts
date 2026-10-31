import { useState } from 'react';

import { MODERATION_HELP, moderate, type Period, rankMembers } from '@/lib/squad';
import type { MockData } from '@/mock';

export type Room = MockData['learner']['squadRoom'];
export type Squad = Room['squads'][number];
export type Message = Squad['chat'][number];
export type SquadTab = 'Overview' | 'Chat' | 'Study Sessions' | 'Resources' | 'Tasks' | 'Members' | 'Settings';
export const TABS: readonly SquadTab[] = ['Overview', 'Chat', 'Study Sessions', 'Resources', 'Tasks', 'Members', 'Settings'];

const TOAST_MS = 2600;
const NOW = '10:32 AM';

const toggle = (list: readonly string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

/** One squad room: tabs, the moderated chat, leaderboard period, and the learner's own actions. */
export function useSquad(room: Room, squad: Squad) {
  const [tab, setTab] = useState<SquadTab>('Overview');
  const [period, setPeriod] = useState<Period>('week');
  const [sent, setSent] = useState<readonly Message[]>([]);
  const [draft, setDraft] = useState('');
  const [held, setHeld] = useState<string | null>(null);
  const [mine, setMine] = useState<readonly string[]>([]);
  const [reminders, setReminders] = useState<readonly string[]>([]);
  const [downloads, setDownloads] = useState<readonly string[]>([]);
  const [tasks, setTasks] = useState<readonly string[]>(squad.tasks.filter((t) => t.done).map((t) => t.id));
  const [toastText, setToastText] = useState<string | null>(null);
  const toast = (m: string) => {
    setToastText(m);
    setTimeout(() => setToastText((t) => (t === m ? null : t)), TOAST_MS);
  };
  const members = squad.members.map((id) => ({ id, ...room.people[id], scores: squad.scores[id] ?? { week: 0, month: 0 } }));
  return {
    squad,
    me: room.me,
    person: (id: string) => room.people[id],
    tab,
    setTab,
    period,
    setPeriod,
    board: rankMembers(members, period),
    members,
    chat: [...squad.chat, ...sent],
    draft,
    setDraft: (t: string) => {
      setDraft(t);
      setHeld(null);
    },
    held,
    send: () => {
      const m = moderate(draft);
      if (!m.ok) {
        setHeld(MODERATION_HELP[m.reason]);
        return;
      }
      setSent((s) => [...s, { id: `me-${s.length}`, who: room.me, time: NOW, text: m.text, reactions: {} }]);
      setDraft('');
    },
    /** Reaction counts including the learner's own taps. */
    reactions: (msg: Message) => {
      const out = { ...msg.reactions };
      for (const key of mine.filter((k) => k.startsWith(`${msg.id}:`))) {
        const emoji = key.slice(msg.id.length + 1);
        out[emoji] = (out[emoji] ?? 0) + 1;
      }
      return out;
    },
    reacted: (msg: Message, emoji: string) => mine.includes(`${msg.id}:${emoji}`),
    react: (msg: Message, emoji: string) => setMine((m) => toggle(m, `${msg.id}:${emoji}`)),
    reminded: (id: string) => reminders.includes(id),
    remind: (id: string, title: string) => {
      setReminders((r) => toggle(r, id));
      toast(reminders.includes(id) ? `Reminder for ${title} removed` : `We'll remind you 15 minutes before ${title}`);
    },
    downloaded: (id: string) => downloads.includes(id),
    download: (id: string, title: string) => {
      if (downloads.includes(id)) return;
      setDownloads((d) => [...d, id]);
      toast(`${title} saved for offline`);
    },
    taskDone: (id: string) => tasks.includes(id),
    toggleTask: (id: string) => setTasks((t) => toggle(t, id)),
    toast,
    toastText,
  };
}
export type SquadState = ReturnType<typeof useSquad>;
