import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, fonts } from '../theme'
import { SERVICES_DATA, FAQS } from '../data'

function FaqItem({ item }) {
  const [open, setOpen] = useState(false)
  return (
    <TouchableOpacity style={styles.faqItem} onPress={() => setOpen(o => !o)} activeOpacity={0.7}>
      <View style={styles.faqHeader}>
        <Text style={styles.faqQ}>{item.q}</Text>
        <Text style={styles.faqToggle}>{open ? '−' : '+'}</Text>
      </View>
      {open && <Text style={styles.faqA}>{item.a}</Text>}
    </TouchableOpacity>
  )
}

export default function ServicesScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.headerLabel}>WHAT WE OFFER</Text>
          <Text style={styles.headerTitle}>Services</Text>
        </View>

        <View style={styles.section}>
          {SERVICES_DATA && SERVICES_DATA.map((s, i) => (
            <View key={i} style={styles.serviceCard}>
              <Text style={styles.serviceIcon}>{s.icon}</Text>
              <Text style={styles.serviceTitle}>{s.title}</Text>
              <Text style={styles.serviceDesc}>{s.desc}</Text>
              {s.duration && <Text style={styles.serviceDuration}>DURATION: {s.duration}</Text>}
            </View>
          ))}
        </View>

        {FAQS && FAQS.length > 0 && (
          <View style={[styles.section, { borderTopWidth: 1, borderTopColor: colors.border }]}>
            <Text style={styles.sectionLabel}>FAQ</Text>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            {FAQS.map((faq, i) => <FaqItem key={i} item={faq} />)}
          </View>
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  back: { padding: spacing.md },
  backText: { color: colors.accent, fontWeight: '600', fontSize: 15 },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLabel: { color: colors.accent, fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  headerTitle: { fontFamily: fonts.serif, fontSize: 32, color: colors.text, marginTop: 4 },
  section: { padding: spacing.lg, gap: spacing.md },
  sectionLabel: { color: colors.accent, fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: spacing.sm },
  sectionTitle: { fontFamily: fonts.serif, fontSize: 26, color: colors.text, marginBottom: spacing.md },
  serviceCard: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.lg,
  },
  serviceIcon: { fontSize: 32, marginBottom: spacing.sm },
  serviceTitle: { fontFamily: fonts.serif, fontSize: 22, color: colors.text, marginBottom: spacing.sm },
  serviceDesc: { color: colors.muted, fontSize: 14, lineHeight: 22 },
  serviceDuration: { color: colors.accent, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginTop: spacing.md },
  faqItem: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  faqQ: { color: colors.text, fontWeight: '600', fontSize: 14, flex: 1, paddingRight: spacing.sm },
  faqToggle: { color: colors.accent, fontSize: 22, fontWeight: '300' },
  faqA: { color: colors.muted, fontSize: 13, lineHeight: 22, marginTop: spacing.sm },
})
