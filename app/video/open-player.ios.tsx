// Powered by OnSpace.AI
// Open-License Video Player — CDN-First Architecture
//
// ANDROID FIX: expo-video's VideoCache uses ExoPlayer SimpleCache which can only
// have one instance per folder. On Android we always use CloudflareWebViewPlayer,
// so _NativeHLSPlayerInner (which calls require('expo-video')) is never mounted
// on Android — preventing the IllegalStateException crash on startup.
//
// AUDIO POLICY:
//   Opening a video is a USER GESTURE → audio MUST start ON.
//   Preference is persisted across sessions via videoPlayerPrefsService.
//   Platform autoplay restrictions are handled by requesting unmuted via user gesture.
//
// PLAYBACK POLICY:
//   Playback URL priority: CDN HLS → CDN MP4.
//   Attribution displayed INSIDE the app — no external redirects.

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  Dimensions, Modal, ActivityIndicator, Platform, TouchableOpacity,
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
  requiresAttribution, LICENSE_INFO, OpenLicenseVideo,
  getOpenVideosBySeries,
} from '../../services/openLicenseVideoService';
import {
  getCDNRecord, getCDNHlsUrl, isVideoOnCDN,
  VideoCDNRecord, fetchCDNRecord,
} from '../../services/videoPipelineService';
import {
  PublishedVideo, getPublishedVideoTitle, getPublishedVideoPoster,
  getVideoThumbnailSources, getOpenVideoFallbackThumb, getOpenLicenseThumbnailSources,
} from '../../hooks/usePublishedVideos';
import { useVideoProgress } from '../../hooks/useWatchProgress';
import AutoplayNextOverlay, { NextVideoInfo } from '../../components/feature/AutoplayNextOverlay';
import { formatPosition } from '../../services/watchProgressService';
import {
  getAudioEnabled, setAudioEnabled, getAudioEnabledSync,
  getPlaybackSpeed, setPlaybackSpeed, getPlaybackSpeedSync,
  SPEED_OPTIONS, preloadVideoPrefs,
} from '../../services/videoPlayerPrefsService';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';

const { width } = Dimensions.get('window');
const PLAYER_HEIGHT = Math.round(width * (9 / 16));

function L(language: string, ar: string, en: string, pt?: string, fr?: string): string {
  if (language === 'ar') return ar;
  if (language === 'pt' && pt) return pt;
  if (language === 'fr' && fr) return fr;
  return en;
}

// ─── Cloudflare thumbnail URL helper ─────────────────────────────────────────
// Uses videodelivery.net — the correct public Cloudflare Stream CDN domain.
// cloudflarestream.com does NOT serve thumbnails for public (non-signed) streams.

function cfThumb(providerVideoId: string, timePercent = 15): string {
  return `https://videodelivery.net/${providerVideoId}/thumbnails/thumbnail.jpg?time=${timePercent}%25&height=400`;
}

// ─── Speed Picker Sheet ───────────────────────────────────────────────────────

function SpeedSheet({ visible, current, onSelect, onClose, isRTL }: {
  visible: boolean;
  current: number;
  onSelect: (speed: number) => void;
  onClose: () => void;
  isRTL: boolean;
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
              size={20}
              color={opt.value === current ? Colors.gold : Colors.textMuted}
            />
            <Text style={[s.sheetRowText, opt.value === current && s.sheetRowTextActive]}>
              {opt.label}
              {opt.value === 1.0 ? (isRTL ? ' (عادي)' : ' (Normal)') : ''}
            </Text>
            {opt.value === current && (
              <MaterialIcons name="check" size={16} color={Colors.gold} />
            )}
          </Pressable>
        ))}
      </View>
    </Modal>
  );
}

// ─── Language Selector Sheet ──────────────────────────────────────────────────

