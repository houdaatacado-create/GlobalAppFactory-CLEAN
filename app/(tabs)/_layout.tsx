// Powered by OnSpace.AI
import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight } from '../../constants/theme';
import { useLanguage } from '../../hooks/useLanguage';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const tabBarStyle = {
    height: Platform.select({ ios: insets.bottom + 60, android: insets.bottom + 60, default: 70 }),
    paddingTop: 8,
    paddingBottom: Platform.select({ ios: insets.bottom + 8, android: insets.bottom + 8, default: 8 }),
    paddingHorizontal: 8,
    backgroundColor: Colors.tabBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: Colors.gold,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: FontWeight.medium,
          includeFontPadding: false,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="quran"
        options={{
          title: t('quran'),
          tabBarIcon: ({ color, size }) => <MaterialIcons name="menu-book" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: t('ai'),
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.aiTab, focused && styles.aiTabActive]}>
              <MaterialIcons name="auto-awesome" size={22} color={focused ? Colors.textInverse : Colors.gold} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="watch"
        options={{
          title: t('watch'),
          tabBarIcon: ({ color, size }) => <MaterialIcons name="play-circle-filled" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: t('more'),
          tabBarIcon: ({ color, size }) => <MaterialIcons name="grid-view" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  aiTab: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.gold,
    marginTop: -8,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  aiTabActive: {
    backgroundColor: Colors.gold,
    shadowOpacity: 0.6,
  },
});
