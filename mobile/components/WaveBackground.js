import React, { useEffect } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import Svg, { Path } from 'react-native-svg'
import { colors } from '../theme'

const { width } = Dimensions.get('window')
const AnimatedSvg = Animated.createAnimatedComponent(Svg)

export default function WaveBackground({ height = 60, color, speed = 6000 }) {
  const fill = color || 'rgba(255,255,255,0.03)'
  const tx = useSharedValue(0)

  useEffect(() => {
    tx.value = withRepeat(
      withTiming(-width, { duration: speed, easing: Easing.linear }),
      -1,
      false
    )
  }, [])

  const style1 = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }],
  }))

  const style2 = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value * 0.7 }],
  }))

  const wave = `M0,${height * 0.6} C${width * 0.25},${height * 0.2} ${width * 0.5},${height} ${width},${height * 0.4} L${width * 2},${height * 0.4} C${width * 1.5},${height} ${width * 1.25},${height * 0.2} ${width},${height * 0.6} L${width * 2},${height} L0,${height} Z`

  return (
    <View style={[styles.container, { height }]} pointerEvents="none">
      <AnimatedSvg
        width={width * 2}
        height={height}
        style={[styles.svg, style2]}
      >
        <Path d={wave} fill={fill} opacity={0.5} />
      </AnimatedSvg>
      <AnimatedSvg
        width={width * 2}
        height={height}
        style={[styles.svg, style1]}
      >
        <Path d={wave} fill={fill} />
      </AnimatedSvg>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden', width: '100%' },
  svg: { position: 'absolute', bottom: 0 },
})
