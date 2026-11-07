import { Image } from '@/components/picture';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Btn, Card, CardHead, Pill } from '@/features/portal/PortalParts';
import { BLUE, BODY, LINE, NAVY, WHITE } from '@/features/portal/tokens';
import type { IconName } from '@/lib/icons';
import { toast } from '@/lib/toast';
import type { MockData } from '@/mock';
import type { CommunityPost } from '@/mock/school-community';

import { AdminDesk, AdminPhone } from '../kit/AdminKit';
import { HubHeader, HubTabs } from '../kit/HubKit';
import { CATEGORIES, filterFeed, postStatus, toggleLike } from './community';
import { Maple } from '@/constants/maple';

type Admin = MockData['schoolAdmin'];
type Cat = (typeof CATEGORIES)[number];

const BRAND_BLUE = Maple.blue;

function useCommunity(a: Admin) {
  const c = a.schoolCommunity;
  const [tab, setTab] = useState(c.tabs[0]);
  const [category, setCategory] = useState<Cat>('All Posts');
  const [sort, setSort] = useState<'latest' | 'top'>('latest');
  const [posts, setPosts] = useState<readonly CommunityPost[]>(c.posts);
  const [draft, setDraft] = useState('');
  const update = (id: string, f: (p: CommunityPost) => CommunityPost) => setPosts((l) => l.map((p) => (p.id === id ? f(p) : p)));
  return {
    c,
    tab,
    setTab,
    category,
    setCategory,
    sort,
    toggleSort: () => setSort((x) => (x === 'latest' ? 'top' : 'latest')),
    feed: filterFeed(posts, tab === 'Achievements' ? 'Achievements' : category, sort),
    pending: posts.filter((p) => p.status === 'pending'),
    draft,
    setDraft,
    like: (id: string) => update(id, (p) => toggleLike(p, c.me.id)),
    save: (id: string) => update(id, (p) => ({ ...p, saved: !p.saved })),
    approve: (id: string) => {
      update(id, (p) => ({ ...p, status: 'published' }));
      toast('Approved and published to the community.');
    },
    remove: (id: string) => {
      update(id, (p) => ({ ...p, status: 'removed' }));
      toast('Removed. The author is told why, privately.');
    },
    post: () => {
      if (!draft.trim()) return toast('Write something to share first.');
      const status = postStatus(c.me, { kind: 'feed' });
      const p: CommunityPost = { ...c.posts[0], id: `p${Date.now()}`, authorId: c.me.id, author: 'Mr. James Kato', badge: 'Administrator', context: 'School Office', ago: 'Just now', avatar: c.meAvatar, category: 'School Updates', at: new Date().toISOString(), title: draft.trim().split('\n')[0].slice(0, 80), body: draft.trim(), file: undefined, images: [], likes: 0, likedBy: [], comments: 0, saved: false, status };
      setPosts((l) => [p, ...l]);
      setDraft('');
      toast(status === 'published' ? 'Posted to the community.' : 'Sent for moderation.');
    },
  };
}
type X = ReturnType<typeof useCommunity>;

function LeftNav({ x }: { x: X }) {
  return (
    <View style={s.stack}>
      <Card style={s.coverCard}>
        <Image decorative source={x.c.cover} style={s.cover} contentFit="cover" />
        <LinearGradient colors={['rgba(11,26,63,0)', 'rgba(11,26,63,0.75)']} style={StyleSheet.absoluteFill} />
        <Text style={s.coverText}>{x.c.title}</Text>
      </Card>
      <Card style={s.navCard}>
        {x.c.nav.map((n, i) => (
          <Pressable key={n.label} style={[s.navItem, i === 0 && s.navOn]} onPress={() => x.setTab(n.label === 'Feed' ? 'Home (Feed)' : n.label === 'My Groups' ? 'Groups' : n.label === 'Saved Posts' ? 'Home (Feed)' : n.label)} accessibilityRole="link">
            <Icon name={n.icon} size={18} color={i === 0 ? BRAND_BLUE : NAVY} />
            <Text style={[s.navText, i === 0 && s.navTextOn]}>{n.label}</Text>
            {n.count ? <Text style={s.count}>{n.count}</Text> : null}
          </Pressable>
        ))}
        <View style={s.divider} />
        <View style={s.rowBetween}>
          <Text style={s.strong}>Your Groups</Text>
          <Pressable onPress={() => toast('New groups are reviewed by an administrator before learners can join.')} accessibilityRole="button">
            <Text style={s.link}>+ Create Group</Text>
          </Pressable>
        </View>
        {x.c.groups.map((g) => (
          <View key={g.id} style={s.group}>
            <Image decorative source={g.photo} style={s.groupPhoto} contentFit="cover" />
            <View style={s.flex}>
              <Text style={s.strong}>{g.name}</Text>
              <Text style={s.small}>{`${g.members} members`}</Text>
            </View>
          </View>
        ))}
        <Pressable onPress={() => x.setTab('Groups')} accessibilityRole="link">
          <Text style={s.link}>View All Groups →</Text>
        </Pressable>
      </Card>
    </View>
  );
}

