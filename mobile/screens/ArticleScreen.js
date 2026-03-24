import React from 'react'
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, fonts } from '../theme'
import { ARTICLES } from '../data'

export default function ArticleScreen({ route, navigation }) {
  const { id } = route.params
  const article = ARTICLES[id]

  if (!article) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: colors.text, padding: spacing.lg }}>Article not found.</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Hero image */}
        {article.img ? (
          <Image source={{ uri: article.img }} style={styles.heroImg} resizeMode="cover" />
        ) : null}

        <View style={styles.body}>
          <Text style={styles.tag}>{article.tag}</Text>
          <Text style={styles.title}>{article.title}</Text>
          <Text style={styles.date}>{article.date}</Text>
          <View style={styles.divider} />
          {Array.isArray(article.body)
            ? article.body.map((para, i) => (
                <Text key={i} style={styles.para}>{para}</Text>
              ))
            : <Text style={styles.para}>{article.body}</Text>
          }
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  back: { padding: spacing.md },
  backText: { color: colors.accent, fontWeight: '600', fontSize: 15 },
  heroImg: { width: '100%', height: 250 },
  body: { padding: spacing.lg },
  tag: { color: colors.accent, fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: spacing.sm },
  title: { fontFamily: fonts.serif, fontSize: 28, color: colors.text, lineHeight: 36, marginBottom: spacing.sm },
  date: { color: colors.muted, fontSize: 13, marginBottom: spacing.md },
  divider: { height: 1, backgroundColor: colors.border, marginBottom: spacing.lg },
  para: { color: colors.text, fontSize: 15, lineHeight: 26, marginBottom: spacing.md },
})
