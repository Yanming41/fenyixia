// src/components/BillCard.js
// ══════════════════════════════════════════
// 单张账单卡片组件（纸张效果）
//
// Props:
//   bill       - 账单数据对象
//   animStyle  - 由父组件（CarouselCards）传入的 Reanimated 动画样式
//                包含 transform: [translateX, translateY, scale] 和 opacity
// ══════════════════════════════════════════

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated from 'react-native-reanimated';
import { Colors, CategoryColors, Radius } from '../theme';

// 卡片尺寸常量，导出给 CarouselCards 用于间距计算
export const CARD_WIDTH  = 210;
export const CARD_HEIGHT = 296;

export default function BillCard({ bill, animStyle }) {
  const [c1, c2] = CategoryColors[bill.colorIdx] || CategoryColors[0];
  const perPerson = Math.round(bill.amount / bill.members.length);

  return (
    // Animated.View：普通 View 加上 Reanimated 动画能力
    // animStyle 由父组件传入，包含位置和缩放信息
    <Animated.View style={[styles.card, animStyle]}>

      {/* ── 纸张纹理背景（用渐变模拟，从顶部亮到底部微暗） ── */}
      <LinearGradient
        colors={[Colors.paper, Colors.paperMid, Colors.paperDark]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* ── 顶部分类色块 ── */}
      <LinearGradient
        colors={[c1, c2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.colorBar}
      >
        {/* 色块内容：图标 + 日期 */}
        <View style={styles.colorBarInner}>
          {/* 图标背景气泡 */}
          <View style={styles.iconBubble}>
            <Text style={styles.iconText}>{bill.icon}</Text>
          </View>
          <Text style={styles.dateText}>{bill.date}</Text>
        </View>

        {/* 色块底部叠一层半透明渐变，增加纸感 */}
        <LinearGradient
          colors={['rgba(255,255,255,0.18)', 'rgba(0,0,0,0.06)']}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
      </LinearGradient>

      {/* ── 纸张顶部高光（静态，只渲染一次） ── */}
      {/*
        用一个半透明白色渐变叠在左上角，
        模拟顶光照射纸面产生的光斑效果。
        RN 没有 radial-gradient，用线性渐变近似。
      */}
      <LinearGradient
        colors={['rgba(255,255,255,0.38)', 'transparent']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.7, y: 0.6 }}
        style={[StyleSheet.absoluteFillObject, styles.sheenLayer]}
        pointerEvents="none"
      />

      {/* ── 卡片主内容区 ── */}
      <View style={styles.body}>

        {/* 账单名称 */}
        <Text style={styles.title}>{bill.title}</Text>
        <Text style={styles.desc}>{bill.desc}</Text>

        {/* 总金额（大字） */}
        <Text style={styles.amount}>¥ {bill.amount}</Text>

        {/* 每人分摊 */}
        <Text style={styles.per}>
          每人均摊{' '}
          <Text style={styles.perAccent}>¥ {perPerson}</Text>
        </Text>

        {/* 头像列表：叠层排列 */}
        <View style={styles.avatarRow}>
          {bill.members.slice(0, 4).map((m, idx) => (
            <View
              key={idx}
              style={[styles.avatar, { marginLeft: idx === 0 ? 0 : -6 }]}
            >
              <Text style={styles.avatarText}>{m}</Text>
            </View>
          ))}
        </View>

        {/* 底部：状态 + 垫付人 */}
        <View style={styles.footer}>
          {/* 结算状态标签 */}
          <View style={[
            styles.pill,
            bill.settled ? styles.pillOk : styles.pillNg
          ]}>
            <Text style={[
              styles.pillText,
              bill.settled ? styles.pillTextOk : styles.pillTextNg
            ]}>
              {bill.settled ? '✓ 已结清' : '待结算'}
            </Text>
          </View>

          {/* 垫付人 */}
          <Text style={styles.payer}>{bill.payer} 垫付</Text>
        </View>

      </View>

      {/* ── 底部右侧暗角（模拟纸张边缘弯曲的阴影） ── */}
      <LinearGradient
        colors={['transparent', 'rgba(160,130,80,0.12)']}
        start={{ x: 0.3, y: 0.5 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFillObject, styles.darkCorner]}
        pointerEvents="none"
      />

    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // ── 卡片容器 ──
  card: {
    width:        CARD_WIDTH,
    height:       CARD_HEIGHT,
    borderRadius: Radius.card,
    overflow:     'hidden',       // 裁掉圆角外的内容
    position:     'absolute',
    // 纸张阴影（iOS 用 shadow*，Android 用 elevation）
    shadowColor:  'rgba(70,45,15,1)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius:  24,
    elevation:     12,             // Android 阴影
    backgroundColor: Colors.paper, // 防止渐变加载前闪白
  },

  // ── 顶部色块 ──
  colorBar: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 50,
    borderTopLeftRadius:  Radius.card,
    borderTopRightRadius: Radius.card,
    justifyContent: 'center',
  },
  colorBarInner: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    zIndex: 1,
  },
  iconBubble: {
    width:           30,
    height:          30,
    borderRadius:    8,
    backgroundColor: 'rgba(255,255,255,0.30)',
    alignItems:      'center',
    justifyContent:  'center',
  },
  iconText: { fontSize: 15 },
  dateText: {
    fontSize:   10,
    color:      'rgba(255,255,255,0.85)',
    letterSpacing: 0.4,
  },

  // ── 光影层 ──
  sheenLayer: {
    borderRadius: Radius.card,
  },
  darkCorner: {
    borderRadius: Radius.card,
  },

  // ── 主内容 ──
  body: {
    flex:            1,
    paddingTop:      60,     // 留出色块高度 50 + 额外间距
    paddingHorizontal: 16,
    paddingBottom:   14,
  },
  title: {
    fontSize:    15,
    fontWeight:  '600',
    color:       Colors.paperText,
    marginBottom: 2,
  },
  desc: {
    fontSize:    10,
    color:       Colors.paperDim,
    marginBottom: 10,
  },
  amount: {
    fontSize:    32,
    fontWeight:  '700',
    color:       Colors.paperText,
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  per: {
    fontSize:  10,
    color:     Colors.paperDim,
  },
  perAccent: {
    color:      Colors.paperAccent,
    fontWeight: '600',
  },

  // ── 头像 ──
  avatarRow: {
    flexDirection: 'row',
    marginTop:     10,
  },
  avatar: {
    width:           22,
    height:          22,
    borderRadius:    11,
    backgroundColor: '#8ab8a0',
    borderWidth:     2,
    borderColor:     Colors.paperDark,
    alignItems:      'center',
    justifyContent:  'center',
  },
  avatarText: {
    fontSize:   9,
    fontWeight: '600',
    color:      '#2a4a38',
  },

  // ── 底部 ──
  footer: {
    marginTop:     'auto',
    paddingTop:    10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems:    'center',
    borderTopWidth: 1,
    borderTopColor: Colors.borderPaper,
  },
  pill: {
    paddingHorizontal: 9,
    paddingVertical:   3,
    borderRadius:      Radius.pill,
    borderWidth:       1,
  },
  pillOk:      { borderColor: Colors.paperAccent, backgroundColor: 'rgba(74,140,114,0.10)' },
  pillNg:      { borderColor: '#c4864a',          backgroundColor: 'rgba(196,134,74,0.10)'  },
  pillText:    { fontSize: 9, fontWeight: '600', letterSpacing: 0.3 },
  pillTextOk:  { color: Colors.paperAccent },
  pillTextNg:  { color: '#c4864a' },
  payer:       { fontSize: 9, color: Colors.paperDim },
});
