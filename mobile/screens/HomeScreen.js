import React from 'react'
import { View, Text, ScrollView, StyleSheet, FlatList, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, fonts } from '../theme'
import { STATS, TESTIMONIALS } from '../data'
import SwimIn from '../components/SwimIn'
import WaveBackground from '../components/WaveBackground'
import StrokeAnalysis from '../components/StrokeAnalysis'

const { width } = Dimensions.get('window')

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.hero}>
          <WaveBackground height={80} color="rgba(255,255,255,0.02)" speed={8000} />
          <SwimIn delay={100} direction="up">
            <Text style={styles.eyebrow}>RAMSEY, NJ · EST. 2021</Text>
          </SwimIn>
          <SwimIn delay={250} direction="up">
            <Text style={styles.title}>Peak Aquatic{'\n'}Sports</Text>
          </SwimIn>
          <SwimIn delay={400} direction="up">
            <Text style={styles.sub}>Elite swimming coaching and collegiate recruitment consulting.</Text>
          </SwimIn>
        </View>

        <View style={styles.statsGrid}>
          {STATS.map((s, i) => (
            <SwimIn key={i} delay={500 + i * 120} direction={i % 2 === 0 ? 'left' : 'right'}>
              <View style={[styles.stat, i % 2 !== 0 && styles.statRight]}>
                <Text style={styles.statNum}>{s.num}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            </SwimIn>
          ))}
        </View>

        <WaveBackground height={50} color="rgba(255,255,255,0.015)" speed={10000} />

        <View style={styles.section}>
          <SwimIn delay={900} direction="up">
            <Text style={styles.sectionLabel}>ATHLETE VOICES</Text>
          </SwimIn>
          <FlatList
            data={TESTIMONIALS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item, index }) => (
              <SwimIn delay={1000 + index * 100} direction="right" distance={30}>
                <View style={styles.testimonial}>
                  <Text style={styles.quote}>"{item.quote}"</Text>
                  <Text style={styles.quoteMeta}>{item.name} · {item.school}</Text>
                </View>
              </SwimIn>
            )}
            contentContainerStyle={{ paddingRight: spacing.lg }}
          />
        </View>

        {/* Stroke Analysis Animation */}
        <SwimIn delay={1200} direction="up">
          <StrokeAnalysis />
        </SwimIn>

        <WaveBackground height={40} color="rgba(255,255,255,0.02)" speed={7000} />

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  hero: {
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    overflow: 'hidden',
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 48,
    color: colors.text,
    lineHeight: 52,
    marginBottom: spacing.md,
  },
  sub: { color: colors.muted, fontSize: 15, lineHeight: 24 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stat: {
    width: '100%',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statRight: {
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  statNum: { fontFamily: fonts.serif, fontSize: 42, color: colors.accent },
  statLabel: { color: colors.muted, fontSize: 12, marginTop: 4 },
  section: { padding: spacing.lg },
  sectionLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  testimonial: {
    width: width * 0.7,
    marginRight: spacing.md,
    paddingRight: spacing.md,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  quote: { color: colors.text, fontSize: 14, lineHeight: 22, marginBottom: spacing.sm },
  quoteMeta: { color: colors.muted, fontSize: 12 },
})
