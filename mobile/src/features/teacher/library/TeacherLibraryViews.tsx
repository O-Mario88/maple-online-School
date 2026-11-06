import { Image } from '@/components/picture';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import {
  TeacherGrowSideNav,
  type TeacherMe,
  TeacherPhoneTop,
  TeacherTopBar,
} from '@/features/teacher/frame/TeacherFrame';
import { BLUE, BODY, INK, MUTED, Panel } from '@/features/teacher/frame/TeacherParts';
import { toast } from '@/lib/toast';
import type { LibraryFileCard, TeacherLibrary } from '@/mock/teacher-library';
import { TEACHER_LIBRARY_REF_WIDTH, s, s as deskS } from './TeacherLibraryViews.styles';
import { phoneS } from './TeacherLibraryViews.phoneStyles';
import { Maple } from '@/constants/maple';

export { TEACHER_LIBRARY_REF_WIDTH };

/**
 * Image 4 — Teacher Resource Library & Co-Teaching Collections (`/(teacher)/library`).
 * Manage uploaded worksheets, past papers, slide decks, and shared school department folders.
 */
export function TeacherLibraryDesk({ lib, me, phone = false }: { lib: TeacherLibrary; me: TeacherMe; phone?: boolean }) {
  // Phones: the same page without the desktop top bar and side menu, stacked in one column.
  const s = phone ? phoneS : deskS;
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeLeftFolder, setActiveLeftFolder] = useState('lf-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [inspectorTab, setInspectorTab] = useState<'Details' | 'Share' | 'Versions'>('Details');
  const [selectedFileTitle, setSelectedFileTitle] = useState(lib.selectedFile.title);

  const filteredFiles = lib.files.filter(
    (f) =>
      !searchQuery.trim() ||
      f.title.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

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
        {/* Left Sidebar with Storage Usage Card */}
        {phone ? null : (
          <TeacherGrowSideNav active="Library" growItems={lib.growNav}>
            <View style={s.storageCard}>
              <Text style={s.storageTitle}>Storage Usage</Text>
              <Text style={s.storageSub}>{lib.storageUsed}</Text>
              <View style={s.storageTrack}>
                <View
                  style={[s.storageFill, { width: `${lib.storagePct}%` }]}
                />
              </View>
              <Pressable
                style={s.upgradeStorageBtn}
                onPress={() => toast('Upgrading Educator Cloud Storage to 100 GB.')}>
                <Icon name="trophy" size={11} color={BLUE} />
                <Text style={s.upgradeStorageText}>Upgrade Storage</Text>
              </Pressable>
            </View>
          </TeacherGrowSideNav>
        )}

        {/* Center Main Column */}
        <View style={s.centerCol}>
          {/* Header Row */}
          <View style={s.headerRow}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={s.pageTitle}>Resource Library</Text>
              <Text style={s.pageSub}>
                Manage your teaching resources, organize files, and collaborate with colleagues.
              </Text>
            </View>

            <View style={s.headerBtns}>
              <Pressable
                style={s.outlineTopBtn}
                onPress={() => toast('Opened Trash (3 recently deleted items).')}>
                <Icon name="trash" size={12} color={INK} />
                <Text style={s.outlineTopBtnText}>Trash</Text>
              </Pressable>
              <Pressable
                style={s.outlineTopBtn}
                onPress={() => toast('Created new folder in O-Level Mathematics.')}>
                <Icon name="folder" size={12} color={INK} />
                <Text style={s.outlineTopBtnText}>New Folder</Text>
              </Pressable>
              <Pressable
                style={s.uploadTopBtn}
                onPress={() => toast('Uploading teaching resources to O-Level Mathematics...')}>
                <Icon name="upload" size={12} color={Maple.surface} />
                <Text style={s.uploadTopBtnText}>Upload Files</Text>
              </Pressable>
            </View>
          </View>

          {/* 6 Category Filter Tiles */}
          <View style={s.categoriesRow}>
            {lib.categories.map((cat) => {
              const on = activeCategory === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  style={[s.categoryTile, on && s.categoryTileOn]}
                  onPress={() => setActiveCategory(cat.id)}>
                  <View style={[s.categoryIconBox, { backgroundColor: cat.bg }]}>
                    <Icon name={cat.icon} size={15} color={cat.color} />
                  </View>
                  <View style={{ gap: 1 }}>
                    <Text style={s.categoryTitle}>{cat.title}</Text>
                    <Text style={s.categoryCount}>{cat.countLabel}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Middle Explorer Split: Left Folders Tree + Right File Grid */}
          <View style={s.explorerSplit}>
            {/* Left Folders Tree Card */}
            <Panel style={s.foldersPanel}>
              <View style={s.foldersHeaderRow}>
                <Text style={s.foldersHeading}>Folders</Text>
                <Pressable
                  style={s.miniNewFolderBtn}
                  onPress={() => toast('Added new subfolder.')}>
                  <Icon name="plus" size={9} color={BLUE} />
                  <Text style={s.miniNewFolderText}>New Folder</Text>
                </Pressable>
              </View>

              <View style={s.leftFoldersList}>
                {lib.leftFolders.map((lf) => {
                  const on = activeLeftFolder === lf.id;
                  return (
                    <Pressable
                      key={lf.id}
                      style={[s.leftFolderRow, on && s.leftFolderRowOn]}
                      onPress={() => setActiveLeftFolder(lf.id)}>
                      <View
                        style={[
                          s.folderShapeSmall,
                          { backgroundColor: lf.color },
                        ]}
                      />
                      <View style={{ flex: 1, gap: 1 }}>
                        <Text
                          style={[
                            s.leftFolderTitle,
                            on && { color: BLUE },
                          ]}
                          numberOfLines={1}>
                          {lf.title}
                        </Text>
                        <Text style={s.leftFolderSub}>{lf.sub}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </Panel>

            {/* Right File Grid Card */}
            <Panel style={s.filesGridPanel}>
              {/* Breadcrumb */}
              <View style={s.breadcrumbRow}>
                <Text style={s.breadcrumbLink}>My Resources</Text>
                <Icon name="chevronRight" size={10} color={MUTED} />
                <Text style={s.breadcrumbCurrent}>O-Level Mathematics</Text>
              </View>

              {/* Search & Controls */}
              <View style={s.gridControlsRow}>
                <View style={s.searchBox}>
                  <Icon name="search" size={11} color={MUTED} />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search files and folders..."
                    placeholderTextColor={MUTED}
                    style={s.searchInput}
                  />
                </View>

                <Pressable
                  style={s.ctrlBtn}
                  onPress={() => toast('Filtered files by type & tag.')}>
                  <Icon name="list" size={11} color={INK} />
                  <Text style={s.ctrlBtnText}>Filter</Text>
                </Pressable>

                <View style={s.sortSelect}>
                  <Text style={s.ctrlBtnText}>Last Modified</Text>
                  <Icon name="chevronDown" size={9} color={INK} />
                </View>

                <View style={s.viewToggleWrap}>
                  <Pressable
                    style={[
                      s.viewIconBtn,
                      viewMode === 'grid' && s.viewIconBtnOn,
                    ]}
                    onPress={() => setViewMode('grid')}>
                    <Icon
                      name="grid"
                      size={11}
                      color={viewMode === 'grid' ? BLUE : BODY}
                    />
                  </Pressable>
                  <Pressable
                    style={[
                      s.viewIconBtn,
                      viewMode === 'list' && s.viewIconBtnOn,
                    ]}
                    onPress={() => setViewMode('list')}>
                    <Icon
                      name="list"
                      size={11}
                      color={viewMode === 'list' ? BLUE : BODY}
                    />
                  </Pressable>
                </View>
              </View>

              {/* Row 1: 4 Subfolder Cards */}
              <View style={s.fourColRow}>
                {lib.subFolders.map((sf) => (
                  <Pressable
                    key={sf.id}
                    style={s.subFolderCard}
                    onPress={() => toast(`Opened folder "${sf.title}" (${sf.filesLabel}).`)}>
                    <View style={s.subFolderTop}>
                      <View style={s.bigFolderGraphic}>
                        <View
                          style={[
                            s.bigFolderTab,
                            { backgroundColor: sf.folderColor },
                          ]}
                        />
                        <View
                          style={[
                            s.bigFolderBody,
                            { backgroundColor: sf.folderColor },
                          ]}
                        />
                      </View>
                      <Text style={s.dotsMenu}>•••</Text>
                    </View>

                    <View style={s.subFolderMetaRow}>
                      <View
                        style={[
                          s.miniTypeBadge,
                          { backgroundColor: sf.badgeBg },
                        ]}>
                        <Text style={s.miniTypeBadgeText}>{sf.badgeGlyph}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.subFolderTitle} numberOfLines={1}>
                          {sf.title}
                        </Text>
                        <Text style={s.subFolderCount}>{sf.filesLabel}</Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>

              {/* Rows 2 & 3: 8 File Cards */}
              <View style={s.filesGridWrap}>
                {filteredFiles.map((file) => (
                  <Pressable
                    key={file.id}
                    style={s.fileCard}
                    onPress={() =>
                      setSelectedFileTitle(file.title.replace('\n', ' '))
                    }>
                    <FileThumbnailPreview file={file} />
                    <View style={s.fileCardBody}>
                      <View
                        style={[
                          s.fileKindBadge,
                          { backgroundColor: file.badgeColor },
                        ]}>
                        <Text style={s.fileKindBadgeText}>{file.badgeText}</Text>
                      </View>
                      <View style={{ flex: 1, gap: 1 }}>
                        <Text style={s.fileCardTitle}>{file.title}</Text>
                        <Text style={s.fileCardMeta}>{file.meta}</Text>
                        <Text style={s.fileCardMeta}>{file.date}</Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </Panel>
          </View>

          {/* Bottom Card: Co-Teaching Collections */}
          <Panel style={s.collectionsPanel}>
            <View style={s.collectionsHeader}>
              <View style={{ flex: 1, gap: 1 }}>
                <Text style={s.sectionTitle}>Co-Teaching Collections</Text>
                <Text style={s.pageSub}>
                  Shared resource collections with your colleagues and school departments.
                </Text>
              </View>
              <View style={s.collectionsHeaderRight}>
                <Text style={s.viewAllLink}>View All</Text>
                <Pressable
                  style={s.newCollectionBtn}
                  onPress={() => toast('Created new shared Co-Teaching Collection.')}>
                  <Icon name="plus" size={11} color={Maple.surface} />
                  <Text style={s.newCollectionBtnText}>New Collection</Text>
                </Pressable>
              </View>
            </View>

            <View style={s.collectionsRow}>
              {lib.collections.map((col) => (
                <Pressable
                  key={col.id}
                  style={s.collectionCard}
                  onPress={() => toast(`Opened ${col.title} (${col.stats})`)}>
                  <View style={s.collectionTopRow}>
                    <View
                      style={[
                        s.collectionIconTile,
                        { backgroundColor: col.color },
                      ]}>
                      <Icon name={col.icon} size={15} color={Maple.surface} />
                    </View>
                    <View style={{ flex: 1, gap: 1 }}>
                      <View style={s.collectionTitleRow}>
                        <Text style={s.collectionTitle} numberOfLines={1}>
                          {col.title}
                        </Text>
                        <Text style={s.dotsVert}>⋮</Text>
                      </View>
                      <Text style={s.collectionSub}>{col.subtitle}</Text>
                      <Text style={s.collectionStats}>{col.stats}</Text>
                    </View>
                  </View>

                  <View style={s.avatarStackRow}>
                    {col.faces.map((face, idx) => (
                      <Image
                        key={idx}
                        source={face}
                        style={[
                          s.stackAvatar,
                          idx > 0 && { marginLeft: -6 },
                        ]}
                        contentFit="cover"
                      />
                    ))}
                    {col.extraCount ? (
                      <View style={s.extraCountCircle}>
                        <Text style={s.extraCountText}>{col.extraCount}</Text>
                      </View>
                    ) : null}
                  </View>
                </Pressable>
              ))}
            </View>
          </Panel>
        </View>

        {/* Right Column: Selected File Inspector + Popular Resources */}
        <View style={s.rightCol}>
          {/* Card 1: Selected File Inspector */}
          <Panel style={s.inspectorCard}>
            {/* Worksheet Document Preview Box */}
            <View style={s.docPreviewSheet}>
              <View style={s.docCloseCircle}>
                <Icon name="close" size={9} color={INK} />
              </View>
              <Text style={s.docSheetHead}>O-Level Maths</Text>
              <Text style={s.docSheetTitle}>Worksheet 3 – Functions</Text>
              <View style={s.docSheetBody}>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={s.docTinyLine}>1. Given f(x) = 2x + 3, find f(4) and f(−2).</Text>
                  <Text style={s.docTinyLine}>2. Solve g(x) = x² − 4x for g(x) = 0.</Text>
                  <Text style={s.docTinyLine}>3. Sketch the graph of y = 2x − 1.</Text>
                  <Text style={s.docTinyLine}>4. Find the inverse f⁻¹(x).</Text>
                </View>
                <View style={s.docMiniGraph}>
                  <View style={s.graphAxisV} />
                  <View style={s.graphAxisH} />
                  <View style={s.graphDiagLine} />
                </View>
              </View>
            </View>

            {/* File Title Row */}
            <View style={s.inspectorTitleRow}>
              <View style={s.wordBigTile}>
                <Text style={s.wordBigTileText}>W</Text>
              </View>
              <View style={{ flex: 1, gap: 1 }}>
                <Text style={s.inspectorFileTitle} numberOfLines={1}>
                  {selectedFileTitle}
                </Text>
                <Text style={s.inspectorFileMeta}>{lib.selectedFile.meta}</Text>
              </View>
            </View>

            {/* Inspector Tabs */}
            <View style={s.inspectorTabs}>
              {(['Details', 'Share', 'Versions'] as const).map((t) => {
                const on = inspectorTab === t;
                return (
                  <Pressable
                    key={t}
                    style={[s.inspectorTab, on && s.inspectorTabOn]}
                    onPress={() => setInspectorTab(t)}>
                    <Text
                      style={[
                        s.inspectorTabText,
                        on && s.inspectorTabTextOn,
                      ]}>
                      {t}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Metadata Key-Value Rows */}
            <View style={s.metaTable}>
              <View style={s.metaRow}>
                <Text style={s.metaKey}>Type</Text>
                <Text style={s.metaVal}>{lib.selectedFile.type}</Text>
              </View>
              <View style={s.metaRow}>
                <Text style={s.metaKey}>Subject</Text>
                <Text style={s.metaVal}>{lib.selectedFile.subject}</Text>
              </View>
              <View style={s.metaRow}>
                <Text style={s.metaKey}>Level</Text>
                <Text style={s.metaVal}>{lib.selectedFile.level}</Text>
              </View>
              <View style={s.metaRow}>
                <Text style={s.metaKey}>Tags</Text>
                <View style={s.tagsWrap}>
                  {lib.selectedFile.tags.map((tg) => (
                    <View key={tg} style={s.tagPill}>
                      <Text style={s.tagPillText}>{tg}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={[s.metaRow, { alignItems: 'flex-start' }]}>
                <Text style={s.metaKey}>Description</Text>
                <Text style={[s.metaVal, { flex: 1, lineHeight: 13 }]}>
                  {lib.selectedFile.description}
                </Text>
              </View>
              <View style={s.metaRow}>
                <Text style={s.metaKey}>Shared with</Text>
                <View style={s.sharedWithRight}>
                  <View style={s.avatarStackRow}>
                    {lib.selectedFile.sharedFaces.map((f, i) => (
                      <Image
                        key={i}
                        source={f}
                        style={[
                          s.stackAvatar,
                          i > 0 && { marginLeft: -6 },
                        ]}
                        contentFit="cover"
                      />
                    ))}
                    <View style={s.extraCountCircle}>
                      <Text style={s.extraCountText}>
                        {lib.selectedFile.sharedExtra}
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    style={s.manageSmallBtn}
                    onPress={() => toast('Managing co-teacher permissions.')}>
                    <Text style={s.manageSmallText}>Manage</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Open + Share / Download */}
            <Pressable
              style={s.openFileBtn}
              onPress={() => toast(`Opened ${selectedFileTitle}`)}>
              <Text style={s.openFileBtnText}>Open</Text>
            </Pressable>

            <View style={s.inspectorBottomBtns}>
              <Pressable
                style={s.secActionBtn}
                onPress={() => toast(`Shared link to ${selectedFileTitle}`)}>
                <Icon name="share" size={11} color={INK} />
                <Text style={s.secActionText}>Share</Text>
              </Pressable>
              <Pressable
                style={s.secActionBtn}
                onPress={() => toast(`Downloaded ${selectedFileTitle}`)}>
                <Icon name="download" size={11} color={INK} />
                <Text style={s.secActionText}>Download</Text>
              </Pressable>
              <Pressable style={s.dotsSquareBtn}>
                <Text style={s.dotsMenu}>•••</Text>
              </Pressable>
            </View>
          </Panel>

          {/* Card 2: Popular Resources */}
          <Panel style={s.popularCard}>
            <View style={s.popularHeaderRow}>
              <View style={s.popularTitleGroup}>
                <Text style={s.flameEmoji}>🔥</Text>
                <Text style={s.sectionTitle}>Popular Resources</Text>
              </View>
              <Text style={s.viewAllLink}>View All</Text>
            </View>

            <View style={s.popularList}>
              {lib.popularResources.map((pr) => (
                <View key={pr.id} style={s.popularRow}>
                  <View
                    style={[
                      s.fileKindBadge,
                      { backgroundColor: pr.badgeColor },
                    ]}>
                    <Text style={s.fileKindBadgeText}>{pr.badgeText}</Text>
                  </View>
                  <View style={{ flex: 1, gap: 1 }}>
                    <Text style={s.popularRowTitle} numberOfLines={1}>
                      {pr.title}
                    </Text>
                    <Text style={s.popularRowMeta}>{pr.meta}</Text>
                  </View>
                  <Pressable
                    style={s.popularDownloadBtn}
                    onPress={() => toast(`Downloaded ${pr.title}`)}>
                    <Icon name="download" size={11} color={BLUE} />
                  </Pressable>
                </View>
              ))}
            </View>
          </Panel>
        </View>
      </View>
    </View>
  );
}

export function TeacherLibraryPhone({ lib, me }: { lib: TeacherLibrary; me: TeacherMe }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: Maple.blueSelected }}>
      <TeacherPhoneTop me={me} />
      <TeacherLibraryDesk lib={lib} me={me} phone />
    </ScrollView>
  );
}

function FileThumbnailPreview({ file }: { file: LibraryFileCard }) {
  if (file.kind === 'mp4' && file.videoThumb) {
    return (
      <View style={s.thumbBox}>
        <Image
          source={file.videoThumb}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
        <View style={s.thumbVideoDur}>
          <Text style={s.thumbVideoDurText}>{file.videoDuration}</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={s.thumbBox}>
      <View
        style={[
          s.thumbTopStripe,
          { backgroundColor: file.badgeColor },
        ]}
      />
      <View style={s.thumbDocLines}>
        <View style={s.thumbMiniBadge}>
          <Text style={[s.thumbMiniBadgeText, { color: file.badgeColor }]}>
            {file.badgeText}
          </Text>
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <View style={s.mockLineWide} />
          <View style={s.mockLineMed} />
          <View style={s.mockLineShort} />
        </View>
      </View>
      <Text style={s.thumbDots}>•••</Text>
    </View>
  );
}
