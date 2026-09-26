// Powered by OnSpace.AI
// Watch Tab — Live Supabase Query
//
// SOURCE OF TRUTH: Supabase open_license_videos
//   WHERE processing_status = 'ready' AND (published = true OR device_tested = true)
//
// A video appears here when and only when it is published in the database.
// No static catalog required — new published videos appear automatically.

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  Dimensions, ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../hooks/useLanguage';
import { TranslationKey } from '../../constants/i18n';
import {
  usePublishedVideos,
  getPublishedVideoTitle,
  getPublishedVideoCategory,
  getVideoThumbnailSources,
  formatPublishedDuration,
  PublishedVideo,
} from '../../hooks/usePublishedVideos';
import { useContinueWatching } from '../../hooks/useWatchProgress';
import { formatPosition } from '../../services/watchProgressService';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';

const { width } = Dimensions.get('window');
const CARD_W = Math.min(width * 0.42, 195);
const HERO_H = Math.round(width * 0.58);
const CONTINUE_CARD_W = Math.min(width * 0.55, 240);

// ─── Category definitions ─────────────────────────────────────────────────────

interface WatchCategory {
  key: string;
  labelKey: TranslationKey;
  icon: string;
}

const WATCH_CATEGORIES: WatchCategory[] = [
  { key: 'all',                  labelKey: 'allCategories',  icon: 'grid-view' },
  { key: 'long_documentary',     labelKey: 'documentaries',  icon: 'slow-motion-video' },
  { key: 'islamic_history',      labelKey: 'seerahHistory',  icon: 'history-edu' },
  { key: 'general_documentary',  labelKey: 'movies',         icon: 'movie' },
  { key: 'hajj_documentary',     labelKey: 'hajjVideos',     icon: 'flight' },
  { key: 'makkah_madinah',       labelKey: 'sacredPlaces',   icon: 'place' },
  { key: 'islamic_civilization', labelKey: 'islamBasics',    icon: 'account-balance' },
  { key: 'architecture',         labelKey: 'islamBasics',    icon: 'account-balance' },
  { key: 'sufi_heritage',        labelKey: 'learnSection',   icon: 'self-improvement' },
  { key: 'eid',                  labelKey: 'ramadan',        icon: 'celebration' },
  { key: 'new_muslims',          labelKey: 'learn',          icon: 'people' },
];

const LICENSE_COLORS: Record<string, string> = {
  'CC BY':         '#3B82F6',
  'CC BY-SA':      '#6366F1',
  'CC0':           '#22C55E',
  'Public Domain': '#22C55E',
  'cc_by':         '#3B82F6',
  'cc_by_sa':      '#6366F1',
  'cc0':           '#22C55E',
  'public_domain': '#22C55E',
  'cc_by_nc_nd':   '#F59E0B',
  'us_government': '#22C55E',
};

function getLicenseColor(record: PublishedVideo): string {
  const lic = record.license_name || record.license || '';
  return LICENSE_COLORS[lic] || '#3B82F6';
}

function getLicenseLabel(record: PublishedVideo): string {
  const lic = record.license_name || record.license || '';
  if (lic.includes('NC-ND') || lic === 'cc_by_nc_nd') return 'CC BY-NC-ND';
  if (lic.includes('BY-SA') || lic === 'cc_by_sa') return 'CC BY-SA';
  if (lic.includes('BY') || lic === 'cc_by') return 'CC BY';
  if (lic === 'cc0') return 'CC0';
  if (lic === 'public_domain' || lic === 'us_government') return 'PD';
  return lic.length > 12 ? 'Open' : lic;
}

// ─── Continue Watching Card ───────────────────────────────────────────────────

function ContinueCard({
  video, positionSeconds, progressPercent, onPress, language, isRTL, resumeLabel,
}: {
  video: PublishedVideo;
  positionSeconds: number;
  progressPercent: number;
  onPress: () => void;
  language: string;
  isRTL: boolean;
  resumeLabel: string;
}) {
  const title = getPublishedVideoTitle(video, language);
  const sources = getVideoThumbnailSources(video);
  return (
    <Pressable style={({ pressed }) => [s.continueCard, pressed && s.pressed]} onPress={onPress}>
      <View style={s.continueThumbWrap}>
        <Image source={sources as any} style={s.continueThumb} contentFit="cover" transition={200} />
        <View style={s.continuePlayOverlay}>
          <MaterialIcons name="play-circle-filled" size={36} color="rgba(255,255,255,0.9)" />
        </View>
        <View style={s.continueProgressTrack}>
          <View style={[s.continueProgressFill, { width: `${Math.min(100, progressPercent)}%` as any }]} />
        </View>
        <View style={s.resumeBadge}>
          <MaterialIcons name="history" size={10} color={Colors.gold} />
          <Text style={s.resumeBadgeText}>{resumeLabel} {formatPosition(positionSeconds)}</Text>
        </View>
      </View>
      <View style={[s.continueInfo, isRTL && { alignItems: 'flex-end' }]}>
        <Text style={[s.continueTitle, isRTL && s.textRight]} numberOfLines={2}>{title}</Text>
        <Text style={s.continueDuration}>{formatPublishedDuration(video.duration_seconds)}</Text>
      </View>
    </Pressable>
  );
}

