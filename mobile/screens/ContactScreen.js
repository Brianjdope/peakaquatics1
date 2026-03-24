import React, { useState } from 'react'
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, fonts } from '../theme'
import { CONTACT_INFO } from '../data'

export default function ContactScreen({ navigation }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) {
      Alert.alert('Missing info', 'Please fill in all fields.')
      return
    }
    const subject = encodeURIComponent('Peak Aquatic Sports Inquiry')
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)
    Linking.openURL(`mailto:${CONTACT_INFO.email}?subject=${subject}&body=${body}`)
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Contact</Text>
        </View>

        {/* Contact info */}
        <TouchableOpacity style={styles.row} onPress={() => Linking.openURL(`mailto:${CONTACT_INFO.email}`)}>
          <Text style={styles.rowLabel}>Email</Text>
          <Text style={styles.rowValue}>{CONTACT_INFO.email}</Text>
        </TouchableOpacity>

        {CONTACT_INFO.location ? (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Location</Text>
            <Text style={styles.rowValue}>{CONTACT_INFO.location}</Text>
          </View>
        ) : null}

        {CONTACT_INFO.instagram ? (
          <TouchableOpacity
            style={styles.row}
            onPress={() => Linking.openURL(`https://instagram.com/${CONTACT_INFO.instagram.replace('@', '')}`)}
          >
            <Text style={styles.rowLabel}>Instagram</Text>
            <Text style={styles.rowValue}>{CONTACT_INFO.instagram}</Text>
          </TouchableOpacity>
        ) : null}

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor={colors.muted}
            value={form.name}
            onChangeText={t => setForm(f => ({ ...f, name: t }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={t => setForm(f => ({ ...f, email: t }))}
          />
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Message"
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={5}
            value={form.message}
            onChangeText={t => setForm(f => ({ ...f, message: t }))}
          />
          <TouchableOpacity style={styles.btn} onPress={handleSubmit} activeOpacity={0.8}>
            <Text style={styles.btnText}>Send Message</Text>
          </TouchableOpacity>
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
  title: { fontFamily: fonts.serif, fontSize: 36, color: colors.text },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: { color: colors.muted, fontSize: 13 },
  rowValue: { color: colors.text, fontSize: 13, flex: 1, textAlign: 'right' },
  form: { padding: spacing.lg },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: 15,
    marginBottom: spacing.sm,
  },
  textarea: { height: 120, textAlignVertical: 'top' },
  btn: {
    backgroundColor: colors.accent,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  btnText: { color: '#000', fontWeight: '700', fontSize: 14, letterSpacing: 1 },
})
