// Powered by OnSpace.AI
import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, ActivityIndicator, View } from 'react-native';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '../../constants/theme';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export function GoldButton({
  label, onPress, variant = 'primary', size = 'md',
  loading = false, disabled = false, style, icon
}: Props) {
  const sizeStyles = SIZE_MAP[size];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        sizeStyles,
        variant === 'primary' && styles.primary,
        variant === 'outline' && styles.outline,
        variant === 'ghost' && styles.ghost,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' ? Colors.textInverse : Colors.gold} />
      ) : (
        <View style={styles.inner}>
          {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
          <Text style={[
            styles.label,
            size === 'sm' && styles.labelSm,
            size === 'lg' && styles.labelLg,
            variant === 'outline' && styles.labelOutline,
            variant === 'ghost' && styles.labelGhost,
            (disabled) && styles.labelDisabled,
          ]}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const SIZE_MAP = {
  sm: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: BorderRadius.md },
  md: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: BorderRadius.lg },
  lg: { paddingVertical: 18, paddingHorizontal: 32, borderRadius: BorderRadius.xl },
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: Colors.gold,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.gold,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  iconWrap: {
    marginRight: 4,
  },
  label: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
    color: Colors.textInverse,
    includeFontPadding: false,
  },
  labelSm: { fontSize: FontSize.sm },
  labelLg: { fontSize: FontSize.md },
  labelOutline: { color: Colors.gold },
  labelGhost: { color: Colors.gold },
  labelDisabled: { color: Colors.textMuted },
});
