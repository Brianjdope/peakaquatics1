import React from 'react'
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, fonts } from '../theme'
import { NEWS_LIST, ARTICLES } from '../data'

export default function NewsListScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>News & Events</Text>
      </View>
      <FlatList
        data={NEWS_LIST}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const article = ARTICLES[item.id]
          if (!article) return null
          return (
            <TouchableOpacity
              style={[styles.row, item.featured && styles.featuredRow]}
              onPress={() => navigation.navigate('Article', { id: item.id })}
              activeOpacity={0.7}
            >
              {item.featured && article.img ? (
                <Image source={{ uri: article.img }} style={styles.featuredImg} resizeMode="cover" />
              ) : null}
              <View style={styles.rowBody}>
                <Text style={styles.tag}>{article.tag}</Text>
                <Text style={styles.rowTitle} numberOfLines={2}>{article.title}</Text>
                <Text style={styles.rowDate}>{article.date}</Text>
              </View>
            </TouchableOpacity>
          )
        }}
      />
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
  row: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  featuredRow: {},
  featuredImg: { width: '100%', height: 200 },
  rowBody: { padding: spacing.lg },
  tag: { color: colors.accent, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 6 },
  rowTitle: { fontFamily: fonts.serif, fontSize: 20, color: colors.text, lineHeight: 26, marginBottom: 6 },
  rowDate: { color: colors.muted, fontSize: 12 },
})