// ─── Hero Card ───────────────────────────────────────────────────────────────

function HeroCard({ video, onPress, language, isRTL, watchNowLabel, longFilmLabel }: {
  video: PublishedVideo; onPress: () => void; language: string; isRTL: boolean;
  watchNowLabel: string; longFilmLabel: string;
}) {
  const title = getPublishedVideoTitle(video, language);
  const sources = getVideoThumbnailSources(video);
  const licenseColor = getLicenseColor(video);
  const licenseLabel = getLicenseLabel(video);
  const durationLabel = formatPublishedDuration(video.duration_seconds);

  return (
    <Pressable style={({ pressed }) => [s.heroCard, pressed && s.pressed]} onPress={onPress}>
      <Image source={sources as any} style={StyleSheet.absoluteFillObject} contentFit="cover" transition={250} />
      <LinearGradient
        colors={['transparent', 'rgba(6,15,10,0.5)', 'rgba(6,15,10,0.96)']}
        style={StyleSheet.absoluteFillObject}
        locations={[0.25, 0.6, 1]}
      />
      <View style={[s.heroLicenseBadge, { borderColor: licenseColor + '55' }]}>
        <MaterialIcons name="verified-user" size={10} color={licenseColor} />
        <Text style={[s.heroLicenseBadgeText, { color: licenseColor }]}>{licenseLabel}</Text>
      </View>
      {(video.duration_seconds || 0) >= 1800 && (
        <View style={s.heroLongPill}>
          <MaterialIcons name="slow-motion-video" size={10} color={Colors.gold} />
          <Text style={s.heroLongPillText}>{longFilmLabel}</Text>
        </View>
      )}
      <View style={[s.heroInfo, isRTL && s.alignEnd]}>
        {video.series_name ? (
          <Text style={[s.heroSeriesLabel, isRTL && s.textRight]} numberOfLines={1}>{video.series_name}</Text>
        ) : null}
        <Text style={[s.heroTitle, isRTL && s.textRight]} numberOfLines={2}>{title}</Text>
        {video.creator ? (
          <Text style={[s.heroCreator, isRTL && s.textRight]} numberOfLines={1}>{video.creator}</Text>
        ) : null}
        <View style={[s.heroActions, isRTL && s.rowRev]}>
          <Pressable style={s.heroPlayBtn} onPress={onPress}>
            <MaterialIcons name="play-arrow" size={20} color={Colors.textInverse} />
            <Text style={s.heroPlayBtnText}>{watchNowLabel}</Text>
          </Pressable>
          {durationLabel ? (
            <View style={s.heroDuration}>
              <Text style={s.heroDurationText}>{durationLabel}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

// ─── Video Card ───────────────────────────────────────────────────────────────

function VideoCard({ video, onPress, language, isRTL }: {
  video: PublishedVideo; onPress: () => void; language: string; isRTL: boolean;
}) {
  const title = getPublishedVideoTitle(video, language);
  const sources = getVideoThumbnailSources(video);
  const licenseColor = getLicenseColor(video);
  const licenseLabel = getLicenseLabel(video);
  const durationLabel = formatPublishedDuration(video.duration_seconds);
  const isLong = (video.duration_seconds || 0) >= 1800;

  return (
    <Pressable style={({ pressed }) => [s.card, pressed && s.pressed]} onPress={onPress}>
      <View style={s.cardThumbWrap}>
        <Image
          source={sources as any}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
        <View style={s.cardOverlay}>
          <MaterialIcons name="play-circle-filled" size={30} color="rgba(255,255,255,0.9)" />
        </View>
        <View style={[s.cardLicenseBadge, { borderColor: licenseColor + '55' }]}>
          <Text style={[s.cardLicenseBadgeText, { color: licenseColor }]}>{licenseLabel}</Text>
        </View>
        {durationLabel ? (
          <View style={s.cardDuration}>
            <Text style={s.cardDurationText}>{durationLabel}</Text>
          </View>
        ) : null}
        {isLong && (
          <View style={s.cardLongBadge}>
            <MaterialIcons name="slow-motion-video" size={9} color={Colors.gold} />
          </View>
        )}
      </View>
      <View style={s.cardInfo}>
        <Text style={[s.cardTitle, isRTL && s.textRight]} numberOfLines={2}>{title}</Text>
        {video.creator ? (
          <Text style={[s.cardCreator, isRTL && s.textRight]} numberOfLines={1}>{video.creator}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

// ─── Shelf ────────────────────────────────────────────────────────────────────

function Shelf({ label, videos, onPress, language, isRTL, icon }: {
  label: string; videos: PublishedVideo[]; onPress: (v: PublishedVideo) => void;
  language: string; isRTL: boolean; icon?: string;
}) {
  if (!videos.length) return null;
  return (
    <View style={s.shelf}>
      <View style={[s.shelfHeader, isRTL && s.rowRev, { paddingHorizontal: Spacing.md, marginBottom: 10 }]}>
        {icon && <MaterialIcons name={icon as any} size={16} color={Colors.gold} />}
        <Text style={[s.shelfLabel, isRTL && s.textRight]}>{label}</Text>
        <Text style={s.shelfCount}>{videos.length}</Text>
      </View>
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={[s.shelfContent, isRTL && s.shelfContentRTL]}
      >
        {videos.map(v => (
          <VideoCard key={v.id} video={v} onPress={() => onPress(v)} language={language} isRTL={isRTL} />
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton({ label }: { label: string }) {
  return (
    <View style={s.loadingWrap}>
      <ActivityIndicator size="large" color={Colors.gold} />
      <Text style={s.loadingText}>{label}</Text>
    </View>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ isRTL, noVideosLabel, hintLabel }: { isRTL: boolean; noVideosLabel: string; hintLabel: string }) {
  return (
    <View style={s.emptyWrap}>
      <MaterialIcons name="video-library" size={64} color={Colors.textMuted} />
      <Text style={[s.emptyTitle, isRTL && s.textRight]}>{noVideosLabel}</Text>
      <Text style={[s.emptyBody, isRTL && s.textRight]}>{hintLabel}</Text>
    </View>
  );
}

// ─── Main Watch Tab ───────────────────────────────────────────────────────────

export default function WatchTab() {
  const insets = useSafeAreaInsets();
  const { language, isRTL, t } = useLanguage();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const { videos, loading, refresh } = usePublishedVideos(60_000);
  const { items: continueItems, loaded: continueLoaded, refresh: refreshContinue } = useContinueWatching(8);

  useEffect(() => { refreshContinue(); }, [refreshContinue]);

  const handleVideoPress = useCallback((video: PublishedVideo) => {
    router.push({ pathname: '/video/open-player', params: { id: video.id } } as any);
  }, [router]);

  const deduped = useMemo(() => {
    const seen = new Set<string>();
    return videos.filter(v => { if (seen.has(v.id)) return false; seen.add(v.id); return true; });
  }, [videos]);

  const longFormVideos = useMemo(() =>
    deduped.filter(v => (v.duration_seconds || 0) >= 1800), [deduped]);

  const videosByCategory = useMemo(() => {
    const map: Record<string, PublishedVideo[]> = {};
    for (const v of deduped) {
      const cat = getPublishedVideoCategory(v);
      if (!map[cat]) map[cat] = [];
      map[cat].push(v);
    }
    return map;
  }, [deduped]);

  const activeCategoryVideos = useMemo(() => {
    if (activeCategory === 'all') return deduped;
    if (activeCategory === 'long_documentary') return longFormVideos;
    return videosByCategory[activeCategory] || [];
  }, [activeCategory, deduped, videosByCategory, longFormVideos]);

  const heroVideos = useMemo(() => {
    return deduped
      .slice()
      .sort((a, b) => (b.duration_seconds || 0) - (a.duration_seconds || 0))
      .slice(0, 5);
  }, [deduped]);

  // Shelf definitions with localized labels from t()
  const SHELF_DEFS = useMemo(() => [
    { key: 'long_documentary',    labelKey: 'documentaries'  as TranslationKey, icon: 'slow-motion-video' },
    { key: 'islamic_history',     labelKey: 'seerahHistory'  as TranslationKey, icon: 'history-edu' },
    { key: 'general_documentary', labelKey: 'movies'         as TranslationKey, icon: 'movie' },
    { key: 'hajj_documentary',    labelKey: 'hajjVideos'     as TranslationKey, icon: 'flight' },
    { key: 'makkah_madinah',      labelKey: 'sacredPlaces'   as TranslationKey, icon: 'place' },
    { key: 'architecture',        labelKey: 'islamBasics'    as TranslationKey, icon: 'account-balance' },
    { key: 'islamic_civilization',labelKey: 'quranTafsir'    as TranslationKey, icon: 'account-balance' },
    { key: 'sufi_heritage',       labelKey: 'lectures'       as TranslationKey, icon: 'self-improvement' },
    { key: 'eid',                 labelKey: 'ramadan'        as TranslationKey, icon: 'celebration' },
    { key: 'new_muslims',         labelKey: 'learn'          as TranslationKey, icon: 'people' },
  ], []);

  const allShelves = useMemo(() => {
    if (activeCategory !== 'all') return [];
    return SHELF_DEFS
      .map(def => ({
        label: t(def.labelKey),
        icon: def.icon,
        videos: def.key === 'long_documentary' ? longFormVideos : (videosByCategory[def.key] || []),
      }))
      .filter(s => s.videos.length > 0);
  }, [activeCategory, videosByCategory, longFormVideos, t, SHELF_DEFS]);

  const continueVideos = useMemo(() => {
    return continueItems
      .map(item => ({ progress: item, video: deduped.find(v => v.id === item.videoId) }))
      .filter(x => x.video != null) as { progress: typeof continueItems[0]; video: PublishedVideo }[];
  }, [continueItems, deduped]);

  const noVideosLabel     = t('noVideosYet');
  const hintLabel         = t('noVideosPipelineHint');
  const loadingLabel      = t('loadingLibrary');
  const watchNowLabel     = t('watchNowBtn');
  const longFilmLabel     = t('longFilm');
  const continueLabel     = t('continueWatchingLabel');
  const resumeLabel       = t('resumeFrom' as TranslationKey);
  const allInAppLabel     = t('allInApp' as TranslationKey);
  const rightsNoticeLabel = t('rightsNotice' as TranslationKey);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[s.header, isRTL && s.rowRev]}>
        <View style={isRTL ? s.alignEnd : {}}>
          <Text style={s.headerTitle}>{t('watchTitle')}</Text>
          <Text style={s.headerSub}>
            {loading
              ? loadingLabel
              : deduped.length > 0
                ? `${deduped.length} ${t('videosInApp' as TranslationKey)}`
                : t('libraryComingSoon' as TranslationKey)}
          </Text>
        </View>
        <Pressable style={s.refreshBtn} onPress={refresh}>
          <MaterialIcons name="refresh" size={20} color={Colors.textSecondary} />
        </Pressable>
      </View>

      {/* In-App Notice */}
      <View style={[s.noticeBanner, isRTL && s.rowRev]}>
        <MaterialIcons name="smartphone" size={14} color={Colors.success} />
        <Text style={[s.noticeText, isRTL && s.textRight]}>{allInAppLabel}</Text>
      </View>

      {/* Category Filter */}
      <View style={s.catWrap}>
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={[s.catContent, isRTL && s.catContentRTL]}
        >
          {WATCH_CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.key;
            return (
              <Pressable
                key={cat.key}
                style={[s.catChip, isActive && s.catChipActive]}
                onPress={() => setActiveCategory(cat.key)}
              >
                <MaterialIcons
                  name={cat.icon as any}
                  size={13}
                  color={isActive ? Colors.textInverse : Colors.textSecondary}
                />
                <Text style={[s.catText, isActive && s.catTextActive]}>{t(cat.labelKey)}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Content */}
      {loading && videos.length === 0 ? (
        <LoadingSkeleton label={loadingLabel} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

          {/* Continue Watching */}
          {activeCategory === 'all' && continueLoaded && continueVideos.length > 0 && (
            <View style={s.shelf}>
              <View style={[s.shelfHeader, isRTL && s.rowRev, { paddingHorizontal: Spacing.md, marginBottom: 10 }]}>
                <MaterialIcons name="history" size={16} color={Colors.gold} />
                <Text style={[s.shelfLabel, isRTL && s.textRight]}>{continueLabel}</Text>
              </View>
              <ScrollView
                horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={[s.continueContent, isRTL && s.shelfContentRTL]}
              >
                {continueVideos.map(({ progress, video }) => (
                  <ContinueCard
                    key={progress.videoId}
                    video={video}
                    positionSeconds={progress.positionSeconds}
                    progressPercent={progress.progressPercent}
                    onPress={() => handleVideoPress(video)}
                    language={language}
                    isRTL={isRTL}
                    resumeLabel={resumeLabel}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Hero Carousel */}
          {activeCategory === 'all' && heroVideos.length > 0 && (
            <View style={s.heroWrap}>
              <ScrollView
                horizontal pagingEnabled showsHorizontalScrollIndicator={false}
                decelerationRate="fast" snapToInterval={width}
              >
                {heroVideos.map(v => (
                  <HeroCard
                    key={v.id} video={v} onPress={() => handleVideoPress(v)}
                    language={language} isRTL={isRTL}
                    watchNowLabel={watchNowLabel} longFilmLabel={longFilmLabel}
                  />
                ))}
              </ScrollView>
              <View style={s.heroDotsRow}>
                {heroVideos.map((_, i) => (
                  <View key={i} style={[s.heroDot, i === 0 && s.heroDotActive]} />
                ))}
              </View>
            </View>
          )}

          {/* Shelves or filtered category */}
          {activeCategory === 'all' ? (
            allShelves.length > 0 ? (
              allShelves.map(shelf => (
                <Shelf
                  key={shelf.label}
                  label={shelf.label}
                  icon={shelf.icon}
                  videos={shelf.videos}
                  onPress={handleVideoPress}
                  language={language}
                  isRTL={isRTL}
                />
              ))
            ) : (
              !loading && <EmptyState isRTL={isRTL} noVideosLabel={noVideosLabel} hintLabel={hintLabel} />
            )
          ) : activeCategoryVideos.length > 0 ? (
            <Shelf
              label={t(WATCH_CATEGORIES.find(c => c.key === activeCategory)?.labelKey || 'allCategories')}
              icon={WATCH_CATEGORIES.find(c => c.key === activeCategory)?.icon}
              videos={activeCategoryVideos}
              onPress={handleVideoPress}
              language={language}
              isRTL={isRTL}
            />
          ) : (
            <EmptyState isRTL={isRTL} noVideosLabel={noVideosLabel} hintLabel={hintLabel} />
          )}

          {/* Rights Footer */}
          {deduped.length > 0 && (
            <View style={s.rightsFooter}>
              <MaterialIcons name="verified-user" size={14} color={Colors.gold} />
              <Text style={[s.rightsFooterText, isRTL && s.textRight]}>{rightsNoticeLabel}</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container:           { flex: 1, backgroundColor: Colors.background },
  header:              { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: 6 },
  headerTitle:         { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.textPrimary, includeFontPadding: false },
  headerSub:           { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2, includeFontPadding: false },
  refreshBtn:          { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.surfaceCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border, marginTop: 4 },
  noticeBanner:        { flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: Spacing.md, marginBottom: 8, backgroundColor: Colors.success + '11', borderRadius: BorderRadius.md, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: Colors.success + '33' },
  noticeText:          { flex: 1, fontSize: 11, color: Colors.success, includeFontPadding: false },
  catWrap:             { marginBottom: 8 },
  catContent:          { paddingHorizontal: Spacing.md, gap: 8, paddingVertical: 2 },
  catContentRTL:       { flexDirection: 'row-reverse' },
  catChip:             { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border },
  catChipActive:       { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catText:             { fontSize: 12, color: Colors.textSecondary, fontWeight: FontWeight.medium, includeFontPadding: false },
  catTextActive:       { color: Colors.textPrimary, fontWeight: FontWeight.semibold },
  loadingWrap:         { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText:         { fontSize: FontSize.sm, color: Colors.textMuted, includeFontPadding: false },
  continueContent:     { paddingHorizontal: Spacing.md, gap: 10 },
  continueCard:        { width: CONTINUE_CARD_W, backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  continueThumbWrap:   { width: '100%', aspectRatio: 16 / 9, position: 'relative' },
  continueThumb:       { width: '100%', height: '100%' },
  continuePlayOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  continueProgressTrack: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: 'rgba(0,0,0,0.4)' },
  continueProgressFill:  { height: '100%', backgroundColor: Colors.gold, minWidth: 3 },
  resumeBadge:         { position: 'absolute', top: 6, left: 6, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  resumeBadgeText:     { fontSize: 9, color: Colors.gold, fontWeight: FontWeight.semibold, includeFontPadding: false },
  continueInfo:        { padding: 8, gap: 2 },
  continueTitle:       { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary, lineHeight: 17, includeFontPadding: false },
  continueDuration:    { fontSize: 11, color: Colors.gold, includeFontPadding: false },
  heroWrap:            { marginBottom: Spacing.md },
  heroCard:            { width, height: HERO_H, overflow: 'hidden', position: 'relative' },
  heroLicenseBadge:    { position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1 },
  heroLicenseBadgeText:{ fontSize: 10, fontWeight: FontWeight.bold, includeFontPadding: false },
  heroLongPill:        { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: BorderRadius.full, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: Colors.gold + '55' },
  heroLongPillText:    { fontSize: 10, color: Colors.gold, fontWeight: FontWeight.semibold, includeFontPadding: false },
  heroInfo:            { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.md, gap: 4 },
  heroSeriesLabel:     { fontSize: FontSize.xs, color: Colors.gold, fontWeight: FontWeight.semibold, includeFontPadding: false },
  heroTitle:           { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.textPrimary, lineHeight: 28, includeFontPadding: false },
  heroCreator:         { fontSize: FontSize.xs, color: Colors.textSecondary, includeFontPadding: false },
  heroActions:         { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  heroPlayBtn:         { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.gold, borderRadius: BorderRadius.md, paddingHorizontal: 16, paddingVertical: 9 },
  heroPlayBtnText:     { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textInverse, includeFontPadding: false },
  heroDuration:        { backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 5, paddingHorizontal: 8, paddingVertical: 5 },
  heroDurationText:    { fontSize: 11, color: Colors.textSecondary, includeFontPadding: false },
  heroDotsRow:         { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 8 },
  heroDot:             { width: 5, height: 5, borderRadius: 2.5, backgroundColor: Colors.border },
  heroDotActive:       { backgroundColor: Colors.gold, width: 14 },
  shelf:               { marginBottom: Spacing.lg },
  shelfHeader:         { flexDirection: 'row', alignItems: 'center', gap: 7 },
  shelfLabel:          { flex: 1, fontSize: FontSize.body, fontWeight: FontWeight.bold, color: Colors.textPrimary, includeFontPadding: false },
  shelfCount:          { fontSize: FontSize.xs, color: Colors.textMuted, backgroundColor: Colors.surfaceCard, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2, marginRight: Spacing.md, includeFontPadding: false },
  shelfContent:        { paddingHorizontal: Spacing.md, gap: 10 },
  shelfContentRTL:     { flexDirection: 'row-reverse' },
  card:                { width: CARD_W, backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  cardThumbWrap:       { width: '100%', aspectRatio: 3 / 2, position: 'relative' },
  cardOverlay:         { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.15)', alignItems: 'center', justifyContent: 'center' },
  cardLicenseBadge:    { position: 'absolute', bottom: 5, left: 5, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, borderWidth: 1 },
  cardLicenseBadgeText:{ fontSize: 9, fontWeight: FontWeight.bold, includeFontPadding: false },
  cardDuration:        { position: 'absolute', bottom: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  cardDurationText:    { fontSize: 9, color: '#fff', fontWeight: FontWeight.semibold, includeFontPadding: false },
  cardLongBadge:       { position: 'absolute', top: 5, left: 5, width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
  cardInfo:            { padding: 8, gap: 3 },
  cardTitle:           { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textPrimary, lineHeight: 17, includeFontPadding: false },
  cardCreator:         { fontSize: 11, color: Colors.textMuted, includeFontPadding: false },
  emptyWrap:           { alignItems: 'center', paddingVertical: 60, paddingHorizontal: Spacing.xl, gap: Spacing.md },
  emptyTitle:          { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textSecondary, textAlign: 'center', includeFontPadding: false },
  emptyBody:           { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: 20, includeFontPadding: false },
  rightsFooter:        { flexDirection: 'row', alignItems: 'flex-start', gap: 8, margin: Spacing.md, marginTop: 0, backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.md, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  rightsFooterText:    { flex: 1, fontSize: 11, color: Colors.textMuted, lineHeight: 16, includeFontPadding: false },
  textRight:           { textAlign: 'right' },
  rowRev:              { flexDirection: 'row-reverse' },
  alignEnd:            { alignItems: 'flex-end' },
  pressed:             { opacity: 0.82, transform: [{ scale: 0.97 }] },
});
