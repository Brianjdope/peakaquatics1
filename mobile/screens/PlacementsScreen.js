import React from 'react'
import { View, Text, FlatList, Image, StyleSheet, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, fonts } from '../theme'
import { PLACEMENTS } from '../data'

const { width } = Dimensions.get('window')
const CARD = (width - spacing.lg * 2 - spacing.md) / 2

export default function PlacementsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Placements</Text>
        <Text style={styles.sub}>Student-athletes placed at top programs nationwide.</Text>
      </View>
      <FlatList
        data={PLACEMENTS}
        keyExtractor={(_, i) => String(i)}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => <PlacementCard item={item} />}
      />
    </SafeAreaView>
  )
}

function PlacementCard({ item }) {
  const initials = item.name.split(' ').map(w => w[0]).join('')
  return (
    <View style={styles.card}>
      <View style={styles.photoWrap}>
        {item.photo ? (
          <Image source={{ uri: item.photo }} style={styles.photo} resizeMode="cover" />
        ) : (
          <Text style={styles.initials}>{initials}</Text>
        )}
      </View>
      <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.school} numberOfLines={1}>{item.school}</Text>
      {item.year ? <Text style={styles.year}>'{item.year.slice(-2)}</Text> : null}
    </View>
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
  sub: { color: colors.muted, fontSize: 13, marginTop: 4 },
  grid: { padding: spacing.lg },
  row: { justifyContent: 'space-between', marginBottom: spacing.md },
  card: { width: CARD },
  photoWrap: {
    width: CARD,
    height: CARD * 1.2,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%' },
  initials: { fontFamily: fonts.serif, fontSize: 30, color: colors.muted },
  name: { color: colors.text, fontSize: 13, fontWeight: '600' },
  school: { color: colors.accent, fontSize: 12, marginTop: 2 },
  year: { color: colors.muted, fontSize: 11, marginTop: 2 },
})
