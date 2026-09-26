// Powered by OnSpace.AI
// Editorial Dashboard — Video Review & Management Screen
import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable,
  ScrollView, Dimensions, Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  VIDEO_CATALOG, VideoItem, getVideoThumbnail,
  getCatalogStats, PENDING_RESOLUTION_CATALOG, RESOLVED_CATALOG,
  TRUSTED_CHANNELS,
} from '../services/videoService';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../constants/theme';

const { width } = Dimensions.get('window');

type FilterTab = 'all' | 'pending_review' | 'pending_resolution' | 'approved' | 'rejected';

const TAB_LABELS: Record<FilterTab, string> = {
  all: 'All',
  pending_review: 'Pending Review',
  pending_resolution: 'Pending Resolution',
  approved: 'Approved',
  rejected: 'Rejected',
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Editorial Video Row ──────────────────────────────────────────────────────
function EditorialRow({
  video,
  onApprove,
  onReject,
  onFeature,
  onKidsSafe,
  onOpenYouTube,
}: {
  video: VideoItem;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onFeature: (id: string) => void;
  onKidsSafe: (id: string) => void;
  onOpenYouTube: (id: string) => void;
}) {
  const thumb = getVideoThumbnail(video);
  const [expanded, setExpanded] = useState(false);

  const statusColor = (() => {
    switch (video.review_status) {
      case 'Approved': return Colors.success;
      case 'Rejected': return Colors.error;
      case 'Pending Resolution': return Colors.warning;
      default: return Colors.gold;
    }
  })();

  return (
    <View style={styles.rowCard}>
      {/* Header row */}
      <Pressable style={styles.rowHeader} onPress={() => setExpanded(p => !p)}>
        <Image
          source={{ uri: thumb }}
          style={styles.rowThumb}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.rowMeta}>
          <Text style={styles.rowTitle} numberOfLines={expanded ? 4 : 2}>{video.title}</Text>
          <View style={styles.rowBadgesWrap}>
            <View style={[styles.rowBadge, { backgroundColor: statusColor + '22', borderColor: statusColor + '66' }]}>
              <Text style={[styles.rowBadgeText, { color: statusColor }]}>{video.review_status}</Text>
            </View>
            <View style={styles.rowBadgeGray}>
              <Text style={styles.rowBadgeGrayText}>{video.language.toUpperCase()}</Text>
            </View>
            {video.youtube_video_id ? (
              <View style={styles.rowBadgeGray}>
                <MaterialIcons name="check-circle" size={10} color={Colors.success} />
                <Text style={[styles.rowBadgeGrayText, { color: Colors.success }]}>ID</Text>
              </View>
            ) : (
              <View style={styles.rowBadgeGray}>
                <MaterialIcons name="pending" size={10} color={Colors.warning} />
                <Text style={[styles.rowBadgeGrayText, { color: Colors.warning }]}>No ID</Text>
              </View>
            )}
            {video.isFeatured ? (
              <View style={[styles.rowBadge, { backgroundColor: Colors.gold + '22', borderColor: Colors.gold + '66' }]}>
                <MaterialIcons name="star" size={10} color={Colors.gold} />
                <Text style={[styles.rowBadgeText, { color: Colors.gold }]}>Featured</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.rowChannel} numberOfLines={1}>{video.channel}</Text>
          {video.series ? <Text style={styles.rowSeries} numberOfLines={1}>{video.series}</Text> : null}
          {video.islamic_relevance_score !== undefined ? (
            <View style={styles.relevanceRow}>
              <Text style={styles.relevanceLabel}>Relevance:</Text>
              <View style={styles.relevanceBarBg}>
                <View style={[styles.relevanceBarFill, {
                  width: `${video.islamic_relevance_score}%`,
                  backgroundColor: video.islamic_relevance_score >= 80 ? Colors.success
                    : video.islamic_relevance_score >= 60 ? Colors.gold : Colors.error,
                }]} />
              </View>
              <Text style={styles.relevanceScore}>{video.islamic_relevance_score}</Text>
            </View>
          ) : null}
        </View>
        <MaterialIcons
          name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={20}
          color={Colors.textMuted}
        />
      </Pressable>

      {/* Expanded section */}
      {expanded ? (
        <View style={styles.rowExpanded}>
          {/* Details */}
          <View style={styles.detailGrid}>
            <DetailItem label="Category" value={video.category} />
            <DetailItem label="Content Type" value={video.content_type || '—'} />
            <DetailItem label="Rights Mode" value={video.rights_mode || '—'} />
            <DetailItem label="Embed Status" value={video.embed_status} />
            <DetailItem label="Priority" value={video.priority} />
            <DetailItem label="Audience" value={video.audience} />
            {video.youtube_video_id ? (
              <DetailItem label="YouTube ID" value={video.youtube_video_id} mono />
            ) : null}
            {video.episode_number ? (
              <DetailItem label="Episode" value={`S${video.season_number || 1}E${video.episode_number}`} />
            ) : null}
          </View>

          {/* Description */}
          {video.description ? (
            <Text style={styles.rowDesc} numberOfLines={4}>{video.description}</Text>
          ) : null}

          {/* Tags */}
          {video.tags && video.tags.length > 0 ? (
            <View style={styles.tagsWrap}>
              {video.tags.map(t => (
                <View key={t} style={styles.tagPill}>
                  <Text style={styles.tagText}>#{t}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* Action Buttons */}
          <View style={styles.actionsWrap}>
            <Pressable
              style={[styles.actionBtn, styles.approveBtn]}
              onPress={() => onApprove(video.id)}
            >
              <MaterialIcons name="check-circle" size={16} color="#fff" />
              <Text style={styles.actionBtnText}>Approve</Text>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={() => onReject(video.id)}
            >
              <MaterialIcons name="cancel" size={16} color="#fff" />
              <Text style={styles.actionBtnText}>Reject</Text>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, styles.featureBtn]}
              onPress={() => onFeature(video.id)}
            >
              <MaterialIcons name="star" size={16} color="#000" />
              <Text style={[styles.actionBtnText, { color: '#000' }]}>Feature</Text>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, styles.kidsBtn]}
              onPress={() => onKidsSafe(video.id)}
            >
              <MaterialIcons name="child-care" size={16} color="#fff" />
              <Text style={styles.actionBtnText}>Kids Safe</Text>
            </Pressable>
            {video.youtube_video_id ? (
              <Pressable
                style={[styles.actionBtn, styles.ytBtn]}
                onPress={() => onOpenYouTube(video.youtube_video_id!)}
              >
                <MaterialIcons name="play-circle-filled" size={16} color="#FF0000" />
                <Text style={[styles.actionBtnText, { color: '#FF0000' }]}>Preview</Text>
              </Pressable>
            ) : null}
          </View>

          {/* Rights Notice */}
          <View style={styles.rightsNotice}>
            <MaterialIcons name="info-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.rightsText}>
              Rights Mode: {video.rights_mode || 'youtube_embed'} · Do NOT download or re-upload third-party YouTube videos
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function DetailItem({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, mono && styles.detailMono]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

// ─── Trusted Channels Panel ───────────────────────────────────────────────────
function TrustedChannelRow({ channel }: { channel: typeof TRUSTED_CHANNELS[0] }) {
  return (
    <View style={styles.tcRow}>
      <View style={styles.tcIcon}>
        <MaterialIcons name="verified" size={18} color={Colors.gold} />
      </View>
      <View style={styles.tcInfo}>
        <Text style={styles.tcName}>{channel.nameAr || channel.name}</Text>
        <Text style={styles.tcHandle}>{channel.youtubeHandle} · Target: {channel.target_count} videos</Text>
        <Text style={styles.tcLang}>{channel.language.toUpperCase()} · Min {channel.minimum_duration_seconds / 60}min</Text>
      </View>
    </View>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function EditorialDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>('pending_review');
  const [activeSection, setActiveSection] = useState<'catalog' | 'channels' | 'pending_resolve'>('catalog');
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({});
  const [localFeatured, setLocalFeatured] = useState<Record<string, boolean>>({});
  const [localKidsSafe, setLocalKidsSafe] = useState<Record<string, boolean>>({});

  const stats = useMemo(() => getCatalogStats(), []);

  const filteredVideos = useMemo(() => {
    return VIDEO_CATALOG.filter(v => {
      const effectiveStatus = localStatuses[v.id] || v.review_status;
      if (activeTab === 'all') return true;
      if (activeTab === 'pending_review') return effectiveStatus === 'Pending Editorial Review';
      if (activeTab === 'pending_resolution') return effectiveStatus === 'Pending Resolution' || !v.youtube_video_id;
      if (activeTab === 'approved') return effectiveStatus === 'Approved';
      if (activeTab === 'rejected') return effectiveStatus === 'Rejected';
      return true;
    });
  }, [activeTab, localStatuses]);

  const handleApprove = useCallback((id: string) => {
    setLocalStatuses(p => ({ ...p, [id]: 'Approved' }));
  }, []);

  const handleReject = useCallback((id: string) => {
    setLocalStatuses(p => ({ ...p, [id]: 'Rejected' }));
  }, []);

  const handleFeature = useCallback((id: string) => {
    setLocalFeatured(p => ({ ...p, [id]: !p[id] }));
  }, []);

  const handleKidsSafe = useCallback((id: string) => {
    setLocalKidsSafe(p => ({ ...p, [id]: !p[id] }));
  }, []);

  const handleOpenYouTube = useCallback((youtubeId: string) => {
    Linking.openURL(`https://www.youtube.com/watch?v=${youtubeId}`);
  }, []);

  const getVideoWithLocalState = useCallback((video: VideoItem): VideoItem => ({
    ...video,
    review_status: (localStatuses[video.id] || video.review_status) as any,
    isFeatured: localFeatured[video.id] !== undefined ? localFeatured[video.id] : video.isFeatured,
    kids_safe: localKidsSafe[video.id] !== undefined ? localKidsSafe[video.id] : video.kids_safe,
  }), [localStatuses, localFeatured, localKidsSafe]);

  const renderItem = useCallback(({ item }: { item: VideoItem }) => (
    <EditorialRow
      video={getVideoWithLocalState(item)}
      onApprove={handleApprove}
      onReject={handleReject}
      onFeature={handleFeature}
      onKidsSafe={handleKidsSafe}
      onOpenYouTube={handleOpenYouTube}
    />
  ), [getVideoWithLocalState, handleApprove, handleReject, handleFeature, handleKidsSafe, handleOpenYouTube]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Editorial Dashboard</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{stats.pendingEditorial} pending</Text>
        </View>
      </View>

      {/* Section Switcher */}
      <View style={styles.sectionRow}>
        {(['catalog', 'channels', 'pending_resolve'] as const).map(sec => (
          <Pressable
            key={sec}
            style={[styles.secBtn, activeSection === sec && styles.secBtnActive]}
            onPress={() => setActiveSection(sec)}
          >
            <Text style={[styles.secText, activeSection === sec && styles.secTextActive]}>
              {sec === 'catalog' ? 'Catalog' : sec === 'channels' ? 'Channels' : 'Resolve Queue'}
            </Text>
          </Pressable>
        ))}
      </View>

      {activeSection === 'catalog' ? (
        <>
          {/* Stats */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}
            contentContainerStyle={styles.statsContent}>
            <StatCard label="Total" value={stats.total} color={Colors.primary} />
            <StatCard label="Resolved" value={stats.resolved} color={Colors.success} />
            <StatCard label="Pending Resolve" value={stats.pendingResolution} color={Colors.warning} />
            <StatCard label="Pending Review" value={stats.pendingEditorial} color={Colors.gold} />
            <StatCard label="Arabic" value={stats.byLanguage.ar} color="#C9A84C" />
            <StatCard label="Portuguese" value={stats.byLanguage.pt} color="#22C55E" />
            <StatCard label="French" value={stats.byLanguage.fr} color="#60A5FA" />
            <StatCard label="Indonesian" value={stats.byLanguage.id} color="#F97316" />
            <StatCard label="Urdu" value={stats.byLanguage.ur} color="#A78BFA" />
            <StatCard label="Persian" value={stats.byLanguage.fa} color="#FB7185" />
          </ScrollView>

          {/* Filter Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            style={styles.tabsScroll} contentContainerStyle={styles.tabsContent}>
            {Object.entries(TAB_LABELS).map(([key, label]) => {
              const count = key === 'all' ? VIDEO_CATALOG.length
                : key === 'pending_review' ? RESOLVED_CATALOG.filter(v => v.review_status === 'Pending Editorial Review').length
                : key === 'pending_resolution' ? PENDING_RESOLUTION_CATALOG.length
                : 0;
              return (
                <Pressable
                  key={key}
                  style={[styles.tabChip, activeTab === key && styles.tabChipActive]}
                  onPress={() => setActiveTab(key as FilterTab)}
                >
                  <Text style={[styles.tabChipText, activeTab === key && styles.tabChipTextActive]}>
                    {label}
                    {count > 0 ? ` (${count})` : ''}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* IMPORTANT notice */}
          <View style={styles.importantNotice}>
            <MaterialIcons name="security" size={13} color={Colors.gold} />
            <Text style={styles.importantText}>
              NEVER download or re-upload third-party YouTube videos · Use official YouTube player only · Verify rights before approving
            </Text>
          </View>

          {/* Video List */}
          <FlatList
            data={filteredVideos}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            initialNumToRender={10}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <MaterialIcons name="inbox" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyText}>No videos in this category</Text>
              </View>
            }
          />
        </>
      ) : activeSection === 'channels' ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.channelsContent}>
          <View style={styles.arabicTargetBox}>
            <Text style={styles.arabicTargetTitle}>Arabic Catalog Target</Text>
            <Text style={styles.arabicTargetNum}>{stats.arabicCatalogTarget}</Text>
            <Text style={styles.arabicTargetSub}>long-form Arabic videos to approve before launch</Text>
          </View>
          <Text style={styles.sectionHeader}>Trusted Channels ({TRUSTED_CHANNELS.length})</Text>
          {TRUSTED_CHANNELS.map(ch => (
            <TrustedChannelRow key={ch.id} channel={ch} />
          ))}
          <View style={styles.resolveInfoBox}>
            <MaterialIcons name="api" size={20} color={Colors.gold} />
            <Text style={styles.resolveInfoTitle}>resolveYouTubeVideo()</Text>
            <Text style={styles.resolveInfoText}>
              Use the videoResolverService to resolve RESOLVE_BY_API videos.{'\n'}
              Run from Supabase Edge Function with YouTube Data API key.{'\n'}
              Never auto-publish. All resolved videos enter Pending Editorial Review.
            </Text>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={PENDING_RESOLUTION_CATALOG}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.resolveHeader}>
              <MaterialIcons name="pending" size={20} color={Colors.warning} />
              <Text style={styles.resolveHeaderText}>
                {PENDING_RESOLUTION_CATALOG.length} videos waiting for YouTube ID resolution
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.resolveRow}>
              <View style={styles.resolveRowLeft}>
                <MaterialIcons name="link-off" size={16} color={Colors.warning} />
                <View style={styles.resolveInfo}>
                  <Text style={styles.resolveTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.resolveChannel}>{item.channel} · {item.language.toUpperCase()}</Text>
                  <Text style={styles.resolveCat}>{item.category}</Text>
                </View>
              </View>
              <View style={[styles.rowBadge, { backgroundColor: Colors.warning + '22', borderColor: Colors.warning + '66' }]}>
                <Text style={[styles.rowBadgeText, { color: Colors.warning }]}>Resolve</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 10, gap: Spacing.sm },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.surfaceCard, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, includeFontPadding: false },
  headerBadge: { backgroundColor: Colors.gold + '22', borderRadius: BorderRadius.full, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: Colors.gold + '55' },
  headerBadgeText: { fontSize: 11, color: Colors.gold, fontWeight: FontWeight.semibold, includeFontPadding: false },
  // Section
  sectionRow: { flexDirection: 'row', marginHorizontal: Spacing.md, marginBottom: 8, backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.md, padding: 3, gap: 3 },
  secBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: BorderRadius.sm },
  secBtnActive: { backgroundColor: Colors.primary },
  secText: { fontSize: 11, color: Colors.textMuted, fontWeight: FontWeight.medium, includeFontPadding: false },
  secTextActive: { color: Colors.textPrimary, fontWeight: FontWeight.bold },
  // Stats
  statsScroll: { flexGrow: 0, marginBottom: 4 },
  statsContent: { paddingHorizontal: Spacing.md, gap: 8, paddingVertical: 4 },
  statCard: { backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.md, padding: 10, minWidth: 90, borderLeftWidth: 3, ...Shadow.sm },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, includeFontPadding: false },
  statLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 2, includeFontPadding: false },
  // Filter Tabs
  tabsScroll: { flexGrow: 0, marginBottom: 4 },
  tabsContent: { paddingHorizontal: Spacing.md, gap: 6 },
  tabChip: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border },
  tabChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabChipText: { fontSize: 12, color: Colors.textSecondary, fontWeight: FontWeight.medium, includeFontPadding: false },
  tabChipTextActive: { color: Colors.textPrimary, fontWeight: FontWeight.bold },
  // Notice
  importantNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: Colors.gold + '11', borderRadius: BorderRadius.md, marginHorizontal: Spacing.md, padding: 8, marginBottom: 8, borderWidth: 1, borderColor: Colors.gold + '33' },
  importantText: { flex: 1, fontSize: 10, color: Colors.textMuted, lineHeight: 15, includeFontPadding: false },
  // List
  listContent: { padding: Spacing.md, gap: 8, paddingBottom: 80 },
  emptyWrap: { alignItems: 'center', paddingTop: 60, gap: Spacing.sm },
  emptyText: { fontSize: FontSize.body, color: Colors.textMuted, includeFontPadding: false },
  // Row Card
  rowCard: { backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', ...Shadow.sm },
  rowHeader: { flexDirection: 'row', gap: 10, padding: Spacing.sm, alignItems: 'flex-start' },
  rowThumb: { width: 90, height: 60, borderRadius: BorderRadius.sm, backgroundColor: Colors.surfaceElevated, flexShrink: 0 },
  rowMeta: { flex: 1 },
  rowTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary, lineHeight: 18, includeFontPadding: false },
  rowBadgesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  rowBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1 },
  rowBadgeText: { fontSize: 10, fontWeight: FontWeight.semibold, includeFontPadding: false },
  rowBadgeGray: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: Colors.surfaceElevated, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  rowBadgeGrayText: { fontSize: 10, color: Colors.textMuted, includeFontPadding: false },
  rowChannel: { fontSize: 11, color: Colors.textMuted, marginTop: 3, includeFontPadding: false },
  rowSeries: { fontSize: 10, color: Colors.gold, marginTop: 1, includeFontPadding: false },
  relevanceRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  relevanceLabel: { fontSize: 10, color: Colors.textMuted, includeFontPadding: false },
  relevanceBarBg: { flex: 1, height: 4, backgroundColor: Colors.border, borderRadius: 2, overflow: 'hidden' },
  relevanceBarFill: { height: '100%', borderRadius: 2 },
  relevanceScore: { fontSize: 10, color: Colors.textSecondary, fontWeight: FontWeight.bold, includeFontPadding: false },
  // Expanded
  rowExpanded: { padding: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border, gap: 10 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  detailItem: { minWidth: '45%', gap: 2 },
  detailLabel: { fontSize: 10, color: Colors.textMuted, includeFontPadding: false },
  detailValue: { fontSize: 11, color: Colors.textSecondary, fontWeight: FontWeight.medium, includeFontPadding: false },
  detailMono: { fontFamily: 'monospace', fontSize: 10 },
  rowDesc: { fontSize: 11, color: Colors.textMuted, lineHeight: 17, includeFontPadding: false },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tagPill: { backgroundColor: Colors.surfaceElevated, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  tagText: { fontSize: 10, color: Colors.textMuted, includeFontPadding: false },
  actionsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: BorderRadius.md, paddingHorizontal: 12, paddingVertical: 8 },
  actionBtnText: { fontSize: 12, fontWeight: FontWeight.semibold, color: '#fff', includeFontPadding: false },
  approveBtn: { backgroundColor: Colors.success },
  rejectBtn: { backgroundColor: Colors.error },
  featureBtn: { backgroundColor: Colors.gold },
  kidsBtn: { backgroundColor: '#7C3AED' },
  ytBtn: { backgroundColor: Colors.surfaceElevated, borderWidth: 1, borderColor: '#FF000055' },
  rightsNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: 4, backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.sm, padding: 6, marginTop: 4 },
  rightsText: { flex: 1, fontSize: 10, color: Colors.textMuted, lineHeight: 14, includeFontPadding: false },
  // Channels section
  channelsContent: { padding: Spacing.md, gap: 10, paddingBottom: 80 },
  arabicTargetBox: { backgroundColor: Colors.primary + '22', borderRadius: BorderRadius.xl, padding: Spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: Colors.primary + '55' },
  arabicTargetTitle: { fontSize: FontSize.sm, color: Colors.textSecondary, includeFontPadding: false },
  arabicTargetNum: { fontSize: 48, fontWeight: FontWeight.extrabold, color: Colors.gold, lineHeight: 56, includeFontPadding: false },
  arabicTargetSub: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', includeFontPadding: false },
  sectionHeader: { fontSize: FontSize.body, fontWeight: FontWeight.bold, color: Colors.textSecondary, marginTop: 8, includeFontPadding: false },
  tcRow: { flexDirection: 'row', gap: Spacing.sm, backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.lg, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  tcIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.gold + '55' },
  tcInfo: { flex: 1 },
  tcName: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary, includeFontPadding: false },
  tcHandle: { fontSize: 11, color: Colors.textMuted, marginTop: 2, includeFontPadding: false },
  tcLang: { fontSize: 10, color: Colors.gold, marginTop: 2, includeFontPadding: false },
  resolveInfoBox: { backgroundColor: Colors.gold + '11', borderRadius: BorderRadius.lg, padding: Spacing.md, gap: 6, borderWidth: 1, borderColor: Colors.gold + '33' },
  resolveInfoTitle: { fontSize: FontSize.body, fontWeight: FontWeight.bold, color: Colors.gold, fontFamily: 'monospace', includeFontPadding: false },
  resolveInfoText: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18, includeFontPadding: false },
  // Resolve queue
  resolveHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.warning + '11', borderRadius: BorderRadius.md, padding: Spacing.sm, marginBottom: 8, borderWidth: 1, borderColor: Colors.warning + '33' },
  resolveHeaderText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, includeFontPadding: false },
  resolveRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.lg, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  resolveRowLeft: { flex: 1, flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  resolveInfo: { flex: 1 },
  resolveTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textPrimary, includeFontPadding: false },
  resolveChannel: { fontSize: 11, color: Colors.textMuted, marginTop: 2, includeFontPadding: false },
  resolveCat: { fontSize: 10, color: Colors.gold, marginTop: 2, includeFontPadding: false },
});