function LanguageSheet({ visible, title, items, selectedIndex, onSelect, onClose, isRTL }: {
  visible: boolean; title: string;
  items: { label: string; labelAr: string; available: boolean }[];
  selectedIndex: number; onSelect: (i: number) => void;
  onClose: () => void; isRTL: boolean;
}) {
  // Only show actually available tracks — no fake "Coming Soon" items
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
            <Text style={[s.sheetRowText, { color: Colors.textMuted }, isRTL && s.textRight]}>
              {isRTL ? 'الترجمة غير متوفرة بعد' : 'Not available yet'}
            </Text>
          </View>
        ) : availableItems.map((item, i) => {
          const origIdx = items.indexOf(item);
          return (
            <Pressable
              key={i}
              style={s.sheetRow}
              onPress={() => { onSelect(origIdx); onClose(); }}
            >
              <MaterialIcons
                name={origIdx === selectedIndex ? 'radio-button-checked' : 'radio-button-unchecked'}
                size={20}
                color={origIdx === selectedIndex ? Colors.gold : Colors.textMuted}
              />
              <Text style={[
                s.sheetRowText,
                origIdx === selectedIndex && s.sheetRowTextActive,
                isRTL && s.textRight,
              ]}>
                {isRTL ? item.labelAr : item.label}
              </Text>
              {origIdx === selectedIndex && (
                <MaterialIcons name="check" size={16} color={Colors.gold} />
              )}
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
              <Text style={s.attributionTextLabel}>{isRTL ? 'نص الإسناد (إلزامي):' : 'Required Attribution:'}</Text>
              <Text style={[s.attributionTextContent, isRTL && s.textRight]}>{attributionText}</Text>
            </View>
          )}
          <View style={[s.attributionRow, isRTL && s.rowRev]}>
            <Text style={s.attributionLabel}>{isRTL ? 'المصدر الأصلي:' : 'Original Source:'}</Text>
            <Text style={[s.attributionValue, isRTL && s.textRight]}>{video.source_name}</Text>
          </View>
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

// ─── Archive.org WebView Player ────────────────────────────────────────────────
// Used when no Cloudflare provider_video_id is available.
// archive.org provides a free embeddable HTML5 player for all public items.

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
// Auto-unmute archive.org player after load
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

// ─── Cloudflare WebView Player (Android + iOS fallback) ───────────────────────
// Autoplay=1, muted=0 → audio ON from first tap (user gesture satisfies browser policy)
function CloudflareWebViewPlayer({
  providerVideoId, language, speed, muted,
  onTimeUpdate, onEnded, onMuteToggle,
}: {
  providerVideoId: string;
  language: string;
  speed: number;
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
var cfPlayer = document.getElementById('cf');
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

// ─── iOS-only HLS player (expo-video / AVPlayer) ─────────────────────────────
// NEVER mounted on Android — prevents ExoPlayer SimpleCache crash.
function _IOSHLSPlayer({
  hlsUrl, providerVideoId, language, muted, speed,
  onTimeUpdate, onEnded, onMuteChange, onSpeedChange,
}: {
  hlsUrl: string; providerVideoId?: string; language: string;
  muted: boolean; speed: number;
  onTimeUpdate?: (pos: number, dur: number) => void;
  onEnded?: () => void;
  onMuteChange?: (m: boolean) => void;
  onSpeedChange?: (s: number) => void;
}) {
  const { useVideoPlayer, VideoView } = require('expo-video') as {
    useVideoPlayer: typeof import('expo-video').useVideoPlayer;
    VideoView:      typeof import('expo-video').VideoView;
  };

  const [phase, setPhase] = useState<'loading' | 'playing' | 'error'>('loading');
  const [useFallback, setUseFallback] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]     = useState(0);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const player = useVideoPlayer({ uri: hlsUrl }, (p) => {
    p.loop = false;
    p.muted = muted;
    p.playbackRate = speed;
  });

  // Start playback after brief delay (user gesture already happened by opening this component)
  useEffect(() => {
    if (!player) return;
    const t = setTimeout(() => {
      try {
        player.muted = false; // Ensure unmuted — user tapped a video card
        player.playbackRate = speed;
        player.play();
      } catch (e) { console.warn('[IOSHLSPlayer] play() error:', e); }
    }, 300);
    return () => {
      clearTimeout(t);
      try { player.pause(); } catch (_) {}
    };
  }, [player]);

  // Sync muted prop changes
  useEffect(() => {
    if (!player) return;
    try { player.muted = muted; } catch (_) {}
  }, [player, muted]);

  // Sync speed prop changes
  useEffect(() => {
    if (!player) return;
    try { player.playbackRate = speed; } catch (_) {}
  }, [player, speed]);

  // Progress polling every 3s
  useEffect(() => {
    if (!player || !onTimeUpdate) return;
    progressTimerRef.current = setInterval(() => {
      try {
        const pos = player.currentTime ?? 0;
        const dur = player.duration ?? 0;
        setCurrentTime(pos);
        setDuration(dur);
        if (pos > 0) onTimeUpdate(pos, dur);
      } catch { /* ignore */ }
    }, 3000);
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [player, onTimeUpdate]);

  useEffect(() => {
    if (!player) return;
    const sub = player.addListener('statusChange', (evt: any) => {
      const status = evt?.status ?? evt;
      if (status === 'readyToPlay' || status?.status === 'readyToPlay') {
        setPhase('playing');
        try { setDuration(player.duration ?? 0); } catch (_) {}
      }
      if (status === 'error' || status?.status === 'error' || evt?.error) {
        if (providerVideoId) setUseFallback(true);
        else setPhase('error');
      }
    });
    const timeout = setTimeout(() => {
      if (phase === 'loading') {
        if (providerVideoId) setUseFallback(true);
        else setPhase('error');
      }
    }, 10000);
    return () => {
      try { sub?.remove?.(); } catch (_) {}
      clearTimeout(timeout);
    };
  }, [player, hlsUrl, providerVideoId, phase]);

  if (useFallback && providerVideoId) {
    return (
      <CloudflareWebViewPlayer
        providerVideoId={providerVideoId}
        language={language}
        speed={speed}
        muted={muted}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        onMuteToggle={onMuteChange}
      />
    );
  }
  if (phase === 'error') {
    return (
      <View style={s.playerErrorWrap}>
        <MaterialIcons name="signal-wifi-off" size={40} color={Colors.textMuted} />
        <Text style={{ marginTop: 10, fontSize: 15, color: Colors.textSecondary, textAlign: 'center' }}>
          {L(language, 'تعذر تشغيل هذا المحتوى مؤقتًا', 'This content is temporarily unavailable.')}
        </Text>
      </View>
    );
  }

  return (
    <View style={s.nativePlayerContainer}>
      <VideoView
        player={player}
        style={{ width, height: PLAYER_HEIGHT }}
        allowsFullscreen
        allowsPictureInPicture
        contentFit="contain"
        nativeControls
      />
      {phase === 'loading' && (
        <View style={s.loadingBar}>
          <ActivityIndicator size="small" color={Colors.gold} />
          <Text style={s.loadingText}>{L(language, 'جارٍ تحميل الفيديو…', 'Loading stream…')}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Platform-safe HLS wrapper ────────────────────────────────────────────────

function NativeHLSPlayer(props: {
  hlsUrl: string; providerVideoId?: string; archiveId?: string; language: string;
  muted: boolean; speed: number;
  onTimeUpdate?: (pos: number, dur: number) => void;
  onEnded?: () => void;
  onMuteChange?: (m: boolean) => void;
  onSpeedChange?: (s: number) => void;
}) {
  if (Platform.OS === 'android') {
    if (props.providerVideoId) {
      return (
        <CloudflareWebViewPlayer
          providerVideoId={props.providerVideoId}
          language={props.language}
          speed={props.speed}
          muted={props.muted}
          onTimeUpdate={props.onTimeUpdate}
          onEnded={props.onEnded}
          onMuteToggle={props.onMuteChange}
        />
      );
    }
    if (props.archiveId) {
      return (
        <ArchiveOrgPlayer
          archiveId={props.archiveId}
          language={props.language}
          onEnded={props.onEnded}
        />
      );
    }
    return (
      <View style={s.playerErrorWrap}>
        <MaterialIcons name="signal-wifi-off" size={40} color={Colors.textMuted} />
        <Text style={{ marginTop: 10, fontSize: 15, color: Colors.textSecondary, textAlign: 'center' }}>
          {L(props.language, 'تعذر تشغيل هذا المحتوى مؤقتًا', 'This content is temporarily unavailable.')}
        </Text>
      </View>
    );
  }
  return <_IOSHLSPlayer {...props} />;
}

// ─── Active Video Player (with controls overlay) ─────────────────────────────

function ActiveVideoPlayer({
  hlsUrl, providerVideoId, archiveId, language, isRTL,
  onTimeUpdate, onEnded,
}: {
  hlsUrl: string; providerVideoId?: string; archiveId?: string; language: string; isRTL: boolean;
  onTimeUpdate?: (pos: number, dur: number) => void;
  onEnded?: () => void;
}) {
  const [muted, setMuted]         = useState(false); // ALWAYS start unmuted
  const [speed, setSpeed]         = useState(getPlaybackSpeedSync);
  const [showSpeedSheet, setShowSpeedSheet] = useState(false);

  // Persist audio preference whenever it changes
  const handleMuteToggle = useCallback((m: boolean) => {
    setMuted(m);
    setAudioEnabled(!m);
  }, []);

  const handleSpeedChange = useCallback((s: number) => {
    setSpeed(s);
    setPlaybackSpeed(s);
  }, []);

  // Load saved audio preference on mount
  useEffect(() => {
    getAudioEnabled().then(enabled => setMuted(!enabled));
  }, []);

  return (
    <View>
      <NativeHLSPlayer
        hlsUrl={hlsUrl}
        providerVideoId={providerVideoId}
        archiveId={archiveId}
        language={language}
        muted={muted}
        speed={speed}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        onMuteChange={handleMuteToggle}
        onSpeedChange={handleSpeedChange}
      />
      {/* Controls bar below the player (Android WebView already has built-in controls) */}
      {Platform.OS !== 'android' && (
        <View style={s.controlsBar}>
          {/* Mute/Unmute */}
          <Pressable
            style={s.controlBtn}
            onPress={() => handleMuteToggle(!muted)}
          >
            <MaterialIcons
              name={muted ? 'volume-off' : 'volume-up'}
              size={18}
              color={muted ? Colors.error : Colors.gold}
            />
            <Text style={[s.controlBtnText, muted && { color: Colors.error }]}>
              {muted ? (isRTL ? 'كتم' : 'Muted') : (isRTL ? 'صوت' : 'Audio')}
            </Text>
          </Pressable>

          {/* Playback speed */}
          <Pressable style={s.controlBtn} onPress={() => setShowSpeedSheet(true)}>
            <MaterialIcons name="speed" size={18} color={speed !== 1 ? Colors.gold : Colors.textSecondary} />
            <Text style={[s.controlBtnText, speed !== 1 && { color: Colors.gold }]}>
              {speed === 1 ? (isRTL ? 'السرعة' : 'Speed') : `${speed}x`}
            </Text>
          </Pressable>

          {/* Audio ON reminder when muted */}
          {muted && (
            <Pressable style={[s.controlBtn, s.muteWarning]} onPress={() => handleMuteToggle(false)}>
              <MaterialIcons name="volume-up" size={16} color={Colors.textInverse} />
              <Text style={[s.controlBtnText, { color: Colors.textInverse }]}>
                {isRTL ? 'تفعيل الصوت' : 'Unmute'}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      <SpeedSheet
        visible={showSpeedSheet}
        current={speed}
        onSelect={handleSpeedChange}
        onClose={() => setShowSpeedSheet(false)}
        isRTL={isRTL}
      />
    </View>
  );
}

// ─── Video Thumbnail / Poster ─────────────────────────────────────────────────

function VideoThumbnail({
  video, cdnRecord, poster, isReady, language, isRTL,
  licenseColor, licenseLabel, resumePosition, onPlay, onResume,
}: {
  video: OpenLicenseVideo; cdnRecord: VideoCDNRecord | null; poster: string; isReady: boolean;
  language: string; isRTL: boolean; licenseColor: string; licenseLabel: string;
  resumePosition: number | null;
  onPlay: () => void; onResume: () => void;
}) {
  const hasResume = resumePosition !== null && resumePosition > 30;

  // Build multi-source array: CDN thumbnail → poster → category fallback
  const thumbSources: Array<{ uri: string } | number> = [];
  if (cdnRecord?.provider_video_id) {
    thumbSources.push({ uri: cfThumb(cdnRecord.provider_video_id, 15) });
    thumbSources.push({ uri: cfThumb(cdnRecord.provider_video_id, 30) });
  }
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
            <Pressable
              style={s.resumeFromBtn}
              onPress={e => { e.stopPropagation?.(); onResume(); }}
            >
              <MaterialIcons name="history" size={14} color={Colors.gold} />
              <Text style={s.resumeFromText}>
                {language === 'ar'
                  ? `متابعة من ${formatPosition(resumePosition)}`
                  : `Resume from ${formatPosition(resumePosition)}`}
              </Text>
            </Pressable>
          )}
        </View>
      ) : (
        <View style={s.notReadyWrap}>
          <MaterialIcons name="schedule" size={34} color={Colors.textMuted} />
          <Text style={s.notReadyText}>{L(language, 'قيد المعالجة', 'Processing')}</Text>
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

  // Multi-source for related card thumbnail
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
        <View style={[s.relLicenseBadge, { borderColor: licenseInfo.color + '55' }]}>
          <Text style={[s.relLicenseBadgeText, { color: licenseInfo.label }]}>{licenseInfo.label}</Text>
        </View>
        {ready && <View style={s.relReadyBadge}><MaterialIcons name="verified" size={10} color={Colors.success} /></View>}
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
      const poster = cdnRec?.poster_url
        || (cdnRec?.provider_video_id ? cfThumb(cdnRec.provider_video_id, 10) : '')
        || getOpenVideoPoster(nextEp);
      return {
        id: nextEp.id,
        title: getOpenVideoTitle(nextEp, language),
        durationLabel: formatDuration(nextEp.duration_seconds),
        posterUri: poster,
        isNextEpisode: true,
        episodeLabel: language === 'ar' ? `الحلقة ${nextEp.episode_number}` : `Episode ${nextEp.episode_number}`,
      };
    }
  }
  const related = getRelatedOpenVideos(video, 10);
  const playable = related.filter(v => isVideoOnCDN(v.id));
  if (playable.length > 0) {
    const next = playable[0];
    const cdnRec = getCDNRecord(next.id);
    const poster = cdnRec?.poster_url
      || (cdnRec?.provider_video_id ? cfThumb(cdnRec.provider_video_id, 10) : '')
      || getOpenVideoPoster(next);
    return {
      id: next.id,
      title: getOpenVideoTitle(next, language),
      durationLabel: formatDuration(next.duration_seconds),
      posterUri: poster,
      isNextEpisode: false,
    };
  }
  return null;
}

// ─── DB-only video player ─────────────────────────────────────────────────────

function DBOnlyPlayer({ dbRecord, language, isRTL }: {
  dbRecord: VideoCDNRecord; language: string; isRTL: boolean;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [playerStarted, setPlayerStarted] = useState(false);
  const { progress, resumePosition, updateProgress, flushProgress } = useVideoProgress(dbRecord.id);

  const title = language === 'ar'
    ? ((dbRecord as any).title_ar || (dbRecord as any).title_en || dbRecord.commons_file_title || dbRecord.id)
    : ((dbRecord as any).title_en || (dbRecord as any).title_ar || dbRecord.commons_file_title || dbRecord.id);

  // Multi-source thumbnail using central resolver
  const thumbSources = getVideoThumbnailSources(dbRecord as any);

  const hlsUrl = dbRecord.stream_hls_url || '';
  const providerVideoId = dbRecord.provider_video_id;
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
        isArchiveOrg && archiveId ? (
          <ArchiveOrgPlayer
            archiveId={archiveId}
            language={language}
            onEnded={handleVideoEnded}
          />
        ) : (
          <ActiveVideoPlayer
            hlsUrl={hlsUrl}
            providerVideoId={providerVideoId}
            language={language}
            isRTL={isRTL}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
          />
        )
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
          {(dbRecord.creator || (dbRecord as any).attribution_text) && (
            <View style={s.attributionCard}>
              {dbRecord.creator ? (
                <View style={[s.attributionRow, isRTL && s.rowRev]}>
                  <Text style={s.attributionLabel}>{isRTL ? 'المنتج:' : 'Creator:'}</Text>
                  <Text style={[s.attributionValue, isRTL && s.textRight]}>{dbRecord.creator}</Text>
                </View>
              ) : null}
              {dbRecord.attribution_text ? (
                <View style={s.attributionTextBox}>
                  <Text style={s.attributionTextLabel}>{isRTL ? 'الإسناد:' : 'Attribution:'}</Text>
                  <Text style={[s.attributionTextContent, isRTL && s.textRight]}>{dbRecord.attribution_text}</Text>
                </View>
              ) : null}
            </View>
          )}
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

  // Preload player prefs (speed, audio) on mount
  useEffect(() => { preloadVideoPrefs(); }, []);

  // DB-only record state
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

  // Loading
  if (!video && !dbOnlyChecked) {
    return (
      <View style={[s.container, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.gold} />
      </View>
    );
  }

  const isReady        = video ? isVideoOnCDN(video.id) : false;
  const playbackUrl    = video ? getCDNHlsUrl(video.id) : null;
  const cdnRecord      = video ? getCDNRecord(video.id) : null;
  const providerVideoId = cdnRecord?.provider_video_id;

  // Use CF thumbnail if poster_url is missing
  const poster = cdnRecord?.poster_url
    || (providerVideoId ? cfThumb(providerVideoId, 10) : '')
    || (video ? getOpenVideoPoster(video) : '');

  const [playerStarted, setPlayerStarted] = useState(false);
  const [startPosition, setStartPosition] = useState<number | null>(null);
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

  const handlePlay = useCallback((fromStart = false) => {
    if (isReady && playbackUrl) {
      setStartPosition(fromStart ? 0 : null);
      setShowAutoplay(false);
      setPlayerStarted(true);
    }
  }, [isReady, playbackUrl]);

  const handleResume = useCallback(() => {
    if (resumePosition && resumePosition > 30) {
      setStartPosition(resumePosition);
      setShowAutoplay(false);
      setPlayerStarted(true);
    }
  }, [resumePosition]);

  const handleTimeUpdate = useCallback((pos: number, dur: number) => {
    if (pos > 0) updateProgress(pos, dur || null);
  }, [updateProgress]);

  const handleVideoEnded = useCallback(() => {
    if (video) flushProgress(video.duration_seconds, video.duration_seconds);
    setShowAutoplay(true);
  }, [video, flushProgress]);

  const handleAutoplayPlay  = useCallback((videoId: string) => { setShowAutoplay(false); navigateToVideo(videoId); }, [navigateToVideo]);
  const handleAutoplayCancel = useCallback(() => setShowAutoplay(false), []);

  const handleBack = useCallback(() => {
    if (playerStarted && video) flushProgress(0, null).catch(() => {});
    router.back();
  }, [router, playerStarted, video, flushProgress]);

  const handleSpeedChange = useCallback((s: number) => {
    setPlaybackSpeedState(s);
    setPlaybackSpeed(s);
  }, []);

  // Not found
  if (!video && dbOnlyChecked && !dbOnlyRecord) {
    return (
      <View style={[s.notFound, { paddingTop: insets.top }]}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <MaterialIcons name="video-library" size={64} color={Colors.textMuted} />
        <Text style={s.notFoundText}>{L(language, 'الفيديو غير موجود', 'Video not found')}</Text>
      </View>
    );
  }

  if (!video) return null;

  const title           = getOpenVideoTitle(video, language);
  const description     = getOpenVideoDescription(video, language);
  const related         = getRelatedOpenVideos(video, 8);
  const licenseInfo     = LICENSE_INFO[video.license];
  const licenseLabel    = isRTL ? licenseInfo.labelAr : licenseInfo.label;
  const effectiveDuration = cdnRecord?.duration_seconds || video.duration_seconds;
  const nextVideo       = buildNextVideo(video, language);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>

      {playerStarted && playbackUrl ? (
        <View style={{ position: 'relative' }}>
          <ActiveVideoPlayer
            hlsUrl={playbackUrl || ''}
            providerVideoId={providerVideoId}
            archiveId={!providerVideoId ? id || undefined : undefined}
            language={language}
            isRTL={isRTL}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
          />
          {showAutoplay && nextVideo && (
            <AutoplayNextOverlay
              visible={showAutoplay}
              nextVideo={nextVideo}
              countdownSeconds={10}
              language={language}
              isRTL={isRTL}
              onPlay={handleAutoplayPlay}
              onCancel={handleAutoplayCancel}
            />
          )}
        </View>
      ) : (
        <VideoThumbnail
          video={video}
          cdnRecord={cdnRecord}
          poster={poster}
          isReady={isReady}
          language={language}
          isRTL={isRTL}
          licenseColor={licenseInfo.color}
          licenseLabel={licenseLabel}
          resumePosition={resumePosition}
          onPlay={() => handlePlay(false)}
          onResume={handleResume}
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
              {isRTL ? 'يُشغَّل من بنيتنا التحتية — لا توجد عمليات إعادة توجيه خارجية' : 'Streaming from our CDN — no external redirects'}
            </Text>
          </View>
        )}

        {!isReady && (
          <View style={[s.processingBanner, {
            borderColor: Colors.warning + '44', backgroundColor: Colors.warning + '11',
            marginHorizontal: Spacing.md, marginTop: Spacing.sm,
          }]}>
            <MaterialIcons name="hourglass-empty" size={16} color={Colors.warning} />
            <Text style={[s.processingTitle, { color: Colors.warning }, isRTL && s.textRight]}>
              {L(language, 'قيد المعالجة', 'Processing')}
            </Text>
          </View>
        )}

        <View style={s.infoSection}>
          {video.series ? (
            <Text style={[s.seriesLabel, isRTL && s.textRight]}>{video.series}</Text>
          ) : null}

          <Text style={[s.titleText, isRTL && s.textRight]}>{title}</Text>

          <View style={[s.metaRow, isRTL && s.rowRev]}>
            <View style={s.metaBadge}>
              <MaterialIcons name="timer" size={12} color={Colors.textMuted} />
              <Text style={s.metaBadgeText}>{formatDuration(effectiveDuration)}</Text>
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
            <View style={s.metaBadge}>
              <MaterialIcons name="language" size={12} color={Colors.textMuted} />
              <Text style={s.metaBadgeText}>{video.original_language.toUpperCase()}</Text>
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
                {language === 'ar'
                  ? `شاهدت ${formatPosition(progress.positionSeconds)}`
                  : `Watched ${formatPosition(progress.positionSeconds)}`}
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
              onPress={isReady ? () => handlePlay(true) : undefined}
            >
              <MaterialIcons
                name={isReady ? 'play-arrow' : 'schedule'}
                size={22}
                color={isReady ? Colors.textInverse : Colors.textMuted}
              />
              <Text style={[s.watchBtnText, !isReady && { color: Colors.textMuted }]}>
                {isReady
                  ? L(language, 'شاهد الآن', 'Watch Now')
                  : L(language, 'قريباً', 'Coming Soon')}
              </Text>
            </Pressable>
            <Pressable
              style={[s.iconActionBtn, isInMyList && s.iconActionBtnActive]}
              onPress={() => setIsInMyList(p => !p)}
            >
              <MaterialIcons
                name={isInMyList ? 'bookmark' : 'bookmark-add'}
                size={20}
                color={isInMyList ? Colors.textInverse : Colors.gold}
              />
            </Pressable>
          </View>

          {/* Player tools — only show subtitle button when real tracks exist */}
          {isReady && (() => {
            const availableAudio    = video.audio_tracks.filter((t: any) => t.available);
            const availableSubs     = video.subtitle_tracks.filter((t: any) => t.available);
            const hasAudioOptions   = availableAudio.length > 1; // >1 = dubbed tracks exist
            const hasSubtitles      = availableSubs.length > 0;
            const currentAudio      = availableAudio[selectedAudioIndex] || availableAudio[0];
            const currentSub        = selectedSubIndex !== null ? availableSubs[selectedSubIndex] : null;

            return (
              <View style={[s.toolbarRow, isRTL && s.rowRev]}>
                {/* Audio: only show selector when real dubbed tracks exist */}
                {hasAudioOptions ? (
                  <Pressable style={s.toolbarBtn} onPress={() => setShowAudioSheet(true)}>
                    <MaterialIcons name="volume-up" size={15} color={Colors.gold} />
                    <Text style={s.toolbarBtnText}>
                      {isRTL ? (currentAudio?.labelAr || 'الصوت') : (currentAudio?.label || 'Audio')}
                    </Text>
                    <MaterialIcons name="arrow-drop-down" size={16} color={Colors.textMuted} />
                  </Pressable>
                ) : (
                  <View style={[s.toolbarBtn, { opacity: 0.55 }]}>
                    <MaterialIcons name="volume-up" size={15} color={Colors.gold} />
                    <Text style={s.toolbarBtnText}>
                      {isRTL ? 'الصوت الأصلي' : 'Original Audio'}
                    </Text>
                  </View>
                )}

                {/* Subtitles: only show selector when tracks are actually available */}
                <Pressable
                  style={[s.toolbarBtn, !hasSubtitles && { opacity: 0.55 }]}
                  onPress={hasSubtitles ? () => setShowSubSheet(true) : undefined}
                >
                  <MaterialIcons
                    name="subtitles" size={15}
                    color={currentSub ? Colors.primary : Colors.textMuted}
                  />
                  <Text style={[s.toolbarBtnText, !currentSub && { color: Colors.textMuted }]}>
                    {currentSub
                      ? (isRTL ? currentSub.labelAr : currentSub.label)
                      : (hasSubtitles
                          ? L(language, 'بدون ترجمة', 'Off')
                          : L(language, 'لا توجد ترجمة', 'No subtitles'))}
                  </Text>
                  {hasSubtitles && <MaterialIcons name="arrow-drop-down" size={16} color={Colors.textMuted} />}
                </Pressable>

                {/* Speed — always available */}
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
            <Pressable
              style={[s.nextEpBtn, isRTL && s.rowRev]}
              onPress={() => navigateToVideo(nextVideo.id)}
            >
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
                <View key={tag} style={s.tagChip}>
                  <Text style={s.tagText}>#{tag}</Text>
                </View>
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
        items={video.audio_tracks}
        selectedIndex={selectedAudioIndex}
        onSelect={setSelectedAudioIndex}
        onClose={() => setShowAudioSheet(false)}
        isRTL={isRTL}
      />
      <LanguageSheet
        visible={showSubSheet}
        title={L(language, 'اختر لغة الترجمة', 'Select Subtitles')}
        items={[
          { label: 'Off', labelAr: 'بدون ترجمة', available: true },
          ...video.subtitle_tracks.filter((t: any) => t.available),
        ]}
        selectedIndex={selectedSubIndex === null ? 0 : selectedSubIndex + 1}
        onSelect={i => setSelectedSubIndex(i === 0 ? null : i - 1)}
        onClose={() => setShowSubSheet(false)}
        isRTL={isRTL}
      />
      <SpeedSheet
        visible={showSpeedSheet}
        current={playbackSpeed}
        onSelect={handleSpeedChange}
        onClose={() => setShowSpeedSheet(false)}
        isRTL={isRTL}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container:            { flex: 1, backgroundColor: Colors.background },
  notFound:             { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, backgroundColor: Colors.background },
  notFoundText:         { fontSize: FontSize.body, color: Colors.textMuted },
  backBtn:              { margin: Spacing.md, width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surfaceCard, alignItems: 'center', justifyContent: 'center' },
  playerWrap:           { width, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  nativePlayerContainer:{ width, height: PLAYER_HEIGHT, backgroundColor: '#000' },
  loadingBar:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 6, backgroundColor: 'rgba(0,0,0,0.75)' },
  loadingText:          { color: Colors.textMuted, fontSize: 12 },
  playerErrorWrap:      { width, height: PLAYER_HEIGHT, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 10 },
  backBtnFloating:      { position: 'absolute', left: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', zIndex: 20 },
  bigPlayBtn:           { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)' },
  resumeFromBtn:        { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: BorderRadius.full, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: Colors.gold + '44' },
  resumeFromText:       { fontSize: FontSize.sm, color: Colors.gold, fontWeight: FontWeight.semibold, includeFontPadding: false },

  notReadyWrap:         { alignItems: 'center', gap: 6 },
  notReadyText:         { fontSize: FontSize.sm, color: Colors.textMuted },
  playerLicenseBadge:   { position: 'absolute', bottom: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 3, borderWidth: 1 },
  playerLicenseBadgeText:{ fontSize: 10, fontWeight: FontWeight.semibold },
  playerInAppBadge:     { position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.success + 'cc', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 3 },
  playerInAppBadgeText: { fontSize: 10, fontWeight: FontWeight.bold, color: '#fff' },
  // Controls bar (iOS only)
  controlsBar:          { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.surface, paddingHorizontal: Spacing.md, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  controlBtn:           { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.md, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: Colors.border },
  controlBtnText:       { fontSize: 12, color: Colors.textSecondary, fontWeight: FontWeight.medium, includeFontPadding: false },
  muteWarning:          { backgroundColor: Colors.error, borderColor: Colors.error },
  // Info
  inAppNotice:          { flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: Spacing.md, marginTop: Spacing.sm, marginBottom: 4, backgroundColor: Colors.success + '11', borderRadius: BorderRadius.md, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: Colors.success + '33' },
  inAppNoticeText:      { flex: 1, fontSize: 11, color: Colors.success },
  processingBanner:     { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: BorderRadius.md, padding: Spacing.sm, borderWidth: 1, marginBottom: 4 },
  processingTitle:      { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  infoSection:          { padding: Spacing.md, gap: Spacing.sm },
  textRight:            { textAlign: 'right' },
  rowRev:               { flexDirection: 'row-reverse' },
  seriesLabel:          { fontSize: FontSize.xs, color: Colors.gold, fontWeight: FontWeight.semibold },
  titleText:            { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.textPrimary, lineHeight: 28 },
  metaRow:              { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  metaBadge:            { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.sm, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: Colors.border },
  metaBadgeText:        { fontSize: 11, color: Colors.textMuted },
  progressBar:          { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressBarTrack:     { flex: 1, height: 4, borderRadius: 2, backgroundColor: Colors.border, overflow: 'hidden' },
  progressBarFill:      { height: '100%', borderRadius: 2, backgroundColor: Colors.gold, minWidth: 4 },
  progressText:         { fontSize: 11, color: Colors.gold, fontWeight: FontWeight.medium, includeFontPadding: false },
  channelRow:           { flexDirection: 'row', alignItems: 'center', gap: 10 },
  channelAvatar:        { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.surfaceCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.borderLight },
  channelName:          { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  channelSub:           { fontSize: FontSize.xs, color: Colors.textMuted },
  actionsRow:           { flexDirection: 'row', alignItems: 'center', gap: 10 },
  watchBtn:             { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.gold, borderRadius: BorderRadius.lg, paddingVertical: 13 },
  watchBtnDisabled:     { backgroundColor: Colors.surfaceElevated, borderWidth: 1, borderColor: Colors.border },
  watchBtnText:         { fontSize: FontSize.body, fontWeight: FontWeight.bold, color: Colors.textInverse },
  iconActionBtn:        { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.surfaceCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.border },
  iconActionBtnActive:  { backgroundColor: Colors.primary, borderColor: Colors.primary },
  toolbarRow:           { flexDirection: 'row', gap: 6 },
  toolbarBtn:           { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.md, paddingHorizontal: 10, paddingVertical: 9, borderWidth: 1, borderColor: Colors.border },
  toolbarBtnText:       { flex: 1, fontSize: 11, color: Colors.textPrimary, fontWeight: FontWeight.medium, includeFontPadding: false },
  nextEpBtn:            { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.lg, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.gold + '44' },
  nextEpInfo:           { flex: 1 },
  nextEpLabel:          { fontSize: 11, color: Colors.gold, fontWeight: FontWeight.semibold, includeFontPadding: false },
  nextEpTitle:          { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textPrimary, includeFontPadding: false },
  descText:             { fontSize: FontSize.body, color: Colors.textSecondary, lineHeight: 24 },
  tagsRow:              { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagChip:              { backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.sm, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: Colors.border },
  tagText:              { fontSize: 11, color: Colors.textMuted },
  attributionCard:      { backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.lg, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  attributionHeader:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  attributionHeaderText:{ flex: 1, gap: 4 },
  attributionTitle:     { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  licenseBadge:         { alignSelf: 'flex-start', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, backgroundColor: Colors.surfaceElevated },
  licenseBadgeText:     { fontSize: 10, fontWeight: FontWeight.bold },
  attributionBody:      { marginTop: 10, gap: 8 },
  attributionRow:       { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  attributionLabel:     { fontSize: 11, color: Colors.textMuted, width: 90, flexShrink: 0 },
  attributionValue:     { flex: 1, fontSize: 12, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  attributionTextBox:   { backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.sm, padding: 8, gap: 4 },
  attributionTextLabel: { fontSize: 10, color: Colors.textMuted },
  attributionTextContent:{ fontSize: 11, color: Colors.textSecondary, lineHeight: 16 },
  cdnNotice:            { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.success + '11', borderRadius: 4, paddingHorizontal: 7, paddingVertical: 4 },
  cdnNoticeText:        { flex: 1, fontSize: 10, color: Colors.success },
  relatedSection:       { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xl },
  relatedTitle:         { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  relCard:              { flexDirection: 'row', gap: Spacing.sm, backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.lg, overflow: 'hidden', marginBottom: 10, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  pressed:              { opacity: 0.8, transform: [{ scale: 0.98 }] },
  relThumbWrap:         { width: 130, height: 80, position: 'relative' },
  relThumb:             { width: '100%', height: '100%' },
  relLicenseBadge:      { position: 'absolute', bottom: 4, left: 4, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 3, paddingHorizontal: 4, paddingVertical: 2, borderWidth: 1 },
  relLicenseBadgeText:  { fontSize: 9, fontWeight: FontWeight.bold },
  relReadyBadge:        { position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: 9, backgroundColor: Colors.success + 'cc', alignItems: 'center', justifyContent: 'center' },
  relInfo:              { flex: 1, padding: 8, justifyContent: 'center' },
  relTitle:             { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary, lineHeight: 17 },
  relCreator:           { fontSize: 11, color: Colors.textMuted, marginTop: 3 },
  relDuration:          { fontSize: 10, color: Colors.gold, marginTop: 2 },
  // Sheets
  sheetOverlay:         { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet:                { backgroundColor: Colors.surfaceCard, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: Spacing.md, paddingBottom: 40, gap: 4 },
  sheetHandle:          { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 10 },
  sheetTitle:           { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 8 },
  sheetRow:             { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  sheetRowActive:       { backgroundColor: Colors.overlayLight, borderRadius: BorderRadius.sm },
  sheetRowDisabled:     { opacity: 0.4 },
  sheetEmptyRow:        { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16 },
  sheetRowText:         { flex: 1, fontSize: FontSize.body, color: Colors.textPrimary },
  sheetRowTextActive:   { color: Colors.gold, fontWeight: FontWeight.bold },
  sheetRowTextDisabled: { color: Colors.textMuted },
});
