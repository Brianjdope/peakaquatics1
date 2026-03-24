import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, fonts } from '../theme'

const PACKAGES = [
  {
    id: 'private-single',
    title: 'Private Session',
    subtitle: '1-on-1 coaching · 1 hour',
    price: 12000, // cents
    display: '$120',
  },
  {
    id: 'private-4pack',
    title: 'Private 4-Pack',
    subtitle: '1-on-1 coaching · 4 sessions',
    price: 44000,
    display: '$440',
    badge: 'Save $40',
  },
  {
    id: 'semi-group-single',
    title: 'Semi-Group Session',
    subtitle: '2–3 swimmers · 1.5 hours',
    price: 8000,
    display: '$80',
  },
  {
    id: 'semi-group-4pack',
    title: 'Semi-Group 4-Pack',
    subtitle: '2–3 swimmers · 4 sessions',
    price: 28000,
    display: '$280',
    badge: 'Save $40',
  },
  {
    id: 'group-single',
    title: 'Group Session',
    subtitle: '4+ swimmers · 1.5 hours',
    price: 5000,
    display: '$50',
  },
  {
    id: 'group-4pack',
    title: 'Group 4-Pack',
    subtitle: '4+ swimmers · 4 sessions',
    price: 18000,
    display: '$180',
    badge: 'Save $20',
  },
]

export default function PaymentScreen() {
  const [selected, setSelected] = useState(null)
  const [processing, setProcessing] = useState(false)

  const paymentMethod = Platform.OS === 'ios' ? 'Apple Pay' : 'Google Pay'
  const paymentIcon = Platform.OS === 'ios' ? '' : '🟢'

  const handlePayment = async () => {
    if (!selected) {
      Alert.alert('Select a Package', 'Please choose a session package to continue.')
      return
    }

    const pkg = PACKAGES.find(p => p.id === selected)
    setProcessing(true)

    try {
      // TODO: Connect to Stripe backend
      // 1. Call your server to create a PaymentIntent with the amount
      // 2. Use stripe.presentApplePay() or stripe.presentGooglePay()
      //
      // Example flow:
      // const { paymentIntent } = await fetch('YOUR_SERVER/create-payment-intent', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ amount: pkg.price, packageId: pkg.id }),
      // }).then(r => r.json())
      //
      // const { error } = await presentPaymentSheet()
      // if (error) throw error

      // Placeholder until Stripe is configured
      Alert.alert(
        'Stripe Setup Required',
        `To accept ${paymentMethod} payments for ${pkg.title} (${pkg.display}), connect your Stripe account.\n\nSee the README for setup instructions.`,
        [{ text: 'OK' }]
      )
    } catch (err) {
      Alert.alert('Payment Failed', err.message || 'Something went wrong. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>QUICK PAY</Text>
        <Text style={styles.headerTitle}>Book a Session</Text>
        <Text style={styles.headerSub}>
          Select a package and pay instantly with {paymentMethod}.
        </Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {PACKAGES.map(pkg => {
          const isSelected = selected === pkg.id
          return (
            <TouchableOpacity
              key={pkg.id}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => setSelected(pkg.id)}
              activeOpacity={0.7}
            >
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                    {pkg.title}
                  </Text>
                  <Text style={styles.cardSubtitle}>{pkg.subtitle}</Text>
                </View>
                <View style={styles.priceWrap}>
                  <Text style={[styles.cardPrice, isSelected && styles.cardPriceSelected]}>
                    {pkg.display}
                  </Text>
                  {pkg.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{pkg.badge}</Text>
                    </View>
                  )}
                </View>
              </View>
              {isSelected && (
                <View style={styles.checkMark}>
                  <Text style={{ color: colors.bg, fontSize: 14, fontWeight: '800' }}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          )
        })}

        <View style={styles.divider} />

        {/* Pay Button */}
        <TouchableOpacity
          style={[
            styles.payButton,
            !selected && styles.payButtonDisabled,
            processing && styles.payButtonDisabled,
          ]}
          onPress={handlePayment}
          disabled={!selected || processing}
          activeOpacity={0.8}
        >
          {Platform.OS === 'ios' ? (
            <Text style={styles.payButtonText}>
              {processing ? 'Processing…' : ' Pay'}
            </Text>
          ) : (
            <Text style={styles.payButtonText}>
              {processing ? 'Processing…' : 'G Pay'}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.secureNote}>
          Payments are processed securely through Stripe.{'\n'}
          Your card details are never stored on our servers.
        </Text>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
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
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md },

  card: {
    backgroundColor: colors.surface2,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    position: 'relative',
  },
  cardSelected: {
    borderColor: colors.accent,
    backgroundColor: '#1a1a1a',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  cardTitleSelected: {
    color: colors.accent,
  },
  cardSubtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  priceWrap: {
    alignItems: 'flex-end',
  },
  cardPrice: {
    fontFamily: fonts.serif,
    fontSize: 26,
    color: colors.text,
  },
  cardPriceSelected: {
    color: colors.accent,
  },
  badge: {
    backgroundColor: colors.accent,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  badgeText: {
    color: colors.bg,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  checkMark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },

  payButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  payButtonDisabled: {
    opacity: 0.4,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  secureNote: {
    color: colors.muted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 18,
  },
})
