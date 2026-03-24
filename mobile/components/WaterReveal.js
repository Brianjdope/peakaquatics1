import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated'
import Svg, { Path } from 'react-native-svg'
import { colors, fonts } from '../theme'

const { width, height } = Dimensions.get('window')

// Splash screen with water-rise reveal animation
export default function WaterReveal({ onComplete }) {
  const waveHeight = useSharedValue(height)
  const logoOpacity = useSharedValue(0)
  const logoScale = useSharedValue(0.8)
  const textOpacity = useSharedValue(0)
  const wholeOpacity = useSharedValue(1)
  const [visible, setVisible] = useState(true)

  const finish = () => setVisible(false)

  useEffect(() => {
    // 1. Fade in logo
    logoOpacity.value = withDelay(200, withTiming(1, { duration: 500 }))
    logoScale.value = withDelay(200, withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.5)) }))

    // 2. Show text
    textOpacity.value = withDelay(600, withTiming(1, { duration: 400 }))

    // 3. Water rises up (wave shrinks down)
    waveHeight.value = withDelay(
      1200,
      withTiming(0, { duration: 800, easing: Easing.inOut(Easing.quad) })
    )

    // 4. Fade out everything
    wholeOpacity.value = withDelay(
      2200,
      withTiming(0, { duration: 400 })
    )

    // 5. Complete
    const timer = setTimeout(() => {
      onComplete?.()
      setVisible(false)
    }, 2800)

    return () => clearTimeout(timer)
  }, [])

  const waveStyle = useAnimatedStyle(() => ({
    height: waveHeight.value,
  }))

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }))

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }))

  const containerStyle = useAnimatedStyle(() => ({
    opacity: wholeOpacity.value,
  }))

  if (!visible) return null

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Logo and text */}
      <Animated.View style={[styles.content, logoStyle]}>
        <Text style={styles.logo}>PA</Text>
      </Animated.View>
      <Animated.Text style={[styles.title, textStyle]}>
        Peak Aquatic Sports
      </Animated.Text>

      {/* Water wave rising from bottom */}
      <Animated.View style={[styles.waveWrap, waveStyle]}>
        <Svg width={width} height={40} style={styles.waveSvg}>
          <Path
            d={`M0,20 C${width * 0.25},0 ${width * 0.5},40 ${width * 0.75},10 S${width},30 ${width},20 L${width},40 L0,40 Z`}
            fill={colors.bg}
          />
        </Svg>
        <View style={styles.waveBody} />
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logo: {
    fontFamily: fonts.serif,
    fontSize: 28,
    color: colors.text,
    letterSpacing: 2,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.text,
    letterSpacing: 1,
  },
  waveWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  waveSvg: {
    position: 'absolute',
    top: -39,
    left: 0,
  },
  waveBody: {
    flex: 1,
    backgroundColor: colors.bg,
  },
})
