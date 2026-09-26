// Powered by OnSpace.AI
// Android Video Player — WebView-only (expo-video is NOT imported on Android)
//
// CRITICAL: Do NOT add any expo-video import to this file.
// expo-video's VideoCache uses ExoPlayer SimpleCache which crashes with
// "Another SimpleCache instance uses the folder" when the module is initialized.
// Platform-file splitting ensures the native module never loads on Android.

import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  Dimensions, Modal, ActivityIndicator, Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { useLanguage } from '../../hooks/useLanguage';
import {
  getOpenVideoById, getRelatedOpenVideos, getOpenVideoTitle,
  getOpenVideoDescription, getOpenVideoPoster, getOpenVideoCategoryKey, formatDuration,
  LICENSE_INFO, OpenLicenseVideo,
  getOpenVideosBySeries,
} from '../../services/openLicenseVideoService';
import {
  getCDNRecord, getCDNHlsUrl, isVideoOnCDN,
  VideoCDNRecord, fetchCDNRecord,
} from '../../services/videoPipelineService';
import {
  getVideoThumbnailSources, getOpenVideoFallbackThumb,
} from '../../hooks/usePublishedVideos';
import { useVideoProgress } from '../../hooks/useWatchProgress';
import AutoplayNextOverlay, { NextVideoInfo } from '../../components/feature/AutoplayNextOverlay';
import { formatPosition } from '../../services/watchProgressService';
import {
  getAudioEnabled, setAudioEnabled, getPlaybackSpeedSync, setPlaybackSpeed,
  SPEED_OPTIONS, preloadVideoPrefs,
} from '../../services/videoPlayerPrefsService';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';

const { width } = Dimensions.get('window');
const PLAYER_HEIGHT = Math.round(width * (9 / 16));

function L(language: string, ar: string, en: string, pt?: string): string {
  if (language === 'ar') return ar;
  if (language === 'pt' && pt) return pt;
  return en;
}

function cfThumb(providerVideoId: string, timePercent = 15): string {
  return `https://videodelivery.net/${providerVideoId}/thumbnails/thumbnail.jpg?time=${timePercent}%25&height=400`;
}

// ─── Speed Sheet ──────────────────────────────────────────────────────────────

function SpeedSheet({ visible, current, onSelect, onClose, isRTL }: {
  visible: boolean; current: number; onSelect: (s: number) => void;
  onClose: () => void; isRTL: boolean;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.sheetOverlay} onPress={onClose} />
      <View style={s.sheet}>
        <View style={s.sheetHandle} />
        <Text style={[s.sheetTitle, isRTL && s.textRight]}>
          {isRTL ? 'سرعة التشغيل' : 'Playback Speed'}
        </Text>
        {SPEED_OPTIONS.map(opt => (
          <Pressable
            key={opt.value}
            style={[s.sheetRow, opt.value === current && s.sheetRowActive]}
            onPress={() => { onSelect(opt.value); onClose(); }}
          >
            <MaterialIcons
              name={opt.value === current ? 'radio-button-checked' : 'radio-button-unchecked'}
              size={20} color={opt.value === current ? Colors.gold : Colors.textMuted}
            />
            <Text style={[s.sheetRowText, opt.value === current && s.sheetRowTextActive]}>
              {opt.label}{opt.value === 1.0 ? (isRTL ? ' (عادي)' : ' (Normal)') : ''}
            </Text>
            {opt.value === current && <MaterialIcons name="check" size={16} color={Colors.gold} />}
          </Pressable>
        ))}
      </View>
    </Modal>
  );
}

// ─── Language Sheet ───────────────────────────────────────────────────────────

function LanguageSheet({ visible, title, items, selectedIndex, onSelect, onClose, isRTL }: {
  visible: boolean; title: string;
  items: { label: string; labelAr: string; available: boolean }[];
  selectedIndex: number; onSelect: (i: number) => void;
  onClose: () => void; isRTL: boolean;
}) {
  const availableItems = items.filter(it => it.available);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.sheetOverlay} onPress={onClose} />
      <View style={s.sheet}>
        <View style={s.sheetHandle} />
        <Text style={[s.sheetTitle, isRTL && s.textRight]}>{title}</Text>
        {availableItems.length === 0 ? (
          <View style={s.sheetEmptyRow}>
            <MaterialIcons name="subtitles-off" size={20} color={Colors.textMuted} />
            <Text style={[s.sheetRowText, { color: Colors.textMuted }]}>
              {isRTL ? 'غير متوفرة بعد' : 'Not available yet'}
            </Text>
          </View>
        ) : availableItems.map((item, i) => {
          const origIdx = items.indexOf(item);
          return (
            <Pressable key={i} style={s.sheetRow} onPress={() => { onSelect(origIdx); onClose(); }}>
              <MaterialIcons
                name={origIdx === selectedIndex ? 'radio-button-checked' : 'radio-button-unchecked'}
                size={20} color={origIdx === selectedIndex ? Colors.gold : Colors.textMuted}
              />
              <Text style={[s.sheetRowText, origIdx === selectedIndex && s.sheetRowTextActive, isRTL && s.textRight]}>
                {isRTL ? item.labelAr : item.label}
              </Text>
              {origIdx === selectedIndex && <MaterialIcons name="check" size={16} color={Colors.gold} />}
            </Pressable>
          );
        })}
      </View>
    </Modal>
  );
}

// ─── Attribution Panel ────────────────────────────────────────────────────────

