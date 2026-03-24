import React, { useEffect } from 'react'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

// Elements "swim" in from the side or bottom with a fluid ease
export default function SwimIn({
  children,
  delay = 0,
  direction = 'up',    // 'up', 'left', 'right'
  distance = 40,
  duration = 600,
  style,
}) {
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withSpring(1, { damping: 18, stiffness: 90, mass: 0.8 })
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => {
    const translateX =
      direction === 'left'
        ? -distance * (1 - progress.value)
        : direction === 'right'
        ? distance * (1 - progress.value)
        : 0
    const translateY = direction === 'up' ? distance * (1 - progress.value) : 0

    return {
      opacity: progress.value,
      transform: [{ translateX }, { translateY }],
    }
  })

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  )
}
