// Powered by OnSpace.AI
// Reciter Selector Bottom Sheet
// Shows: Favorites | Featured | All Reciters
// Arabic search with normalization + debug diagnostics

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Modal, Pressable,
  ScrollView, TextInput, ActivityIndicator,
  FlatList, KeyboardAvoidingView, Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import {
  QuranReciter, QuranMoshaf, searchReciters, isFeaturedReciter,
  getDefaultMoshaf, clearRecitersCache, lastFetchError, isSurahAvailable,
} from '../../services/quranAudioService';
import { useQuranAudio } from '../../hooks/useQuranAudio';
import { useLanguage } from '../../hooks/useLanguage';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (reciter: QuranReciter, moshaf: QuranMoshaf) => void;
  currentSurah?: number;
}

type SectionKey = 'all' | 'featured' | 'favorites';

const SECTIONS: { key: SectionKey; labelAr: string; icon: string }[] = [
  { key: 'all',       labelAr: 'كل القراء',        icon: 'format-list-bulleted' },
  { key: 'featured',  labelAr: 'القراء المشهورون', icon: 'star'                 },
  { key: 'favorites', labelAr: 'المفضلة',          icon: 'favorite'             },
];

export function ReciterSelector({ visible, onClose, onSelect, currentSurah }: Props) {
  const insets = useSafeAreaInsets();
  const { isRTL } = useLanguage();
  const {
    reciters, catalogLoading, currentReciter,
    favoriteReciterIds, toggleFavoriteReciter,
  } = useQuranAudio();

  const [searchQuery, setSearchQuery] = useState('');
  // Default to 'all' so the full list is always visible immediately
  const [activeSection, setActiveSection] = useState<SectionKey>('all');
  const [selectedReciter, setSelectedReciter] = useState<QuranReciter | null>(null);
  const [selectedMoshaf, setSelectedMoshaf] = useState<QuranMoshaf | null>(null);
  const [retrying, setRetrying] = useState(false);
  const searchRef = useRef<TextInput>(null);

  // Reset on open
  useEffect(() => {
    if (visible) {
      setSearchQuery('');
      setActiveSection('all');
      setSelectedReciter(currentReciter);
      setSelectedMoshaf(null);
    }
  }, [visible, currentReciter]);

  // ── Section-filtered reciters ─────────────────────────────────────────────

  const sectionReciters = useMemo(() => {
    // Filter to only reciters that have the current surah available (if provided)
    const base = currentSurah
      ? reciters.filter(r =>
          r.moshaf.some(m => isSurahAvailable(m, currentSurah))
        )
      : reciters;

    switch (activeSection) {
      case 'featured': {
        const feat = base.filter(r => isFeaturedReciter(r));
        // If no featured match (name matching failed), fall back to full list
        return feat.length > 0 ? feat : base;
      }
      case 'favorites':
        return base.filter(r => favoriteReciterIds.includes(r.id));
      case 'all':
      default:
        return base;
    }
  }, [reciters, activeSection, favoriteReciterIds, currentSurah]);

  const filteredReciters = useMemo(() => {
    if (!searchQuery.trim()) return sectionReciters;
    return searchReciters(sectionReciters, searchQuery);
  }, [sectionReciters, searchQuery]);

  // ── Diagnostics ───────────────────────────────────────────────────────────

  const featuredCount = useMemo(() => reciters.filter(r => isFeaturedReciter(r)).length, [reciters]);
  const surahAvailableCount = useMemo(() => {
    if (!currentSurah) return reciters.length;
    return reciters.filter(r => r.moshaf.some(m => isSurahAvailable(m, currentSurah))).length;
  }, [reciters, currentSurah]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSelectReciter = useCallback((reciter: QuranReciter) => {
    setSelectedReciter(reciter);
    // Pick best moshaf for this surah
    let best: QuranMoshaf | null = null;
    if (currentSurah) {
      best = reciter.moshaf.find(m => isSurahAvailable(m, currentSurah)) || null;
    }
    setSelectedMoshaf(best || getDefaultMoshaf(reciter));
  }, [currentSurah]);

  const handleConfirm = useCallback(() => {
    if (!selectedReciter) return;
    const moshaf = selectedMoshaf || getDefaultMoshaf(selectedReciter);
    if (!moshaf) return;

    // Log for debugging
    const audioUrl = `${moshaf.server}${String(currentSurah || 1).padStart(3, '0')}.mp3`;
    console.log('[ReciterSelector] Confirmed reciter:', selectedReciter.name);
    console.log('[ReciterSelector] Moshaf:', moshaf.name);
    console.log('[ReciterSelector] Server:', moshaf.server);
    console.log('[ReciterSelector] Audio URL preview:', audioUrl);

    onSelect(selectedReciter, moshaf);
    onClose();
  }, [selectedReciter, selectedMoshaf, onSelect, onClose, currentSurah]);

  const handleRetry = useCallback(async () => {
    setRetrying(true);
    await clearRecitersCache();
    // The context will refetch on next render cycle — trigger by toggling
    setTimeout(() => setRetrying(false), 500);
  }, []);

  // ── Render item ───────────────────────────────────────────────────────────

  const renderReciterItem = useCallback(({ item }: { item: QuranReciter }) => {
    const isSelected = selectedReciter?.id === item.id;
    const isFav = favoriteReciterIds.includes(item.id);
    const defaultMoshaf = getDefaultMoshaf(item);

    return (
      <Pressable
        style={({ pressed }) => [s.reciterRow, isSelected && s.reciterRowSelected, pressed && s.pressed]}
        onPress={() => handleSelectReciter(item)}
      >
        {/* Avatar */}
        <View style={[s.avatar, isSelected && s.avatarSelected]}>
          <Text style={[s.avatarText, isSelected && s.avatarTextSelected]}>
            {item.name.trim().charAt(0)}
          </Text>
        </View>

        {/* Info */}
        <View style={s.reciterInfo}>
          <Text style={[s.reciterName, isSelected && s.reciterNameSelected]} numberOfLines={1}>
            {item.name}
          </Text>
          {defaultMoshaf ? (
            <Text style={s.riwaya} numberOfLines={1}>{defaultMoshaf.name}</Text>
          ) : null}
        </View>

        {/* Actions */}
        <View style={s.reciterActions}>
          <Pressable
            style={s.favBtn}
            onPress={() => toggleFavoriteReciter(item.id)}
            hitSlop={8}
          >
            <MaterialIcons
              name={isFav ? 'favorite' : 'favorite-border'}
              size={18}
              color={isFav ? '#EF4444' : Colors.textMuted}
            />
          </Pressable>
          {isSelected ? (
            <MaterialIcons name="check-circle" size={20} color={Colors.gold} />
          ) : null}
        </View>
      </Pressable>
    );
  }, [selectedReciter, favoriteReciterIds, handleSelectReciter, toggleFavoriteReciter]);

  // ── Mushaf picker ─────────────────────────────────────────────────────────

  const MoshafPicker = selectedReciter && selectedReciter.moshaf.length > 1 ? (
    <View style={s.moshafPicker}>
      <Text style={s.moshafLabel}>الرواية</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: Spacing.md }}
      >
        {selectedReciter.moshaf.map(m => {
          const isActive = selectedMoshaf?.id === m.id ||
            (!selectedMoshaf && m === getDefaultMoshaf(selectedReciter));
          return (
            <Pressable
              key={m.id}
              style={[s.moshafChip, isActive && s.moshafChipActive]}
              onPress={() => setSelectedMoshaf(m)}
            >
              <Text style={[s.moshafChipText, isActive && s.moshafChipTextActive]} numberOfLines={1}>
                {m.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  ) : null;

  // ── Empty state content ───────────────────────────────────────────────────

  const EmptyState = () => {
    if (catalogLoading || retrying) {
      return (
        <View style={s.loadingWrap}>
          <ActivityIndicator size="small" color={Colors.gold} />
          <Text style={s.loadingText}>جارٍ تحميل القراء...</Text>
        </View>
      );
    }

    const fetchErr = lastFetchError;

    if (reciters.length === 0) {
      return (
        <View style={s.emptyWrap}>
          <MaterialIcons name="wifi-off" size={40} color={Colors.textMuted} />
          <Text style={s.emptyTitle}>تعذّر تحميل قائمة القراء</Text>
          {fetchErr ? (
            <Text style={s.emptyError} numberOfLines={3}>{fetchErr}</Text>
          ) : null}
          <Pressable style={s.retryBtn} onPress={handleRetry}>
            <MaterialIcons name="refresh" size={16} color={Colors.textInverse} />
            <Text style={s.retryBtnText}>إعادة المحاولة</Text>
          </Pressable>
        </View>
      );
    }

    if (activeSection === 'favorites' && filteredReciters.length === 0) {
      return (
        <View style={s.emptyWrap}>
          <MaterialIcons name="favorite-border" size={36} color={Colors.textMuted} />
          <Text style={s.emptyTitle}>لا يوجد قراء في المفضلة</Text>
          <Text style={s.emptySubtitle}>اضغط على ❤ بجانب أي قارئ لإضافته</Text>
        </View>
      );
    }

    if (searchQuery && filteredReciters.length === 0) {
      return (
        <View style={s.emptyWrap}>
          <MaterialIcons name="search-off" size={36} color={Colors.textMuted} />
          <Text style={s.emptyTitle}>{`لم يُعثر على "${searchQuery}"`}</Text>
        </View>
      );
    }

    return null;
  };

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <Pressable style={s.overlayBg} onPress={onClose} />
        <KeyboardAvoidingView
          style={s.sheet}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[s.sheetInner, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            {/* Handle */}
            <View style={s.handle} />

            {/* Title + counter */}
            <View style={s.sheetHeader}>
              <View>
                <Text style={s.sheetTitle}>اختر القارئ</Text>
                {reciters.length > 0 ? (
                  <Text style={s.sheetSubtitle}>
                    {surahAvailableCount} قارئ متاح{currentSurah ? ` للسورة ${currentSurah}` : ''}
                  </Text>
                ) : null}
              </View>
              <Pressable onPress={onClose} hitSlop={8}>
                <MaterialIcons name="close" size={22} color={Colors.textMuted} />
              </Pressable>
            </View>

            {/* Debug diagnostics (shown when catalog loaded but no featured match) */}
            {reciters.length > 0 && featuredCount === 0 ? (
              <View style={s.debugBanner}>
                <MaterialIcons name="info-outline" size={13} color={Colors.gold} />
                <Text style={s.debugText}>
                  {`مُحمَّل: ${reciters.length} قارئ — القراء المشهورون: ${featuredCount}`}
                </Text>
              </View>
            ) : reciters.length > 0 ? (
              <View style={s.infoBanner}>
                <MaterialIcons name="check-circle" size={13} color="#22c55e" />
                <Text style={s.infoText}>
                  {`${reciters.length} قارئ — ${featuredCount} مشهور`}
                </Text>
              </View>
            ) : null}

            {/* Search */}
            <View style={s.searchWrap}>
              <MaterialIcons name="search" size={18} color={Colors.textMuted} />
              <TextInput
                ref={searchRef}
                style={s.searchInput}
                placeholder="ابحث عن قارئ..."
                placeholderTextColor={Colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                textAlign="right"
                returnKeyType="search"
              />
              {searchQuery ? (
                <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                  <MaterialIcons name="close" size={16} color={Colors.textMuted} />
                </Pressable>
              ) : null}
            </View>

            {/* Section tabs — only when not searching */}
            {!searchQuery ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.sectionTabs}
              >
                {SECTIONS.map(sec => (
                  <Pressable
                    key={sec.key}
                    style={[s.sectionTab, activeSection === sec.key && s.sectionTabActive]}
                    onPress={() => setActiveSection(sec.key)}
                  >
                    <MaterialIcons
                      name={sec.icon as any}
                      size={13}
                      color={activeSection === sec.key ? Colors.textInverse : Colors.textSecondary}
                    />
                    <Text style={[s.sectionTabText, activeSection === sec.key && s.sectionTabTextActive]}>
                      {sec.labelAr}
                    </Text>
                    {sec.key === 'all' && reciters.length > 0 ? (
                      <View style={s.badge}>
                        <Text style={s.badgeText}>{surahAvailableCount}</Text>
                      </View>
                    ) : sec.key === 'favorites' && favoriteReciterIds.length > 0 ? (
                      <View style={s.badge}>
                        <Text style={s.badgeText}>{favoriteReciterIds.length}</Text>
                      </View>
                    ) : null}
                  </Pressable>
                ))}
              </ScrollView>
            ) : null}

            {/* Moshaf picker */}
            {MoshafPicker}

            {/* List or empty state */}
            {catalogLoading || retrying || reciters.length === 0 ||
             (filteredReciters.length === 0) ? (
              <EmptyState />
            ) : (
              <FlatList
                data={filteredReciters}
                renderItem={renderReciterItem}
                keyExtractor={item => String(item.id)}
                style={s.list}
                showsVerticalScrollIndicator={false}
                initialNumToRender={20}
                keyboardShouldPersistTaps="handled"
                getItemLayout={(_, index) => ({ length: 66, offset: 66 * index, index })}
              />
            )}

            {/* Confirm button */}
            {selectedReciter ? (
              <Pressable style={s.confirmBtn} onPress={handleConfirm}>
                <MaterialIcons name="headphones" size={18} color={Colors.textInverse} />
                <Text style={s.confirmBtnText} numberOfLines={1}>
                  {`استمع مع ${selectedReciter.name}`}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay:              { flex: 1, justifyContent: 'flex-end' },
  overlayBg:            { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet:                { maxHeight: '88%' },
  sheetInner:           { backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  handle:               { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  sheetHeader:          { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sheetTitle:           { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, includeFontPadding: false },
  sheetSubtitle:        { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2, includeFontPadding: false },
  debugBanner:          { flexDirection: 'row', alignItems: 'center', gap: 5, marginHorizontal: Spacing.md, marginTop: 6, backgroundColor: Colors.gold + '15', borderRadius: BorderRadius.sm, padding: 7, borderWidth: 1, borderColor: Colors.gold + '44' },
  debugText:            { fontSize: 11, color: Colors.gold, flex: 1, includeFontPadding: false },
  infoBanner:           { flexDirection: 'row', alignItems: 'center', gap: 5, marginHorizontal: Spacing.md, marginTop: 4, paddingHorizontal: 8 },
  infoText:             { fontSize: 11, color: Colors.textMuted, includeFontPadding: false },
  searchWrap:           { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: Spacing.md, marginVertical: 10, backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.md, paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, borderColor: Colors.border },
  searchInput:          { flex: 1, fontSize: FontSize.body, color: Colors.textPrimary, includeFontPadding: false },
  sectionTabs:          { paddingHorizontal: Spacing.md, gap: 8, paddingBottom: 8 },
  sectionTab:           { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border },
  sectionTabActive:     { backgroundColor: Colors.primary, borderColor: Colors.primary },
  sectionTabText:       { fontSize: 12, color: Colors.textSecondary, fontWeight: FontWeight.medium, includeFontPadding: false },
  sectionTabTextActive: { color: Colors.textPrimary, fontWeight: FontWeight.semibold, includeFontPadding: false },
  badge:                { backgroundColor: Colors.gold, borderRadius: 8, paddingHorizontal: 5, minWidth: 18, alignItems: 'center' },
  badgeText:            { fontSize: 9, color: Colors.textInverse, fontWeight: FontWeight.bold, includeFontPadding: false },
  moshafPicker:         { marginBottom: 6 },
  moshafLabel:          { fontSize: FontSize.xs, color: Colors.textMuted, paddingHorizontal: Spacing.md, marginBottom: 5, textAlign: 'right', includeFontPadding: false },
  moshafChip:           { paddingHorizontal: 12, paddingVertical: 7, backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border },
  moshafChipActive:     { backgroundColor: Colors.gold, borderColor: Colors.gold },
  moshafChipText:       { fontSize: 12, color: Colors.textSecondary, maxWidth: 150, includeFontPadding: false },
  moshafChipTextActive: { color: Colors.textInverse, fontWeight: FontWeight.semibold, includeFontPadding: false },
  list:                 { maxHeight: 360 },
  pressed:              { opacity: 0.75 },
  reciterRow:           { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: Colors.divider, gap: 10, minHeight: 66 },
  reciterRowSelected:   { backgroundColor: Colors.overlayLight },
  avatar:               { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border, flexShrink: 0 },
  avatarSelected:       { backgroundColor: Colors.gold, borderColor: Colors.gold },
  avatarText:           { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textSecondary, includeFontPadding: false },
  avatarTextSelected:   { color: Colors.textInverse, includeFontPadding: false },
  reciterInfo:          { flex: 1, gap: 2 },
  reciterName:          { fontSize: FontSize.body, fontWeight: FontWeight.semibold, color: Colors.textPrimary, textAlign: 'right', includeFontPadding: false },
  reciterNameSelected:  { color: Colors.gold },
  riwaya:               { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'right', includeFontPadding: false },
  reciterActions:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  favBtn:               { padding: 4 },
  loadingWrap:          { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadingText:          { fontSize: FontSize.sm, color: Colors.textMuted, includeFontPadding: false },
  emptyWrap:            { alignItems: 'center', paddingVertical: 36, gap: 10, paddingHorizontal: 24 },
  emptyTitle:           { fontSize: FontSize.body, fontWeight: FontWeight.semibold, color: Colors.textSecondary, textAlign: 'center', includeFontPadding: false },
  emptySubtitle:        { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', includeFontPadding: false },
  emptyError:           { fontSize: 11, color: Colors.error, textAlign: 'center', includeFontPadding: false },
  retryBtn:             { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingHorizontal: 18, paddingVertical: 10, marginTop: 6 },
  retryBtnText:         { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textInverse, includeFontPadding: false },
  confirmBtn:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: Spacing.md, marginTop: 10, backgroundColor: Colors.gold, borderRadius: BorderRadius.lg, paddingVertical: 14 },
  confirmBtnText:       { fontSize: FontSize.body, fontWeight: FontWeight.bold, color: Colors.textInverse, includeFontPadding: false, maxWidth: '85%' },
});
