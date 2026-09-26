// Powered by OnSpace.AI
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../constants/theme';

export function GoldDivider({ style }: { style?: object }) {
  return <View style={[styles.divider, style]} />;
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
});