function Composer({ x }: { x: X }) {
  const tools: readonly [IconName, string][] = [
    ['image', 'Photo / Video'],
    ['paperclip', 'File / Resource'],
    ['chart', 'Poll'],
    ['calendar', 'Event'],
  ];
  return (
    <Card style={s.card}>
      <View style={s.row}>
        <Image decorative source={x.c.meAvatar} style={s.avatar} contentFit="cover" />
        <TextInput style={s.composer} value={x.draft} onChangeText={x.setDraft} placeholder="Share an update, resource, or announcement with your school community..." placeholderTextColor={BODY} multiline accessibilityLabel="Write a post" />
      </View>
      <View style={s.rowWrap}>
        {tools.map(([icon, label]) => (
          <Pressable key={label} style={s.tool} onPress={() => toast(`${label}: attach it, then press Post.`)} accessibilityRole="button">
            <Icon name={icon} size={15} color={NAVY} />
            <Text style={s.toolText}>{label}</Text>
          </Pressable>
        ))}
        <View style={s.flex} />
        <Btn label="Post" icon="send" height={38} onPress={x.post} />
      </View>
    </Card>
  );
}

function PostCard({ p, x }: { p: CommunityPost; x: X }) {
  const liked = p.likedBy.includes(x.c.me.id);
  const one = p.images.length === 1;
  return (
    <Card style={s.card}>
      <View style={s.row}>
        <Image decorative source={p.avatar} style={s.avatar} contentFit="cover" />
        <View style={s.flex}>
          <View style={s.row}>
            <Text style={s.author}>{p.author}</Text>
            <Pill label={p.badge} tone="purple" size={11} />
          </View>
          <Text style={s.small}>{`${p.context} • ${p.ago}`}</Text>
        </View>
        <Pressable onPress={() => toast('Report, pin or hide this post.')} hitSlop={8} accessibilityRole="button" accessibilityLabel="Post options">
          <Icon name="more" size={18} color={NAVY} />
        </Pressable>
      </View>
      <View style={one ? s.rowTop : undefined}>
        <View style={s.flex}>
          <Text style={s.postTitle}>{p.title}</Text>
          <Text style={s.body}>{p.body}</Text>
          {p.file ? (
            <View style={s.file}>
              <View style={s.pdf}>
                <Text style={s.pdfText}>PDF</Text>
              </View>
              <View style={s.flex}>
                <Text style={s.strong}>{p.file.name}</Text>
                <Text style={s.small}>{p.file.size}</Text>
              </View>
              <Pressable onPress={() => toast(`${p.file?.name} downloaded.`)} accessibilityRole="button" accessibilityLabel={`Download ${p.file.name}`}>
                <Icon name="download" size={18} color={BLUE} />
              </Pressable>
            </View>
          ) : null}
        </View>
        {one ? <Image decorative source={p.images[0]} style={s.sidePhoto} contentFit="cover" /> : null}
      </View>
      {p.images.length > 1 ? (
        <View style={s.photos}>
          {p.images.map((img, i) => (
            <Image decorative key={i} source={img} style={s.photo} contentFit="cover" />
          ))}
        </View>
      ) : null}
      <View style={s.actions}>
        <Pressable style={s.action} onPress={() => x.like(p.id)} accessibilityRole="button" accessibilityState={{ selected: liked }} accessibilityLabel={`${liked ? 'Unlike' : 'Like'}, ${p.likes} likes`}>
          <Icon name="thumbUp" size={17} color={liked ? BLUE : NAVY} />
          <Text style={[s.actionText, liked && s.liked]}>{p.likes}</Text>
        </Pressable>
        <View style={s.action}>
          <Icon name="chat" size={17} color={NAVY} />
          <Text style={s.actionText}>{p.comments}</Text>
        </View>
        <Pressable style={s.action} onPress={() => toast('Shared within the school community only.')} accessibilityRole="button">
          <Icon name="share" size={17} color={NAVY} />
          <Text style={s.actionText}>Share</Text>
        </Pressable>
        <Pressable style={s.action} onPress={() => x.save(p.id)} accessibilityRole="button" accessibilityState={{ selected: p.saved }}>
          <Icon name={p.saved ? 'bookmarkOn' : 'bookmark'} size={17} color={p.saved ? BRAND_BLUE : NAVY} />
          <Text style={s.actionText}>{p.saved ? 'Saved' : 'Save'}</Text>
        </Pressable>
      </View>
    </Card>
  );
}

