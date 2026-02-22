// src/components/SummaryCards.js
// ══════════════════════════════════════════
// 顶部三个汇总数字卡片（本月 / 收回 / 还款）
// 使用 expo-blur 的 BlurView 实现毛玻璃效果
// ══════════════════════════════════════════

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Radius } from '../theme';

function SumCard({ label, value, valueColor }) {
  return (
    // BlurView：iOS 原生毛玻璃（UIVisualEffectView）
    // intensity: 模糊强度 0-100
    // tint: 'dark' 给玻璃加深色调
    <BlurView intensity={28} tint="dark" style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, valueColor && { color: valueColor }]}>
        {value}
      </Text>
    </BlurView>
  );
}

export default function SummaryCards({ summary }) {
  return (
    <View style={styles.row}>
      <SumCard label="本月" value={`¥ ${summary.total.toLocaleString()}`} />
      <SumCard label="收回" value={`+¥ ${summary.toReceive}`} valueColor={Colors.accent} />
      <SumCard label="还款" value={`-¥ ${summary.toPay}`}     valueColor={Colors.red} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection:    'row',
    paddingHorizontal: 24,
    gap:              10,
    marginBottom:     20,
  },
  card: {
    flex:          1,
    borderRadius:  Radius.small + 4,
    padding:       14,
    overflow:      'hidden',  // BlurView 必须设置 overflow:hidden 才能裁圆角
    borderWidth:   1,
    borderColor:   Colors.border,
    // Android 不支持 BlurView，降级为半透明背景
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  label: {
    fontSize:      10,
    color:         Colors.textDim,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  value: {
    fontSize:   20,
    fontWeight: '500',
    color:      Colors.text,
    marginTop:  3,
  },
});
