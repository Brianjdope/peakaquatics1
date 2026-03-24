import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, fonts } from '../theme'

const ITEMS = [
  { label: 'About', emoji: '👤', route: 'About' },
  { label: 'Services', emoji: '🏊', route: 'Services' },
  { label: 'Contact', emoji: '📬', route: 'Contact' },
]

export default function MoreScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>NAVIGATION</Text>
        <Text style={styles.headerTitle}>More</Text>
      </View>
      <View style={styles.list}>
        {ITEMS.map(item => (
          <TouchableOpacity
            key={item.route}
            style={styles.item}
            onPress={() => navigation.navigate(item.route)}
            activeOpacity={0.7}
          >
            <Text style={styles.itemEmoji}>{item.emoji}</Text>
            <Text style={styles.itemLabel}>{item.label}</Text>
            <Text style={styles.itemArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLabel: { color: colors.accent, fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  headerTitle: { fontFamily: fonts.serif, fontSize: 32, color: colors.text, marginTop: 4 },
  list: { padding: spacing.md, gap: spacing.sm },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.lg,
    gap: spacing.md,
  },
  itemEmoji: { fontSize: 24 },
  itemLabel: { flex: 1, color: colors.text, fontSize: 17, fontWeight: '600' },
  itemArrow: { color: colors.muted, fontSize: 22 },
})
