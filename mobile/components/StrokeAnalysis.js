import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated'
import Svg, { Path, Circle, Line, G } from 'react-native-svg'
import { colors, fonts, spacing } from '../theme'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const W = SCREEN_WIDTH - 48
const H = 200

const AnimatedCircle = Animated.createAnimatedComponent(Circle)
const AnimatedLine = Animated.createAnimatedComponent(Line)
const AnimatedG = Animated.createAnimatedComponent(G)
const AnimatedPath = Animated.createAnimatedComponent(Path)

// Swimmer stick figure performing freestyle stroke
export default function StrokeAnalysis() {
  const stroke = useSharedValue(0) // 0 to 1 = one full stroke cycle
  const swimX = useSharedValue(0)
  const ripple1 = useSharedValue(0)
  const ripple2 = useSharedValue(0)
  const scanLine = useSharedValue(0)

  useEffect(() => {
    // Continuous stroke cycle
    stroke.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sine) }),
      -1,
      false
    )

    // Swimmer glides forward
    swimX.value = withRepeat(
      withSequence(
        withTiming(W * 0.6, { duration: 6000, easing: Easing.inOut(Easing.quad) }),
        withTiming(W * 0.15, { duration: 6000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    )

    // Ripple effects
    ripple1.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.out(Easing.quad) }),
      -1,
      false
    )
    ripple2.value = withDelay(
      500,
      withRepeat(
        withTiming(1, { duration: 1500, easing: Easing.out(Easing.quad) }),
        -1,
        false
      )
    )

    // Analysis scan line
    scanLine.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.sine) }),
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.sine) })
      ),
      -1,
      false
    )
  }, [])

  // Swimmer body position
  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: swimX.value }],
  }))

  // Right arm (pulling stroke)
  const rightArmStyle = useAnimatedStyle(() => {
    const angle = interpolate(stroke.value, [0, 0.25, 0.5, 0.75, 1], [30, -60, -120, -30, 30])
    return { transform: [{ rotate: `${angle}deg` }] }
  })

  // Left arm (recovery)
  const leftArmStyle = useAnimatedStyle(() => {
    const angle = interpolate(stroke.value, [0, 0.25, 0.5, 0.75, 1], [-120, -30, 30, -60, -120])
    return { transform: [{ rotate: `${angle}deg` }] }
  })

  // Kick
  const legsStyle = useAnimatedStyle(() => {
    const angle = interpolate(stroke.value, [0, 0.25, 0.5, 0.75, 1], [-8, 8, -8, 8, -8])
    return { transform: [{ rotate: `${angle}deg` }] }
  })

  // Water line
  const waterY = H * 0.5

  // Ripple animations
  const ripple1Style = useAnimatedStyle(() => ({
    opacity: 1 - ripple1.value,
    transform: [{ scale: 1 + ripple1.value * 2 }],
  }))

  const ripple2Style = useAnimatedStyle(() => ({
    opacity: 1 - ripple2.value,
    transform: [{ scale: 1 + ripple2.value * 2 }],
  }))

  // Scan line
  const scanStyle = useAnimatedStyle(() => ({
    left: interpolate(scanLine.value, [0, 1], [0, W]),
    opacity: 0.6,
  }))

  // Analysis data points
  const metrics = [
    { label: 'Stroke Rate', value: '42 spm' },
    { label: 'DPS', value: '2.1m' },
    { label: 'Efficiency', value: '94%' },
  ]

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stroke Analysis</Text>
      <Text style={styles.subtitle}>Real-time technique breakdown</Text>

      <View style={styles.canvas}>
        {/* Water surface line */}
        <View style={[styles.waterLine, { top: waterY }]} />

        {/* Water fill below surface */}
        <View style={[styles.waterFill, { top: waterY }]} />

        {/* Animated scan line */}
        <Animated.View style={[styles.scanLine, scanStyle]} />

        {/* Swimmer figure */}
        <Animated.View style={[styles.swimmer, bodyStyle, { top: waterY - 12 }]}>
          {/* Head */}
          <View style={styles.head} />

          {/* Body */}
          <View style={styles.body} />

          {/* Right arm */}
          <Animated.View style={[styles.armPivot, rightArmStyle]}>
            <View style={styles.arm} />
            <View style={styles.hand} />
          </Animated.View>

          {/* Left arm */}
          <Animated.View style={[styles.armPivot, { top: 2 }, leftArmStyle]}>
            <View style={[styles.arm, { backgroundColor: 'rgba(252,252,252,0.4)' }]} />
          </Animated.View>

          {/* Legs */}
          <Animated.View style={[styles.legPivot, legsStyle]}>
            <View style={styles.leg} />
          </Animated.View>

          {/* Ripples */}
          <Animated.View style={[styles.ripple, ripple1Style]} />
          <Animated.View style={[styles.ripple, ripple2Style]} />
        </Animated.View>

        {/* Angle indicators */}
        <View style={[styles.angleMarker, { top: waterY - 30, left: '30%' }]}>
          <Text style={styles.angleText}>15°</Text>
        </View>
        <View style={[styles.angleMarker, { top: waterY + 20, left: '55%' }]}>
          <Text style={styles.angleText}>72°</Text>
        </View>
      </View>

      {/* Metrics row */}
      <View style={styles.metricsRow}>
        {metrics.map((m, i) => (
          <View key={i} style={styles.metric}>
            <Text style={styles.metricValue}>{m.value}</Text>
            <Text style={styles.metricLabel}>{m.label}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    margin: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 24,
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  canvas: {
    height: H,
    borderRadius: 12,
    backgroundColor: colors.bg,
    overflow: 'hidden',
    position: 'relative',
  },
  waterLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  waterFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(100,180,255,0.04)',
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(252,252,252,0.3)',
  },
  swimmer: {
    position: 'absolute',
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  head: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.text,
  },
  body: {
    width: 30,
    height: 4,
    backgroundColor: colors.text,
    borderRadius: 2,
    marginLeft: -2,
  },
  armPivot: {
    position: 'absolute',
    left: 10,
    top: 0,
    width: 22,
    height: 3,
    transformOrigin: '0% 50%',
  },
  arm: {
    width: 22,
    height: 3,
    backgroundColor: colors.text,
    borderRadius: 1.5,
  },
  hand: {
    position: 'absolute',
    right: -3,
    top: -1,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.text,
  },
  legPivot: {
    position: 'absolute',
    left: 28,
    top: 0,
    transformOrigin: '0% 50%',
  },
  leg: {
    width: 24,
    height: 3,
    backgroundColor: 'rgba(252,252,252,0.6)',
    borderRadius: 1.5,
  },
  ripple: {
    position: 'absolute',
    left: 4,
    top: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  angleMarker: {
    position: 'absolute',
    backgroundColor: 'rgba(252,252,252,0.1)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(252,252,252,0.15)',
  },
  angleText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  metric: {
    flex: 1,
    backgroundColor: colors.bg,
    borderRadius: 8,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricValue: {
    fontFamily: fonts.serif,
    fontSize: 18,
    color: colors.text,
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 10,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
})
