// Powered by OnSpace.AI
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../constants/theme';
import { AIMessage, AISource } from '../../services/aiService';
import { useLanguage } from '../../hooks/useLanguage';

interface Props {
  message: AIMessage;
  onFeedback?: (id: string, type: 'helpful' | 'not_helpful' | 'reported') => void;
  isStreaming?: boolean;
}

// ─── Markdown rules ───────────────────────────────────────────────────────────
// Custom render rules to ensure correct RTL/LTR rendering for Arabic content.
// Markdown nodes are rendered as native RN components — no HTML, no web views.

function buildMarkdownRules(isRTL: boolean) {
  return {
    // Force text-align on every paragraph based on language direction
    paragraph: (
      node: any,
      children: React.ReactNode,
      _parent: any,
      styles: any
    ) => (
      <Text key={node.key} style={[styles.paragraph, isRTL && mdRTL.paragraph]}>
        {children}
      </Text>
    ),
  };
}

// ─── Markdown styles (Noor Islamic dark green/gold theme) ─────────────────────

function buildMarkdownStyles(isRTL: boolean) {
  const textAlign = isRTL ? 'right' : 'left';
  const writingDirection = isRTL ? 'rtl' : 'ltr';

  return StyleSheet.create({
    // ── Block elements ──
    body: {
      color: Colors.textPrimary,
      fontSize: FontSize.body,
      lineHeight: 26,
      includeFontPadding: false,
      writingDirection,
    },
    paragraph: {
      color: Colors.textPrimary,
      fontSize: FontSize.body,
      lineHeight: 26,
      marginBottom: 10,
      marginTop: 0,
      textAlign,
      writingDirection,
      includeFontPadding: false,
    },

    // ── Headings ──
    heading1: {
      color: Colors.gold,
      fontSize: FontSize.lg,
      fontWeight: FontWeight.bold,
      lineHeight: 30,
      marginTop: 14,
      marginBottom: 8,
      textAlign,
      writingDirection,
      includeFontPadding: false,
    },
    heading2: {
      color: Colors.gold,
      fontSize: FontSize.md,
      fontWeight: FontWeight.bold,
      lineHeight: 28,
      marginTop: 12,
      marginBottom: 6,
      textAlign,
      writingDirection,
      includeFontPadding: false,
    },
    heading3: {
      color: Colors.goldLight,
      fontSize: FontSize.body + 1,
      fontWeight: FontWeight.semibold,
      lineHeight: 26,
      marginTop: 10,
      marginBottom: 4,
      textAlign,
      writingDirection,
      includeFontPadding: false,
    },
    heading4: {
      color: Colors.textPrimary,
      fontSize: FontSize.body,
      fontWeight: FontWeight.semibold,
      lineHeight: 24,
      marginTop: 8,
      marginBottom: 4,
      textAlign,
      writingDirection,
      includeFontPadding: false,
    },
    heading5: {
      color: Colors.textSecondary,
      fontSize: FontSize.sm,
      fontWeight: FontWeight.semibold,
      lineHeight: 22,
      marginTop: 6,
      marginBottom: 2,
      textAlign,
      writingDirection,
      includeFontPadding: false,
    },
    heading6: {
      color: Colors.textMuted,
      fontSize: FontSize.sm,
      fontWeight: FontWeight.medium,
      lineHeight: 20,
      marginTop: 4,
      marginBottom: 2,
      textAlign,
      writingDirection,
      includeFontPadding: false,
    },

    // ── Inline ──
    strong: {
      fontWeight: FontWeight.bold,
      color: Colors.textPrimary,
    },
    em: {
      fontStyle: 'italic',
      color: Colors.textSecondary,
    },
    s: {
      textDecorationLine: 'line-through',
      color: Colors.textMuted,
    },
    code_inline: {
      backgroundColor: Colors.surfaceElevated,
      color: Colors.gold,
      fontFamily: 'monospace',
      fontSize: FontSize.sm,
      paddingHorizontal: 5,
      paddingVertical: 1,
      borderRadius: 4,
    },

    // ── Lists ──
    bullet_list: {
      marginBottom: 10,
      marginTop: 4,
      paddingRight: isRTL ? 4 : 0,
    },
    ordered_list: {
      marginBottom: 10,
      marginTop: 4,
      paddingRight: isRTL ? 4 : 0,
    },
    list_item: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
      marginBottom: 6,
    },
    bullet_list_icon: {
      color: Colors.gold,
      fontSize: FontSize.body,
      lineHeight: 26,
      marginRight: isRTL ? 0 : 8,
      marginLeft: isRTL ? 8 : 0,
      includeFontPadding: false,
    },
    ordered_list_icon: {
      color: Colors.gold,
      fontSize: FontSize.body,
      lineHeight: 26,
      fontWeight: FontWeight.semibold,
      marginRight: isRTL ? 0 : 8,
      marginLeft: isRTL ? 8 : 0,
      minWidth: 20,
      includeFontPadding: false,
    },
    bullet_list_content: {
      flex: 1,
      color: Colors.textPrimary,
      fontSize: FontSize.body,
      lineHeight: 26,
      textAlign,
      writingDirection,
      includeFontPadding: false,
    },
    ordered_list_content: {
      flex: 1,
      color: Colors.textPrimary,
      fontSize: FontSize.body,
      lineHeight: 26,
      textAlign,
      writingDirection,
      includeFontPadding: false,
    },

    // ── Blockquote ──
    blockquote: {
      backgroundColor: Colors.surfaceElevated,
      borderLeftWidth: isRTL ? 0 : 3,
      borderRightWidth: isRTL ? 3 : 0,
      borderLeftColor: isRTL ? 'transparent' : Colors.gold,
      borderRightColor: isRTL ? Colors.gold : 'transparent',
      paddingHorizontal: 14,
      paddingVertical: 8,
      marginVertical: 8,
      borderRadius: 4,
    },

    // ── Code block ──
    fence: {
      backgroundColor: Colors.background,
      borderRadius: BorderRadius.md,
      padding: 12,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: Colors.border,
      color: Colors.gold,
      fontFamily: 'monospace',
      fontSize: FontSize.sm,
      lineHeight: 20,
      includeFontPadding: false,
    },
    code_block: {
      backgroundColor: Colors.background,
      borderRadius: BorderRadius.md,
      padding: 12,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: Colors.border,
      color: Colors.gold,
      fontFamily: 'monospace',
      fontSize: FontSize.sm,
      lineHeight: 20,
      includeFontPadding: false,
    },

    // ── Horizontal rule ──
    hr: {
      backgroundColor: Colors.border,
      height: 1,
      marginVertical: 12,
    },

    // ── Links ──
    link: {
      color: Colors.goldLight,
      textDecorationLine: 'underline',
    },
    blocklink: {
      color: Colors.goldLight,
    },

    // ── Images (disabled in AI context) ──
    image: {
      display: 'none',
    },

    // ── Table (basic support) ──
    table: {
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: BorderRadius.sm,
      marginVertical: 8,
      overflow: 'hidden',
    },
    thead: {
      backgroundColor: Colors.surfaceElevated,
    },
    tbody: {},
    th: {
      padding: 8,
      color: Colors.gold,
      fontWeight: FontWeight.semibold,
      fontSize: FontSize.sm,
      textAlign,
      includeFontPadding: false,
    },
    td: {
      padding: 8,
      color: Colors.textSecondary,
      fontSize: FontSize.sm,
      borderTopWidth: 1,
      borderTopColor: Colors.divider,
      textAlign,
      includeFontPadding: false,
    },
    tr: {},
  });
}

