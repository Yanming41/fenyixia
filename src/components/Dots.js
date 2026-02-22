// src/components/Dots.js
// ══════════════════════════════════════════
// 轮播指示点
// 当前选中的点会横向拉伸（宽 5→20），用 withSpring 动画
// ══════════════════════════════════════════

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Colors } from '../theme';

function Dot({ active }) {
  // 宽度动画：激活时从 5 拉伸到 20
  const animStyle = useAnimatedStyle(() => ({
    width: withSpring(active ? 20 : 5, { damping: 16, stiffness: 180 }),
    backgroundColor: active ? Colors.accent : 'rgba(255,255,255,0.18)',
  }));

  return <Animated.View style={[styles.dot, animStyle]} />;
}

export default function Dots({ count, current }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }).map((_, i) => (
        <Dot key={i} active={i === current} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection:  'row',
    justifyContent: 'center',
    alignItems:     'center',
    gap:            6,
    paddingVertical: 14,
  },
  dot: {
    height:       5,
    borderRadius: 3,
  },
});
