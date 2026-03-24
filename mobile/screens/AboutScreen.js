import React from 'react'
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, fonts } from '../theme'
import { ABOUT } from '../data'

const { width } = Dimensions.get('window')
const PHILIP_PHOTO = 'https://images.squarespace-cdn.com/content/v1/613a5c22540e534e72bda9a1/a698ca47-fed2-471b-a223-b2d6793a3e4b/V2.jpg'

export default function AboutScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>About</Text>
        </View>

        {/* Mission */}
        <View style={styles.section}>
          <Text style={styles.label}>MISSION</Text>
          <Text style={styles.body}>{ABOUT.mission}</Text>
        </View>

        {/* Coach */}
        <View style={styles.section}>
          <Text style={styles.label}>HEAD COACH</Text>
          <Image
            source={{ uri: PHILIP_PHOTO }}
            style={styles.coachPhoto}
            resizeMode="cover"
          />
          <Text style={styles.coachName}>Philip Kang</Text>
          {ABOUT.coachBio && ABOUT.coachBio.map((para, i) => (
            <Text key={i} style={styles.body}>{para}</Text>
          ))}
        </View>

        {/* Partners */}
        {ABOUT.partners && ABOUT.partners.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>TRUSTED PARTNERS</Text>
            {ABOUT.partners.map((p, i) => (
              <View key={i} style={styles.partnerRow}>
                <Image
                  source={{ uri: p.img }}
                  style={styles.partnerLogo}
                  resizeMode="contain"
                />
                <Text style={styles.partnerName}>{p.name}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  back: { padding: spacing.lg, paddingBottom: spacing.sm },
  backText: { color: colors.accent, fontSize: 14 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontFamily: fonts.serif, fontSize: 36, color: colors.text },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: { color: colors.accent, fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: spacing.md },
  body: { color: colors.muted, fontSize: 15, lineHeight: 26, marginBottom: spacing.md },
  coachPhoto: {
    width: '100%',
    height: width * 0.75,
    marginBottom: spacing.md,
  },
  coachName: { fontFamily: fonts.serif, fontSize: 24, color: colors.text, marginBottom: spacing.md },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  partnerLogo: { width: 80, height: 44, marginRight: spacing.lg },
  partnerName: { color: colors.text, fontSize: 15, fontWeight: '600' },
})