function AttributionPanel({ video, cdnRecord, isRTL }: {
  video: OpenLicenseVideo; cdnRecord: VideoCDNRecord | null; isRTL: boolean;
}) {
  const licenseInfo = LICENSE_INFO[video.license];
  const [expanded, setExpanded] = useState(false);
  const attributionText = cdnRecord?.attribution_text || video.attribution_text;
  const licenseLabel = isRTL ? licenseInfo.labelAr : licenseInfo.label;

  return (
    <View style={s.attributionCard}>
      <Pressable style={[s.attributionHeader, isRTL && s.rowRev]} onPress={() => setExpanded(p => !p)}>
        <MaterialIcons name="verified-user" size={18} color={licenseInfo.color} />
        <View style={s.attributionHeaderText}>
          <Text style={[s.attributionTitle, isRTL && s.textRight]}>{isRTL ? 'حقوق ومصادر' : 'Credits & Rights'}</Text>
          <View style={[s.licenseBadge, { borderColor: licenseInfo.color + '55' }]}>
            <Text style={[s.licenseBadgeText, { color: licenseInfo.color }]}>{licenseLabel}</Text>
          </View>
        </View>
        <MaterialIcons name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={20} color={Colors.textMuted} />
      </Pressable>
      {expanded && (
        <View style={s.attributionBody}>
          <View style={[s.attributionRow, isRTL && s.rowRev]}>
            <Text style={s.attributionLabel}>{isRTL ? 'المنتج:' : 'Creator:'}</Text>
            <Text style={[s.attributionValue, isRTL && s.textRight]}>{cdnRecord?.creator || video.original_creator}</Text>
          </View>
          <View style={[s.attributionRow, isRTL && s.rowRev]}>
            <Text style={s.attributionLabel}>{isRTL ? 'الرخصة:' : 'License:'}</Text>
            <Text style={[s.attributionValue, { color: licenseInfo.color }, isRTL && s.textRight]}>
              {video.license_version ? `${licenseLabel} ${video.license_version}` : licenseLabel}
            </Text>
          </View>
          {video.attribution_required && (
            <View style={s.attributionTextBox}>
              <Text style={s.attributionTextLabel}>{isRTL ? 'نص الإسناد:' : 'Required Attribution:'}</Text>
              <Text style={[s.attributionTextContent, isRTL && s.textRight]}>{attributionText}</Text>
            </View>
          )}
          {cdnRecord && (
            <View style={[s.cdnNotice, isRTL && s.rowRev]}>
              <MaterialIcons name="cloud-done" size={13} color={Colors.success} />
              <Text style={s.cdnNoticeText}>
                {isRTL ? 'يُشغَّل من بنيتنا التحتية' : 'Streaming from our infrastructure'}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// ─── Archive.org WebView Player ─────────────────────────────────────────────
// Used when there is no Cloudflare Stream provider_video_id
// archive.org provides a free embeddable player for all its items.

function ArchiveOrgPlayer({
  archiveId, language, onEnded,
}: {
  archiveId: string;
  language: string;
  onEnded?: () => void;
}) {
  const [loading, setLoading] = useState(true);

  const html = `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{margin:0;padding:0;box-sizing:border-box;background:#000}
body,html{width:100%;height:100%;overflow:hidden}
iframe{width:100%;height:100%;border:none;display:block}
</style>
</head>
<body>
<iframe
  src="https://archive.org/embed/${archiveId}?autoplay=1&start=0"
  allow="accelerometer;gyroscope;autoplay;encrypted-media;fullscreen"
  allowfullscreen="true"
  frameborder="0"
></iframe>
<script>
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    var vids = document.querySelectorAll('video');
    vids.forEach(function(v) { v.muted = false; v.volume = 1.0; });
  }, 1500);
});
</script>
</body>
</html>`;

  return (
    <View style={{ width, height: PLAYER_HEIGHT, backgroundColor: '#000' }}>
      <WebView
        source={{ html }}
        style={{ width, height: PLAYER_HEIGHT, backgroundColor: '#000' }}
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        javaScriptEnabled
        domStorageEnabled
        onLoadEnd={() => setLoading(false)}
        originWhitelist={['*']}
        mediaCapturePermissionGrantType="grant"
      />
      {loading && (
        <View style={[StyleSheet.absoluteFillObject, {
          backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', gap: 10,
        }]}>
          <ActivityIndicator size="large" color={Colors.gold} />
          <Text style={{ color: Colors.textMuted, fontSize: 13 }}>
            {L(language, 'جارٍ تحميل الفيديو…', 'Loading stream…')}
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Cloudflare WebView Player ────────────────────────────────────────────────

function CloudflareWebViewPlayer({
  providerVideoId, language, muted,
  onTimeUpdate, onEnded, onMuteToggle,
}: {
  providerVideoId: string;
  language: string;
  muted: boolean;
  onTimeUpdate?: (pos: number, dur: number) => void;
  onEnded?: () => void;
  onMuteToggle?: (muted: boolean) => void;
}) {
  const [loading, setLoading] = useState(true);
  const mutedParam = muted ? '1' : '0';

  const html = `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{margin:0;padding:0;box-sizing:border-box;background:#000}
body,html{width:100%;height:100%;overflow:hidden}
iframe{width:100%;height:100%;border:none;display:block}
</style>
</head>
<body>
<iframe
  id="cf"
  src="https://iframe.cloudflarestream.com/${providerVideoId}?autoplay=1&muted=${mutedParam}&controls=1"
  allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture"
  allowfullscreen="true"
></iframe>
<script>
window.addEventListener('message', function(e) {
  if (!e.data) return;
  var d = e.data;
  if (d.event === 'ended') {
    window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ended' }));
  }
  if (d.event === 'timeupdate') {
    window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'timeupdate', currentTime: d.currentTime, duration: d.duration }));
  }
  if (d.event === 'volumechange') {
    window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'volumechange', muted: d.muted }));
  }
});
</script>
</body>
</html>`;

  const handleMessage = useCallback((e: any) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      if (msg.type === 'ended' && onEnded) onEnded();
      if (msg.type === 'timeupdate' && onTimeUpdate && msg.currentTime != null) {
        onTimeUpdate(msg.currentTime, msg.duration || 0);
      }
      if (msg.type === 'volumechange' && onMuteToggle != null) {
        onMuteToggle(!!msg.muted);
      }
    } catch { /* ignore */ }
  }, [onEnded, onTimeUpdate, onMuteToggle]);

  return (
    <View style={{ width, height: PLAYER_HEIGHT, backgroundColor: '#000' }}>
      <WebView
        source={{ html }}
        style={{ width, height: PLAYER_HEIGHT, backgroundColor: '#000' }}
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        javaScriptEnabled
        domStorageEnabled
        onLoadEnd={() => setLoading(false)}
        onMessage={handleMessage}
        originWhitelist={['*']}
      />
      {loading && (
        <View style={[StyleSheet.absoluteFillObject, {
          backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', gap: 10,
        }]}>
          <ActivityIndicator size="large" color={Colors.gold} />
          <Text style={{ color: Colors.textMuted, fontSize: 13 }}>
            {L(language, 'جارٍ تحميل الفيديو…', 'Loading stream…')}
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Active Video Player (Android = WebView only) ────────────────────────────

function ActiveVideoPlayer({
  providerVideoId, archiveId, hlsUrl, language, isRTL,
  onTimeUpdate, onEnded,
}: {
  providerVideoId?: string;
  archiveId?: string;
  hlsUrl: string;
  language: string;
  isRTL: boolean;
  onTimeUpdate?: (pos: number, dur: number) => void;
  onEnded?: () => void;
}) {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    getAudioEnabled().then(enabled => setMuted(!enabled));
  }, []);

  const handleMuteToggle = useCallback((m: boolean) => {
    setMuted(m);
    setAudioEnabled(!m);
  }, []);

  if (providerVideoId) {
    return (
      <CloudflareWebViewPlayer
        providerVideoId={providerVideoId}
        language={language}
        muted={muted}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        onMuteToggle={handleMuteToggle}
      />
    );
  }

  // Fallback: archive.org embed
  if (archiveId) {
    return (
      <ArchiveOrgPlayer
        archiveId={archiveId}
        language={language}
        onEnded={onEnded}
      />
    );
  }

  return null;
}

// ─── Video Thumbnail ──────────────────────────────────────────────────────────

function VideoThumbnail({
  video, cdnRecord, poster, isReady, language, isRTL,
  licenseColor, licenseLabel, resumePosition, onPlay, onResume,
}: {
  video: OpenLicenseVideo; cdnRecord: VideoCDNRecord | null; poster: string; isReady: boolean;
  language: string; isRTL: boolean; licenseColor: string; licenseLabel: string;
  resumePosition: number | null; onPlay: () => void; onResume: () => void;
}) {
  const hasResume = resumePosition !== null && resumePosition > 30;

  // Multi-source: CDN thumbnail → poster → category fallback
  const thumbSources: Array<{ uri: string } | number> = [];
  if (cdnRecord?.provider_video_id) thumbSources.push({ uri: cfThumb(cdnRecord.provider_video_id) });
  if (poster) thumbSources.push({ uri: poster });
  thumbSources.push(getOpenVideoFallbackThumb(getOpenVideoCategoryKey(video)));

  return (
    <Pressable style={[s.playerWrap, { height: PLAYER_HEIGHT }]} onPress={isReady ? onPlay : undefined}>
      <Image source={thumbSources as any} style={StyleSheet.absoluteFillObject} contentFit="cover" transition={200} />
      <LinearGradient colors={['transparent', 'rgba(6,15,10,0.85)']} style={StyleSheet.absoluteFillObject} />
      {isReady ? (
        <View style={{ alignItems: 'center', gap: 10 }}>
          <View style={s.bigPlayBtn}>
            <MaterialIcons name="play-arrow" size={44} color="#fff" />
          </View>
          {hasResume && resumePosition != null && (
            <Pressable style={s.resumeFromBtn} onPress={e => { e.stopPropagation?.(); onResume(); }}>
              <MaterialIcons name="history" size={14} color={Colors.gold} />
              <Text style={s.resumeFromText}>
                {language === 'ar' ? `متابعة من ${formatPosition(resumePosition)}` : `Resume from ${formatPosition(resumePosition)}`}
              </Text>
            </Pressable>
          )}
        </View>
      ) : (
        <View style={{ alignItems: 'center', gap: 6 }}>
          <MaterialIcons name="schedule" size={34} color={Colors.textMuted} />
          <Text style={{ fontSize: FontSize.sm, color: Colors.textMuted }}>{L(language, 'قيد المعالجة', 'Processing')}</Text>
        </View>
      )}
      <View style={[s.playerLicenseBadge, { borderColor: licenseColor + '55' }]}>
        <MaterialIcons name="verified-user" size={11} color={licenseColor} />
        <Text style={[s.playerLicenseBadgeText, { color: licenseColor }]}>{licenseLabel}</Text>
      </View>
      {isReady && (
        <View style={s.playerInAppBadge}>
          <MaterialIcons name="smartphone" size={11} color={Colors.success} />
          <Text style={s.playerInAppBadgeText}>{isRTL ? 'داخل التطبيق' : 'In-App'}</Text>
        </View>
      )}
    </Pressable>
  );
}

// ─── Related Card ─────────────────────────────────────────────────────────────

function RelatedCard({ video, onPress, language, isRTL }: {
  video: OpenLicenseVideo; onPress: () => void; language: string; isRTL: boolean;
}) {
  const title = getOpenVideoTitle(video, language);
  const cdnRec = getCDNRecord(video.id);
  const ready = isVideoOnCDN(video.id);
  const licenseInfo = LICENSE_INFO[video.license];

  const relSources: Array<{ uri: string } | number> = [];
  if (cdnRec?.poster_url) relSources.push({ uri: cdnRec.poster_url });
  if (cdnRec?.provider_video_id) relSources.push({ uri: cfThumb(cdnRec.provider_video_id, 15) });
  relSources.push(getOpenVideoFallbackThumb(getOpenVideoCategoryKey(video)));

  return (
    <Pressable style={({ pressed }) => [s.relCard, pressed && s.pressed]} onPress={onPress}>
      <View style={s.relThumbWrap}>
        <Image source={relSources as any} style={s.relThumb} contentFit="cover" transition={200} />
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center' }]}>
          <MaterialIcons name={ready ? 'play-arrow' : 'schedule'} size={ready ? 18 : 14} color={ready ? '#fff' : Colors.textMuted} />
        </View>
      </View>
      <View style={[s.relInfo, isRTL && { alignItems: 'flex-end' }]}>
        <Text style={[s.relTitle, isRTL && s.textRight]} numberOfLines={2}>{title}</Text>
        <Text style={s.relCreator} numberOfLines={1}>{video.original_creator}</Text>
        <Text style={s.relDuration}>{formatDuration(video.duration_seconds)}</Text>
      </View>
    </Pressable>
  );
}

// ─── Build NextVideoInfo ──────────────────────────────────────────────────────

function buildNextVideo(video: OpenLicenseVideo, language: string): NextVideoInfo | null {
  if (video.series && video.episode_number != null) {
    const seriesVideos = getOpenVideosBySeries(video.series);
    const nextEp = seriesVideos.find(v => v.episode_number === (video.episode_number! + 1));
    if (nextEp && isVideoOnCDN(nextEp.id)) {
      const cdnRec = getCDNRecord(nextEp.id);
      const poster = cdnRec?.poster_url || (cdnRec?.provider_video_id ? cfThumb(cdnRec.provider_video_id, 10) : '') || getOpenVideoPoster(nextEp);
      return {
        id: nextEp.id, title: getOpenVideoTitle(nextEp, language),
        durationLabel: formatDuration(nextEp.duration_seconds), posterUri: poster,
        isNextEpisode: true,
        episodeLabel: language === 'ar' ? `الحلقة ${nextEp.episode_number}` : `Episode ${nextEp.episode_number}`,
      };
    }
  }
  const related = getRelatedOpenVideos(video, 10).filter(v => isVideoOnCDN(v.id));
  if (related.length > 0) {
    const next = related[0];
    const cdnRec = getCDNRecord(next.id);
    const poster = cdnRec?.poster_url || (cdnRec?.provider_video_id ? cfThumb(cdnRec.provider_video_id, 10) : '') || getOpenVideoPoster(next);
    return { id: next.id, title: getOpenVideoTitle(next, language), durationLabel: formatDuration(next.duration_seconds), posterUri: poster, isNextEpisode: false };
  }
  return null;
}

// ─── DB-only player ───────────────────────────────────────────────────────────

function DBOnlyPlayer({ dbRecord, language, isRTL }: { dbRecord: VideoCDNRecord; language: string; isRTL: boolean }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [playerStarted, setPlayerStarted] = useState(false);
  const { updateProgress, flushProgress } = useVideoProgress(dbRecord.id);

  const title = language === 'ar'
    ? ((dbRecord as any).title_ar || (dbRecord as any).title_en || dbRecord.commons_file_title || dbRecord.id)
    : ((dbRecord as any).title_en || (dbRecord as any).title_ar || dbRecord.commons_file_title || dbRecord.id);

  // Build multi-source thumbnail array using the central resolver
  const thumbSources = getVideoThumbnailSources(dbRecord as any);

  const hlsUrl = dbRecord.stream_hls_url || '';
  const providerVideoId = dbRecord.provider_video_id;
  // For archive_org videos: the DB `id` IS the archive identifier
  const isArchiveOrg = (dbRecord as any).video_provider === 'archive_org';
  const archiveId = isArchiveOrg ? dbRecord.id : undefined;
  const canPlay = !!(providerVideoId || archiveId || hlsUrl);
  const licenseColor = '#3B82F6';
  const licenseLabel = (dbRecord as any).license_name || (dbRecord as any).license || 'Open';

  const handleTimeUpdate = useCallback((pos: number, dur: number) => {
    if (pos > 0) updateProgress(pos, dur || null);
  }, [updateProgress]);

  const handleVideoEnded = useCallback(() => {
    flushProgress(dbRecord.duration_seconds || 0, dbRecord.duration_seconds || null);
  }, [dbRecord, flushProgress]);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {playerStarted && canPlay ? (
        <ActiveVideoPlayer
          providerVideoId={providerVideoId}
          archiveId={archiveId}
          hlsUrl={hlsUrl}
          language={language}
          isRTL={isRTL}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnded}
        />
      ) : (
        <Pressable
          style={[s.playerWrap, { height: PLAYER_HEIGHT }]}
          onPress={canPlay ? () => setPlayerStarted(true) : undefined}
        >
          <Image source={thumbSources as any} style={StyleSheet.absoluteFillObject} contentFit="cover" transition={200} />
          <LinearGradient colors={['transparent', 'rgba(6,15,10,0.85)']} style={StyleSheet.absoluteFillObject} />
          <View style={s.bigPlayBtn}>
            <MaterialIcons name="play-arrow" size={44} color="#fff" />
          </View>
          <View style={[s.playerLicenseBadge, { borderColor: licenseColor + '55' }]}>
            <MaterialIcons name="verified-user" size={11} color={licenseColor} />
            <Text style={[s.playerLicenseBadgeText, { color: licenseColor }]}>{licenseLabel}</Text>
          </View>
        </Pressable>
      )}
      <Pressable
        style={[s.backBtnFloating, { top: insets.top + 8 }]}
        onPress={() => { flushProgress(0, null).catch(() => {}); router.back(); }}
      >
        <MaterialIcons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={20} color="#fff" />
      </Pressable>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={s.infoSection}>
          <Text style={[s.titleText, isRTL && s.textRight]}>{title}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function OpenPlayerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { language, isRTL } = useLanguage();

  useEffect(() => { preloadVideoPrefs(); }, []);

  const [dbOnlyRecord, setDbOnlyRecord]   = useState<VideoCDNRecord | null>(null);
  const [dbOnlyLoading, setDbOnlyLoading] = useState(false);
  const [dbOnlyChecked, setDbOnlyChecked] = useState(false);

  const video = getOpenVideoById(id || '');

  useEffect(() => {
    if (video || !id || dbOnlyChecked) return;
    setDbOnlyLoading(true);
    fetchCDNRecord(id).then(rec => {
      setDbOnlyRecord(rec);
      setDbOnlyLoading(false);
      setDbOnlyChecked(true);
    }).catch(() => {
      setDbOnlyLoading(false);
      setDbOnlyChecked(true);
    });
  }, [id, video, dbOnlyChecked]);

  // DB-only record: archive_org or any published ready video
  if (!video && dbOnlyRecord &&
    dbOnlyRecord.processing_status === 'ready' &&
    (dbOnlyRecord.published || dbOnlyRecord.device_tested)) {
    return <DBOnlyPlayer dbRecord={dbOnlyRecord!} language={language} isRTL={isRTL} />;
  }

  if (!video && !dbOnlyChecked) {
    return (
      <View style={[s.container, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.gold} />
      </View>
    );
  }

  const isReady        = video ? isVideoOnCDN(video.id) : false;
  const playbackUrl    = video ? (getCDNHlsUrl(video.id) || '') : '';
  const cdnRecord      = video ? getCDNRecord(video.id) : null;
  const providerVideoId = cdnRecord?.provider_video_id;

  const poster = cdnRecord?.poster_url
    || (providerVideoId ? cfThumb(providerVideoId, 10) : '')
    || (video ? getOpenVideoPoster(video) : '');

  const [playerStarted, setPlayerStarted] = useState(false);
  const [showAutoplay, setShowAutoplay]   = useState(false);
  const [isInMyList, setIsInMyList]       = useState(false);
  const [showAudioSheet, setShowAudioSheet]   = useState(false);
  const [showSubSheet, setShowSubSheet]       = useState(false);
  const [showSpeedSheet, setShowSpeedSheet]   = useState(false);
  const [selectedAudioIndex, setSelectedAudioIndex] = useState(0);
  const [selectedSubIndex, setSelectedSubIndex]     = useState<number | null>(null);
  const [playbackSpeed, setPlaybackSpeedState]       = useState(getPlaybackSpeedSync);

  const { progress, resumePosition, updateProgress, flushProgress } = useVideoProgress(id || '');

  const navigateToVideo = useCallback((videoId: string) => {
    router.push({ pathname: '/video/open-player', params: { id: videoId } } as any);
  }, [router]);

  // Archive.org videos in static catalog may have archive_id property
  const archiveIdForStaticVideo = !providerVideoId && video
    ? ((video as any).archive_id || null)
    : null;

  const handlePlay = useCallback(() => {
    // Allow play if CDN-ready OR if it has an archive embed fallback
    if (isReady || archiveIdForStaticVideo) { setShowAutoplay(false); setPlayerStarted(true); }
  }, [isReady, archiveIdForStaticVideo]);

  const handleResume = useCallback(() => {
    if (resumePosition && resumePosition > 30) { setShowAutoplay(false); setPlayerStarted(true); }
  }, [resumePosition]);

  const handleTimeUpdate = useCallback((pos: number, dur: number) => {
    if (pos > 0) updateProgress(pos, dur || null);
  }, [updateProgress]);

  const handleVideoEnded = useCallback(() => {
    if (video) flushProgress(video.duration_seconds, video.duration_seconds);
    setShowAutoplay(true);
  }, [video, flushProgress]);

  const handleBack = useCallback(() => {
    if (playerStarted && video) flushProgress(0, null).catch(() => {});
    router.back();
  }, [router, playerStarted, video, flushProgress]);

  const handleSpeedChange = useCallback((spd: number) => {
    setPlaybackSpeedState(spd);
    setPlaybackSpeed(spd);
  }, []);

  if (!video && dbOnlyChecked && !dbOnlyRecord) {
    return (
      <View style={[s.container, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center', gap: Spacing.md }]}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <MaterialIcons name="video-library" size={64} color={Colors.textMuted} />
        <Text style={{ fontSize: FontSize.body, color: Colors.textMuted }}>{L(language, 'الفيديو غير موجود', 'Video not found')}</Text>
      </View>
    );
  }

  if (!video) return null;

  const title        = getOpenVideoTitle(video, language);
  const description  = getOpenVideoDescription(video, language);
  const related      = getRelatedOpenVideos(video, 8);
  const licenseInfo  = LICENSE_INFO[video.license];
  const licenseLabel = isRTL ? licenseInfo.labelAr : licenseInfo.label;
  const nextVideo    = buildNextVideo(video, language);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {playerStarted && (providerVideoId || archiveIdForStaticVideo) ? (
        <View style={{ position: 'relative' }}>
          <ActiveVideoPlayer
            providerVideoId={providerVideoId}
            archiveId={archiveIdForStaticVideo || undefined}
            hlsUrl={playbackUrl}
            language={language}
            isRTL={isRTL}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
          />
          {showAutoplay && nextVideo && (
            <AutoplayNextOverlay
              visible={showAutoplay} nextVideo={nextVideo} countdownSeconds={10}
              language={language} isRTL={isRTL}
              onPlay={(vId) => { setShowAutoplay(false); navigateToVideo(vId); }}
              onCancel={() => setShowAutoplay(false)}
            />
          )}
        </View>
      ) : (
        <VideoThumbnail
          video={video} cdnRecord={cdnRecord} poster={poster} isReady={isReady}
          language={language} isRTL={isRTL}
          licenseColor={licenseInfo.color} licenseLabel={licenseLabel}
          resumePosition={resumePosition}
          onPlay={handlePlay} onResume={handleResume}
        />
      )}

      <Pressable style={[s.backBtnFloating, { top: insets.top + 8 }]} onPress={handleBack}>
        <MaterialIcons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={20} color="#fff" />
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {isReady && (
          <View style={[s.inAppNotice, isRTL && s.rowRev]}>
            <MaterialIcons name="smartphone" size={13} color={Colors.success} />
            <Text style={[s.inAppNoticeText, isRTL && s.textRight]}>
              {isRTL ? 'يُشغَّل من بنيتنا التحتية — لا توجه خارجي' : 'Streaming from our CDN — no external redirects'}
            </Text>
          </View>
        )}

        <View style={s.infoSection}>
          {video.series ? <Text style={[s.seriesLabel, isRTL && s.textRight]}>{video.series}</Text> : null}
          <Text style={[s.titleText, isRTL && s.textRight]}>{title}</Text>

          <View style={[s.metaRow, isRTL && s.rowRev]}>
            <View style={s.metaBadge}>
              <MaterialIcons name="timer" size={12} color={Colors.textMuted} />
              <Text style={s.metaBadgeText}>{formatDuration(cdnRecord?.duration_seconds || video.duration_seconds)}</Text>
            </View>
            {video.production_year ? (
              <View style={s.metaBadge}>
                <MaterialIcons name="event" size={12} color={Colors.textMuted} />
                <Text style={s.metaBadgeText}>{video.production_year}</Text>
              </View>
            ) : null}
            <View style={[s.metaBadge, { borderColor: licenseInfo.color + '55' }]}>
              <MaterialIcons name="verified-user" size={12} color={licenseInfo.color} />
              <Text style={[s.metaBadgeText, { color: licenseInfo.color }]}>{licenseLabel}</Text>
            </View>
            {isReady && (
              <View style={[s.metaBadge, { borderColor: Colors.success + '55' }]}>
                <MaterialIcons name="check-circle" size={12} color={Colors.success} />
                <Text style={[s.metaBadgeText, { color: Colors.success }]}>{isRTL ? 'جاهز ✓' : 'Ready ✓'}</Text>
              </View>
            )}
          </View>

          {progress && !progress.completed && progress.positionSeconds > 30 && (
            <View style={[s.progressBar, isRTL && s.rowRev]}>
              <View style={s.progressBarTrack}>
                <View style={[s.progressBarFill, { width: `${Math.min(100, progress.progressPercent)}%` }]} />
              </View>
              <Text style={s.progressText}>
                {language === 'ar' ? `شاهدت ${formatPosition(progress.positionSeconds)}` : `Watched ${formatPosition(progress.positionSeconds)}`}
              </Text>
            </View>
          )}

          <View style={[s.channelRow, isRTL && s.rowRev]}>
            <View style={s.channelAvatar}>
              <MaterialIcons name="video-library" size={22} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.channelName, isRTL && s.textRight]} numberOfLines={2}>{video.original_creator}</Text>
              <Text style={s.channelSub}>{video.source_name}</Text>
            </View>
          </View>

          <View style={[s.actionsRow, isRTL && s.rowRev]}>
            <Pressable
              style={[s.watchBtn, !isReady && s.watchBtnDisabled]}
              onPress={isReady ? handlePlay : undefined}
            >
              <MaterialIcons name={isReady ? 'play-arrow' : 'schedule'} size={22} color={isReady ? Colors.textInverse : Colors.textMuted} />
              <Text style={[s.watchBtnText, !isReady && { color: Colors.textMuted }]}>
                {isReady ? L(language, 'شاهد الآن', 'Watch Now') : L(language, 'قريباً', 'Coming Soon')}
              </Text>
            </Pressable>
            <Pressable style={[s.iconActionBtn, isInMyList && s.iconActionBtnActive]} onPress={() => setIsInMyList(p => !p)}>
              <MaterialIcons name={isInMyList ? 'bookmark' : 'bookmark-add'} size={20} color={isInMyList ? Colors.textInverse : Colors.gold} />
            </Pressable>
          </View>

          {/* Player toolbar */}
          {isReady && (() => {
            const availableAudio = video.audio_tracks.filter((t: any) => t.available);
            const availableSubs  = video.subtitle_tracks.filter((t: any) => t.available);
            const hasAudioOptions = availableAudio.length > 1;
            const hasSubtitles   = availableSubs.length > 0;
            const currentAudio   = availableAudio[selectedAudioIndex] || availableAudio[0];
            const currentSub     = selectedSubIndex !== null ? availableSubs[selectedSubIndex] : null;

            return (
              <View style={[s.toolbarRow, isRTL && s.rowRev]}>
                {hasAudioOptions ? (
                  <Pressable style={s.toolbarBtn} onPress={() => setShowAudioSheet(true)}>
                    <MaterialIcons name="volume-up" size={15} color={Colors.gold} />
                    <Text style={s.toolbarBtnText}>{isRTL ? (currentAudio?.labelAr || 'الصوت') : (currentAudio?.label || 'Audio')}</Text>
                    <MaterialIcons name="arrow-drop-down" size={16} color={Colors.textMuted} />
                  </Pressable>
                ) : (
                  <View style={[s.toolbarBtn, { opacity: 0.55 }]}>
                    <MaterialIcons name="volume-up" size={15} color={Colors.gold} />
                    <Text style={s.toolbarBtnText}>{isRTL ? 'الصوت الأصلي' : 'Original Audio'}</Text>
                  </View>
                )}
                <Pressable style={[s.toolbarBtn, !hasSubtitles && { opacity: 0.55 }]} onPress={hasSubtitles ? () => setShowSubSheet(true) : undefined}>
                  <MaterialIcons name="subtitles" size={15} color={currentSub ? Colors.primary : Colors.textMuted} />
                  <Text style={[s.toolbarBtnText, !currentSub && { color: Colors.textMuted }]}>
                    {currentSub ? (isRTL ? currentSub.labelAr : currentSub.label) : (hasSubtitles ? L(language, 'بدون ترجمة', 'Off') : L(language, 'لا توجد ترجمة', 'No subtitles'))}
                  </Text>
                  {hasSubtitles && <MaterialIcons name="arrow-drop-down" size={16} color={Colors.textMuted} />}
                </Pressable>
                <Pressable style={s.toolbarBtn} onPress={() => setShowSpeedSheet(true)}>
                  <MaterialIcons name="speed" size={15} color={playbackSpeed !== 1 ? Colors.gold : Colors.textMuted} />
                  <Text style={[s.toolbarBtnText, playbackSpeed !== 1 && { color: Colors.gold }]}>
                    {playbackSpeed === 1 ? (isRTL ? 'السرعة' : 'Speed') : `${playbackSpeed}x`}
                  </Text>
                  <MaterialIcons name="arrow-drop-down" size={16} color={Colors.textMuted} />
                </Pressable>
              </View>
            );
          })()}

          {nextVideo && nextVideo.isNextEpisode && (
            <Pressable style={[s.nextEpBtn, isRTL && s.rowRev]} onPress={() => navigateToVideo(nextVideo.id)}>
              <View style={[s.nextEpInfo, isRTL && { alignItems: 'flex-end' }]}>
                <Text style={s.nextEpLabel}>{nextVideo.episodeLabel}</Text>
                <Text style={[s.nextEpTitle, isRTL && s.textRight]} numberOfLines={1}>{nextVideo.title}</Text>
              </View>
              <MaterialIcons name={isRTL ? 'chevron-left' : 'chevron-right'} size={22} color={Colors.gold} />
            </Pressable>
          )}

          {description ? <Text style={[s.descText, isRTL && s.textRight]}>{description}</Text> : null}

          {video.tags.length > 0 && (
            <View style={[s.tagsRow, isRTL && s.rowRev]}>
              {video.tags.map(tag => (
                <View key={tag} style={s.tagChip}><Text style={s.tagText}>#{tag}</Text></View>
              ))}
            </View>
          )}

          <AttributionPanel video={video} cdnRecord={cdnRecord} isRTL={isRTL} />
        </View>

        {related.length > 0 && (
          <View style={s.relatedSection}>
            <Text style={[s.relatedTitle, isRTL && s.textRight]}>
              {L(language, 'شاهد أيضاً', 'More Like This')}
            </Text>
            {related.map(v => (
              <RelatedCard key={v.id} video={v} onPress={() => navigateToVideo(v.id)} language={language} isRTL={isRTL} />
            ))}
          </View>
        )}
      </ScrollView>

      <LanguageSheet
        visible={showAudioSheet}
        title={L(language, 'اختر لغة الصوت', 'Select Audio Language')}
        items={video.audio_tracks} selectedIndex={selectedAudioIndex}
        onSelect={setSelectedAudioIndex} onClose={() => setShowAudioSheet(false)} isRTL={isRTL}
      />
      <LanguageSheet
        visible={showSubSheet}
        title={L(language, 'اختر لغة الترجمة', 'Select Subtitles')}
        items={[{ label: 'Off', labelAr: 'بدون ترجمة', available: true }, ...video.subtitle_tracks.filter((t: any) => t.available)]}
        selectedIndex={selectedSubIndex === null ? 0 : selectedSubIndex + 1}
        onSelect={i => setSelectedSubIndex(i === 0 ? null : i - 1)}
        onClose={() => setShowSubSheet(false)} isRTL={isRTL}
      />
      <SpeedSheet
        visible={showSpeedSheet} current={playbackSpeed}
        onSelect={handleSpeedChange} onClose={() => setShowSpeedSheet(false)} isRTL={isRTL}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container:             { flex: 1, backgroundColor: Colors.background },
  backBtn:               { margin: Spacing.md, width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surfaceCard, alignItems: 'center', justifyContent: 'center' },
  playerWrap:            { width, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  backBtnFloating:       { position: 'absolute', left: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', zIndex: 20 },
  bigPlayBtn:            { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)' },
  resumeFromBtn:         { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: BorderRadius.full, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: Colors.gold + '44' },
  resumeFromText:        { fontSize: FontSize.sm, color: Colors.gold, fontWeight: FontWeight.semibold, includeFontPadding: false },
  playerLicenseBadge:    { position: 'absolute', bottom: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 3, borderWidth: 1 },
  playerLicenseBadgeText:{ fontSize: 10, fontWeight: FontWeight.semibold },
  playerInAppBadge:      { position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.success + 'cc', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 3 },
  playerInAppBadgeText:  { fontSize: 10, fontWeight: FontWeight.bold, color: '#fff' },
  inAppNotice:           { flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: Spacing.md, marginTop: Spacing.sm, marginBottom: 4, backgroundColor: Colors.success + '11', borderRadius: BorderRadius.md, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: Colors.success + '33' },
  inAppNoticeText:       { flex: 1, fontSize: 11, color: Colors.success },
  infoSection:           { padding: Spacing.md, gap: Spacing.sm },
  textRight:             { textAlign: 'right' },
  rowRev:                { flexDirection: 'row-reverse' },
  seriesLabel:           { fontSize: FontSize.xs, color: Colors.gold, fontWeight: FontWeight.semibold },
  titleText:             { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.textPrimary, lineHeight: 28 },
  metaRow:               { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  metaBadge:             { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.sm, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: Colors.border },
  metaBadgeText:         { fontSize: 11, color: Colors.textMuted },
  progressBar:           { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressBarTrack:      { flex: 1, height: 4, borderRadius: 2, backgroundColor: Colors.border, overflow: 'hidden' },
  progressBarFill:       { height: '100%', borderRadius: 2, backgroundColor: Colors.gold, minWidth: 4 },
  progressText:          { fontSize: 11, color: Colors.gold, fontWeight: FontWeight.medium, includeFontPadding: false },
  channelRow:            { flexDirection: 'row', alignItems: 'center', gap: 10 },
  channelAvatar:         { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.surfaceCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.borderLight },
  channelName:           { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  channelSub:            { fontSize: FontSize.xs, color: Colors.textMuted },
  actionsRow:            { flexDirection: 'row', alignItems: 'center', gap: 10 },
  watchBtn:              { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.gold, borderRadius: BorderRadius.lg, paddingVertical: 13 },
  watchBtnDisabled:      { backgroundColor: Colors.surfaceElevated, borderWidth: 1, borderColor: Colors.border },
  watchBtnText:          { fontSize: FontSize.body, fontWeight: FontWeight.bold, color: Colors.textInverse },
  iconActionBtn:         { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.surfaceCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.border },
  iconActionBtnActive:   { backgroundColor: Colors.primary, borderColor: Colors.primary },
  toolbarRow:            { flexDirection: 'row', gap: 6 },
  toolbarBtn:            { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.md, paddingHorizontal: 10, paddingVertical: 9, borderWidth: 1, borderColor: Colors.border },
  toolbarBtnText:        { flex: 1, fontSize: 11, color: Colors.textPrimary, fontWeight: FontWeight.medium, includeFontPadding: false },
  nextEpBtn:             { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.lg, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.gold + '44' },
  nextEpInfo:            { flex: 1 },
  nextEpLabel:           { fontSize: 11, color: Colors.gold, fontWeight: FontWeight.semibold, includeFontPadding: false },
  nextEpTitle:           { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textPrimary, includeFontPadding: false },
  descText:              { fontSize: FontSize.body, color: Colors.textSecondary, lineHeight: 24 },
  tagsRow:               { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagChip:               { backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.sm, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: Colors.border },
  tagText:               { fontSize: 11, color: Colors.textMuted },
  attributionCard:       { backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.lg, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  attributionHeader:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  attributionHeaderText: { flex: 1, gap: 4 },
  attributionTitle:      { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  licenseBadge:          { alignSelf: 'flex-start', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, backgroundColor: Colors.surfaceElevated },
  licenseBadgeText:      { fontSize: 10, fontWeight: FontWeight.bold },
  attributionBody:       { marginTop: 10, gap: 8 },
  attributionRow:        { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  attributionLabel:      { fontSize: 11, color: Colors.textMuted, width: 90, flexShrink: 0 },
  attributionValue:      { flex: 1, fontSize: 12, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  attributionTextBox:    { backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.sm, padding: 8, gap: 4 },
  attributionTextLabel:  { fontSize: 10, color: Colors.textMuted },
  attributionTextContent:{ fontSize: 11, color: Colors.textSecondary, lineHeight: 16 },
  cdnNotice:             { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.success + '11', borderRadius: 4, paddingHorizontal: 7, paddingVertical: 4 },
  cdnNoticeText:         { flex: 1, fontSize: 10, color: Colors.success },
  relatedSection:        { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xl },
  relatedTitle:          { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  relCard:               { flexDirection: 'row', gap: Spacing.sm, backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.lg, overflow: 'hidden', marginBottom: 10, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  pressed:               { opacity: 0.8, transform: [{ scale: 0.98 }] },
  relThumbWrap:          { width: 130, height: 80, position: 'relative' },
  relThumb:              { width: '100%', height: '100%' },
  relInfo:               { flex: 1, padding: 8, justifyContent: 'center' },
  relTitle:              { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary, lineHeight: 17 },
  relCreator:            { fontSize: 11, color: Colors.textMuted, marginTop: 3 },
  relDuration:           { fontSize: 10, color: Colors.gold, marginTop: 2 },
  sheetOverlay:          { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet:                 { backgroundColor: Colors.surfaceCard, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: Spacing.md, paddingBottom: 40, gap: 4 },
  sheetHandle:           { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 10 },
  sheetTitle:            { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 8 },
  sheetRow:              { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sheetRowActive:        { backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.sm },
  sheetEmptyRow:         { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16 },
  sheetRowText:          { flex: 1, fontSize: FontSize.body, color: Colors.textPrimary },
  sheetRowTextActive:    { color: Colors.gold, fontWeight: FontWeight.bold },
});
