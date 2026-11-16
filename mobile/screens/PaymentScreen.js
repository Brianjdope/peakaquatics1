import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, fonts } from '../theme'

// Booking and payment live on the website; the app hands off to it rather
// than taking payment itself.
const BOOKING_URL = 'https://peakaquaticsports.com'

export default function PaymentScreen({ navigation }) {
  const openBooking = () => {
    Linking.openURL(BOOKING_URL).catch(() =>
      Alert.alert('Unable to open browser', `Visit ${BOOKING_URL.replace('https://', '')} to book a session.`)
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.headerLabel}>SCHEDULE</Text>
          <Text style={styles.headerTitle}>Book a Session</Text>
          <Text style={styles.headerSub}>
            Booking and payment are handled on our website. Open Services → Book a Session to
            pick a session type, date and time.
          </Text>
        </View>

        <View style={styles.body}>
          <TouchableOpacity style={styles.btn} onPress={openBooking} activeOpacity={0.8}>
            <Text style={styles.btnText}>Book on peakaquaticsports.com</Text>
          </TouchableOpacity>
          <Text style={styles.note}>Opens in your browser.</Text>
        </View>
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
  headerLabel: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  headerTitle: {
    fontFamily: fonts.serif,
    fontSize: 32,
    color: colors.text,
    marginTop: 4,
  },
  headerSub: {
    color: colors.muted,
    fontSize: 14,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  body: { padding: spacing.lg },
  btn: {
    backgroundColor: colors.accent,
    padding: spacing.md,
    alignItems: 'center',
  },
  btnText: { color: '#000', fontWeight: '700', fontSize: 14, letterSpacing: 1 },
  note: {
    color: colors.muted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.md,
  },
})