// ─── RTL override styles (applied via custom rules) ───────────────────────────

const mdRTL = StyleSheet.create({
  paragraph: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

// ─── Source chip ──────────────────────────────────────────────────────────────

function SourceChip({ source }: { source: AISource }) {
  const iconMap: Record<string, keyof typeof MaterialIcons.glyphMap> = {
    quran: 'menu-book',
    hadith: 'format-quote',
    tafseer: 'library-books',
    scholar: 'person',
  };
  return (
    <View style={sourceStyles.chip}>
      <MaterialIcons name={iconMap[source.type] || 'info'} size={12} color={Colors.gold} />
      <View>
        <Text style={sourceStyles.chipTitle}>{source.title}</Text>
        <Text style={sourceStyles.chipRef}>{source.reference}</Text>
      </View>
    </View>
  );
}

const sourceStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipTitle: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.gold, includeFontPadding: false },
  chipRef: { fontSize: 10, color: Colors.textSecondary, includeFontPadding: false },
});

// ─── Main bubble ──────────────────────────────────────────────────────────────

export function AIMessageBubble({ message, onFeedback, isStreaming }: Props) {
  const { t, isRTL } = useLanguage();
  const isUser = message.role === 'user';
  const [showSources, setShowSources] = useState(false);

  // ── User bubble (no Markdown needed — just plain text) ────────────────────
  if (isUser) {
    return (
      <View style={[styles.userWrap, isRTL && { alignItems: 'flex-start' }]}>
        <View style={styles.userBubble}>
          <Text style={[styles.userText, isRTL && styles.textRight]}>{message.content}</Text>
        </View>
      </View>
    );
  }

  // ── Markdown styles — memoized on isRTL to avoid rebuilding every render ──
  const mdStyles = buildMarkdownStyles(isRTL);
  const mdRules  = buildMarkdownRules(isRTL);

  return (
    <View style={styles.aiBubbleWrap}>
      {/* AI Avatar */}
      <View style={styles.aiAvatar}>
        <MaterialIcons name="auto-awesome" size={16} color={Colors.gold} />
      </View>

      <View style={styles.aiContent}>
        <View style={styles.aiBubble}>
          {isStreaming ? (
            // ── STREAMING: plain text + blinking cursor ─────────────────────
            // Avoid rendering incomplete Markdown that causes visual glitches
            // (e.g. "**partial" showing half-bold, unclosed lists, etc.)
            <Text style={[styles.streamingText, isRTL && styles.textRight]}>
              {message.content}
              <Text style={styles.cursor}>▊</Text>
            </Text>
          ) : (
            // ── COMPLETED: full Markdown rendering ──────────────────────────
            <Markdown
              style={mdStyles}
              rules={mdRules}
              mergeStyle
            >
              {message.content || ''}
            </Markdown>
          )}
        </View>

        {/* Sources toggle */}
        {message.sources && message.sources.length > 0 ? (
          <Pressable
            style={styles.sourcesToggle}
            onPress={() => setShowSources(!showSources)}
          >
            <MaterialIcons name={showSources ? 'expand-less' : 'expand-more'} size={16} color={Colors.gold} />
            <Text style={styles.sourcesLabel}>{t('aiSources')} ({message.sources.length})</Text>
          </Pressable>
        ) : null}

        {showSources && message.sources ? (
          <View style={styles.sourcesList}>
            {message.sources.map((s, i) => <SourceChip key={i} source={s} />)}
          </View>
        ) : null}

        {/* Feedback — only after streaming ends and there is content */}
        {!message.feedback && !isStreaming && message.content ? (
          <View style={[styles.feedbackRow, isRTL && styles.feedbackRowRTL]}>
            <Pressable
              style={styles.feedbackBtn}
              onPress={() => onFeedback?.(message.id, 'helpful')}
            >
              <MaterialIcons name="thumb-up" size={14} color={Colors.textMuted} />
              <Text style={styles.feedbackText}>{t('aiHelpful')}</Text>
            </Pressable>
            <Pressable
              style={styles.feedbackBtn}
              onPress={() => onFeedback?.(message.id, 'not_helpful')}
            >
              <MaterialIcons name="thumb-down" size={14} color={Colors.textMuted} />
              <Text style={styles.feedbackText}>{t('aiNotHelpful')}</Text>
            </Pressable>
            <Pressable
              style={styles.feedbackBtn}
              onPress={() => onFeedback?.(message.id, 'reported')}
            >
              <MaterialIcons name="flag" size={14} color={Colors.error} />
              <Text style={[styles.feedbackText, { color: Colors.error }]}>{t('aiReport')}</Text>
            </Pressable>
          </View>
        ) : null}

        {message.feedback ? (
          <Text style={styles.feedbackDone}>
            {message.feedback === 'helpful' ? '👍' : message.feedback === 'reported' ? '🚩' : '👎'}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ── User ──
  userWrap: {
    alignItems: 'flex-end',
    marginVertical: 4,
    paddingHorizontal: Spacing.md,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '80%',
  },
  userText: {
    fontSize: FontSize.body,
    color: Colors.textPrimary,
    lineHeight: 22,
    includeFontPadding: false,
  },
  textRight: { textAlign: 'right' },

  // ── AI ──
  aiBubbleWrap: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: Spacing.md,
    gap: 8,
    alignItems: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    flexShrink: 0,
  },
  aiContent: { flex: 1, gap: 6 },
  aiBubble: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: BorderRadius.xl,
    borderTopLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  // Plain text used ONLY during streaming (avoids broken-markdown glitches)
  streamingText: {
    fontSize: FontSize.body,
    color: Colors.textPrimary,
    lineHeight: 26,
    includeFontPadding: false,
  },

  // Blinking cursor appended to the streaming text
  cursor: {
    color: Colors.gold,
    fontWeight: FontWeight.bold,
  },

  // ── Sources ──
  sourcesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 4,
  },
  sourcesLabel: {
    fontSize: FontSize.xs,
    color: Colors.gold,
    fontWeight: FontWeight.medium,
    includeFontPadding: false,
  },
  sourcesList: { gap: 6 },

  // ── Feedback ──
  feedbackRow: { flexDirection: 'row', gap: 8, paddingLeft: 4 },
  feedbackRowRTL: { flexDirection: 'row-reverse', paddingLeft: 0, paddingRight: 4 },
  feedbackBtn: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  feedbackText: { fontSize: 11, color: Colors.textMuted, includeFontPadding: false },
  feedbackDone: { fontSize: FontSize.sm, paddingLeft: 4 },
});