function Feed({ x }: { x: X }) {
  return (
    <View style={s.stack}>
      <Composer x={x} />
      <View style={s.rowWrap}>
        {CATEGORIES.map((c) => (
          <Pressable key={c} style={[s.filter, x.category === c && s.filterOn]} onPress={() => x.setCategory(c)} accessibilityRole="tab" accessibilityState={{ selected: x.category === c }}>
            <Text style={[s.filterText, x.category === c && s.filterTextOn]}>{c}</Text>
          </Pressable>
        ))}
        <View style={s.flex} />
        <Pressable style={s.row} onPress={x.toggleSort} accessibilityRole="button">
          <Text style={s.strong}>{`Sort: ${x.sort === 'latest' ? 'Latest' : 'Most liked'}`}</Text>
          <Icon name="chevronDown" size={15} color={NAVY} />
        </Pressable>
      </View>
      {x.feed.length ? x.feed.map((p) => <PostCard key={p.id} p={p} x={x} />) : <Text style={s.small}>Nothing here yet.</Text>}
    </View>
  );
}

function RightRail({ x }: { x: X }) {
  const quick: readonly [IconName, string][] = [
    ['edit', 'Create Post'],
    ['people', 'Create Group'],
    ['calendar', 'Create Event'],
    ['chart', 'Create Poll'],
  ];
  return (
    <View style={s.stack}>
      <Card style={s.card}>
        <CardHead title="School Announcements" size={16} link="View All" onLink={() => x.setTab('Announcements')} />
        {x.c.announcements.map((a) => (
          <View key={a.id} style={s.rowTop}>
            <Icon name={a.icon} size={18} color={BRAND_BLUE} />
            <View style={s.flex}>
              <Text style={s.strong}>{a.title}</Text>
              <Text style={s.small}>{a.sub}</Text>
            </View>
            {a.isNew ? <Pill label="New" tone="red" size={11} /> : null}
          </View>
        ))}
      </Card>
      <Card style={s.card}>
        <CardHead title="Upcoming Events" size={16} link="View Calendar" onLink={() => x.setTab('Events')} />
        {x.c.events.map((e) => (
          <View key={e.id} style={s.row}>
            <View style={s.date}>
              <Text style={s.dateMonth}>{e.month}</Text>
              <Text style={s.dateDay}>{e.day}</Text>
            </View>
            <View style={s.flex}>
              <Text style={s.strong}>{e.title}</Text>
              <Text style={s.small}>{`${e.time}  ·  ${e.place}`}</Text>
            </View>
          </View>
        ))}
      </Card>
      <Card style={s.card}>
        <CardHead title="Quick Actions" size={16} />
        <View style={s.quick}>
          {quick.map(([icon, label]) => (
            <Pressable key={label} style={s.quickItem} onPress={() => toast(label === 'Create Post' ? 'Write it in the box at the top of the feed.' : `${label}: coming to this page next.`)} accessibilityRole="button">
              <Icon name={icon} size={20} color={BRAND_BLUE} />
              <Text style={s.quickText}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </Card>
      <Card style={s.card}>
        <CardHead title="Community Guidelines" size={16} icon={<Icon name="shield" size={18} color={BRAND_BLUE} />} />
        <Text style={s.body}>{x.c.guidelines}</Text>
        <Text style={s.small}>Learner posts in moderated groups wait for a moderator. Nobody can direct-message a learner; staff reach learners in class or group threads only.</Text>
      </Card>
    </View>
  );
}

function Groups({ x }: { x: X }) {
  return (
    <View style={s.gridWrap}>
      {x.c.groups.map((g) => (
        <Card key={g.id} style={s.groupCard}>
          <Image decorative source={g.photo} style={s.groupCover} contentFit="cover" />
          <Text style={s.strong}>{g.name}</Text>
          <Text style={s.small}>{`${g.members} members · ${g.moderated ? 'Moderated' : 'Open to members'}`}</Text>
        </Card>
      ))}
    </View>
  );
}

function Moderation({ x }: { x: X }) {
  return (
    <Card style={s.card}>
      <CardHead title="Moderation Queue" size={16} subtitle="Learner posts in moderated spaces wait here before anyone else sees them." />
      {x.pending.length ? (
        x.pending.map((p) => (
          <View key={p.id} style={s.modRow}>
            <Image decorative source={p.avatar} style={s.avatar} contentFit="cover" />
            <View style={s.flex}>
              <Text style={s.strong}>{`${p.author} · ${p.context}`}</Text>
              <Text style={s.body}>{p.title}</Text>
            </View>
            <Btn label="Approve" kind="soft" height={34} onPress={() => x.approve(p.id)} />
            <Btn label="Remove" kind="outline" height={34} onPress={() => x.remove(p.id)} />
          </View>
        ))
      ) : (
        <Text style={s.small}>Nothing waiting for review.</Text>
      )}
    </Card>
  );
}

function Middle({ x }: { x: X }) {
  switch (x.tab) {
    case 'Groups':
      return <Groups x={x} />;
    case 'Announcements':
      return (
        <Card style={s.card}>
          <CardHead title="Announcements" size={16} />
          {x.c.announcements.map((a) => (
            <View key={a.id} style={s.rowTop}>
              <Icon name={a.icon} size={18} color={BRAND_BLUE} />
              <View style={s.flex}>
                <Text style={s.strong}>{a.title}</Text>
                <Text style={s.small}>{a.sub}</Text>
              </View>
            </View>
          ))}
        </Card>
      );
    case 'Events':
      return (
        <Card style={s.card}>
          <CardHead title="Events" size={16} />
          {x.c.events.map((e) => (
            <Text key={e.id} style={s.body}>{`${e.month} ${e.day} · ${e.title} · ${e.time} · ${e.place}`}</Text>
          ))}
        </Card>
      );
    case 'Polls':
      return (
        <Card style={s.card}>
          <CardHead title="Polls" size={16} />
          <Text style={s.small}>No polls yet. Create one from the composer to ask your community a question.</Text>
        </Card>
      );
    case 'Moderation':
      return <Moderation x={x} />;
    default:
      return <Feed x={x} />;
  }
}

function Page({ x, phone }: { x: X; phone: boolean }) {
  return (
    <>
      <HubHeader
        icon="people"
        title="School Community"
        subtitle="A safe and moderated space for your school to learn, share, collaborate and stay connected."
        phone={phone}
        right={<Btn label="Community Settings" icon="settings" kind="outline" height={40} onPress={() => toast('Choose who can post, which groups are moderated and how long posts are kept.')} />}
      />
      <HubTabs items={x.c.tabs} icons={x.c.tabIcons} active={x.tab} onChange={x.setTab} phone={phone} />
      {phone ? (
        <View style={s.stack}>
          <Middle x={x} />
          <RightRail x={x} />
        </View>
      ) : (
        <View style={s.cols}>
          <View style={s.left}>
            <LeftNav x={x} />
          </View>
          <View style={s.mid}>
            <Middle x={x} />
          </View>
          <View style={s.right}>
            <RightRail x={x} />
          </View>
        </View>
      )}
    </>
  );
}

/** School Community on the desktop. */
export function CommunityDesk({ a }: { a: Admin }) {
  const x = useCommunity(a);
  return (
    <AdminDesk me={a.me} search="Search Maple..." active="Community">
      <Page x={x} phone={false} />
    </AdminDesk>
  );
}

/** School Community on phones. */
export function CommunityPhone({ a }: { a: Admin }) {
  const x = useCommunity(a);
  return (
    <AdminPhone me={a.me}>
      <Page x={x} phone />
    </AdminPhone>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  stack: { gap: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  rowWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cols: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  left: { width: 230 },
  mid: { flex: 1, minWidth: 0 },
  right: { width: 360 },
  card: { gap: 12, padding: 18 },
  small: { fontSize: 12.5, lineHeight: 17, color: BODY },
  body: { fontSize: 13.5, lineHeight: 19, color: NAVY },
  strong: { fontSize: 13.5, fontWeight: '700', color: NAVY },
  link: { fontSize: 13, fontWeight: '600', color: BLUE },
  coverCard: { height: 130, overflow: 'hidden', padding: 0, justifyContent: 'flex-end' },
  cover: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  coverText: { padding: 14, fontSize: 17, fontWeight: '800', color: WHITE },
  navCard: { gap: 4, padding: 12 },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 40, paddingHorizontal: 10, borderRadius: 10 },
  navOn: { backgroundColor: Maple.blueSoft },
  navText: { flex: 1, fontSize: 14, color: NAVY },
  navTextOn: { fontWeight: '700', color: BRAND_BLUE },
  count: { minWidth: 22, overflow: 'hidden', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 10, fontSize: 12, fontWeight: '600', textAlign: 'center', color: NAVY, backgroundColor: Maple.blueSelected },
  divider: { height: 1, marginVertical: 8, backgroundColor: LINE },
  group: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  groupPhoto: { width: 40, height: 40, borderRadius: 10 },
  avatar: { width: 42, height: 42, borderRadius: 21 },
  composer: { flex: 1, minHeight: 42, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 21, borderWidth: 1, borderColor: LINE, fontSize: 14, color: NAVY },
  tool: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 34, paddingHorizontal: 12, borderRadius: 17, borderWidth: 1, borderColor: LINE },
  toolText: { fontSize: 13, color: NAVY },
  filter: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16 },
  filterOn: { borderWidth: 1.5, borderColor: BLUE, backgroundColor: Maple.blueSoft },
  filterText: { fontSize: 13.5, color: NAVY },
  filterTextOn: { fontWeight: '600', color: BLUE },
  author: { fontSize: 15, fontWeight: '700', color: NAVY },
  postTitle: { marginBottom: 4, fontSize: 16.5, fontWeight: '800', color: NAVY },
  file: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: LINE },
  pdf: { width: 36, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 6, backgroundColor: Maple.error },
  pdfText: { fontSize: 10.5, fontWeight: '800', color: WHITE },
  sidePhoto: { width: 150, height: 134, borderRadius: 12 },
  photos: { flexDirection: 'row', gap: 10 },
  photo: { flex: 1, height: 118, borderRadius: 12 },
  actions: { flexDirection: 'row', gap: 26, paddingTop: 4 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: 13.5, color: NAVY },
  liked: { color: BLUE, fontWeight: '600' },
  date: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: Maple.blueSoft },
  dateMonth: { fontSize: 12, color: BRAND_BLUE },
  dateDay: { fontSize: 19, fontWeight: '800', color: NAVY },
  quick: { flexDirection: 'row', gap: 8 },
  quickItem: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: LINE },
  quickText: { fontSize: 11.5, color: NAVY, textAlign: 'center' },
  gridWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  groupCard: { width: 220, gap: 6, padding: 12 },
  groupCover: { width: '100%', height: 110, borderRadius: 10 },
  modRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Maple.blueSelected },
});
