import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, fonts } from '../theme'
import { RECORDS_HERO, RECORDS_TABLES } from '../data'

const TABS = [
  { key: 'scy-boys-14',  label: 'SCY Boys 14U' },
  { key: 'scy-girls-14', label: 'SCY Girls 14U' },
  { key: 'lcm-boys-14',  label: 'LCM Boys 14U' },
  { key: 'lcm-girls-14', label: 'LCM Girls 14U' },
  { key: 'scy-men',      label: 'SCY Men' },
  { key: 'scy-women',    label: 'SCY Women' },
  { key: 'lcm-men',      label: 'LCM Men' },
  { key: 'lcm-women',    label: 'LCM Women' },
]

// Parse a row array into places
// threeCol row: [event, s1, t1, y1, s2, t2, y2, s3, t3, y3]
// twoCol  row: [event, s1, t1, y1, s2, t2, y2]
function parsePlaces(row, threeCol) {
  const places = [
    { rank: '1st', swimmer: row[1], time: row[2], year: row[3] },
    { rank: '2nd', swimmer: row[4], time: row[5], year: row[6] },
  ]
  if (threeCol && row[7]) {
    places.push({ rank: '3rd', swimmer: row[7], time: row[8], year: row[9] })
  }
  return places
}

export default function RecordsScreen() {
  const [activeTab, setActiveTab] = useState('scy-boys-14')
  const table = RECORDS_TABLES[activeTab]

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.title}>Record Board</Text>
        </View>

        {/* Hero records */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.heroRow}>
          {RECORDS_HERO && RECORDS_HERO.map((r, i) => (
            <View key={i} style={styles.heroCard}>
              <Text style={styles.heroBadge}>{r.badge}</Text>
              <Text style={styles.heroTime}>{r.time}</Text>
              <Text style={styles.heroEvent}>{r.event}</Text>
              <Text style={styles.heroSwimmer}>{r.swimmer}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Tab selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Records table */}
        {table && table.rows.map((row, i) => {
          const places = parsePlaces(row, table.threeCol)
          return (
            <View key={i} style={[styles.eventBlock, i % 2 === 0 && styles.eventBlockAlt]}>
              <Text style={styles.eventName}>{row[0]}</Text>
              {places.map((p, j) => (
                <View key={j} style={styles.placeRow}>
                  <Text style={styles.rank}>{p.rank}</Text>
                  <Text style={styles.swimmer} numberOfLines={1}>{p.swimmer}</Text>
                  <Text style={styles.time}>{p.time}</Text>
                  <Text style={styles.year}>{p.year}</Text>
                </View>
              ))}
            </View>
          )
        })}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontFamily: fonts.serif, fontSize: 36, color: colors.text },
  heroRow: { padding: spacing.lg, paddingRight: spacing.xl },
  heroCard: {
    marginRight: spacing.lg,
    paddingRight: spacing.lg,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    minWidth: 140,
  },
  heroBadge: { color: colors.accent, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 4 },
  heroTime: { fontFamily: fonts.serif, fontSize: 30, color: colors.text },
  heroEvent: { color: colors.muted, fontSize: 12, marginTop: 2 },
  heroSwimmer: { color: colors.text, fontSize: 13, fontWeight: '600', marginTop: 2 },
  tabRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  tabText: { color: colors.muted, fontSize: 11, fontWeight: '600' },
  tabTextActive: { color: '#000' },
  eventBlock: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  eventBlockAlt: { backgroundColor: colors.surface },
  eventName: { color: colors.text, fontWeight: '700', fontSize: 13, marginBottom: 8 },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
  },
  rank: { color: colors.muted, fontSize: 11, width: 32 },
  swimmer: { color: colors.text, fontSize: 13, flex: 1 },
  time: { color: colors.accent, fontSize: 13, fontWeight: '700', marginHorizontal: spacing.sm },
  year: { color: colors.muted, fontSize: 11, width: 36, textAlign: 'right' },
})
