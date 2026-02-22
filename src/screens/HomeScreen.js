// src/screens/HomeScreen.js
// ══════════════════════════════════════════
// 主屏幕：账单列表页
// 对应 HTML 版的整个页面结构
// ══════════════════════════════════════════

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import SummaryCards  from '../components/SummaryCards';
import CarouselCards from '../components/CarouselCards';
import Dots          from '../components/Dots';
import AddBillModal  from '../components/AddBillModal';
import { BILLS, SUMMARY } from '../data/bills';
import { Colors } from '../theme';

export default function HomeScreen() {
  // 当前选中的卡片索引（由 CarouselCards 回调更新）
  const [currentCard, setCurrentCard] = useState(0);

  // 控制新建账单弹窗
  const [showModal, setShowModal] = useState(false);

  const handleCardChange = (index) => {
    setCurrentCard(index);
  };

  const handleAddBill = () => {
    // 触发触觉反馈（像 iOS 的点击震动）
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowModal(true);
  };

  return (
    // SafeAreaView：自动避开刘海、底部小横条
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* ── 背景光晕（用 LinearGradient 近似，RN 没有 CSS 光晕） ── */}
      {/*
        注意：RN 没有 CSS 的 filter:blur + position:fixed，
        这里用大面积渐变来营造氛围感。
        如果需要真正的模糊光晕，可以用 react-native-blur + Animated。
      */}
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <View style={styles.container}>

        {/* ── 顶栏 ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.titleText}>分一下</Text>
            <Text style={styles.subText}>407寝室 · 4人</Text>
          </View>
          {/* 头像按钮（以后跳转个人页） */}
          <LinearGradient
            colors={[Colors.accent, Colors.accent3]}
            style={styles.avatar}
          >
            <Text style={{ fontSize: 16 }}>🙂</Text>
          </LinearGradient>
        </View>

        {/* ── 汇总数字 ── */}
        <SummaryCards summary={SUMMARY} />

        {/* ── 账单轮播区 ── */}
        <View style={styles.carouselSection}>
          <Text style={styles.sectionLabel}>账单记录</Text>

          {/* 核心轮播组件 */}
          <CarouselCards
            bills={BILLS}
            onCardChange={handleCardChange}
          />

          {/* 指示点 */}
          <Dots count={BILLS.length} current={currentCard} />
        </View>

        {/* ── 底部导航 ── */}
        <View style={styles.bottomNav}>
          <NavBtn icon="📋" label="账单" active />
          <NavBtn icon="👥" label="成员" />

          {/* 中间加号按钮 */}
          <TouchableOpacity onPress={handleAddBill} activeOpacity={0.85}>
            <LinearGradient
              colors={[Colors.accent, '#4fd4ae']}
              style={styles.addBtn}
            >
              <Text style={styles.addBtnText}>＋</Text>
            </LinearGradient>
          </TouchableOpacity>

          <NavBtn icon="📊" label="统计" />
          <NavBtn icon="⚙️" label="设置" />
        </View>

      </View>

      {/* ── 新建账单弹窗 ── */}
      <AddBillModal
        visible={showModal}
        onClose={() => setShowModal(false)}
      />
    </SafeAreaView>
  );
}

// 底部导航按钮
function NavBtn({ icon, label, active }) {
  return (
    <TouchableOpacity style={styles.navBtn} activeOpacity={0.7}>
      <Text style={styles.navIcon}>{icon}</Text>
      <Text style={[styles.navLabel, active && { color: Colors.accent }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex:            1,
    backgroundColor: Colors.bg,
  },

  // 背景光晕（大圆形模糊色块）
  orb1: {
    position:     'absolute',
    width:        400,
    height:       400,
    borderRadius: 200,
    backgroundColor: 'rgba(126,232,194,0.09)',
    top:   -120,
    left:  -80,
    // RN 没有 filter:blur，用透明度营造柔和感
  },
  orb2: {
    position:     'absolute',
    width:        340,
    height:       340,
    borderRadius: 170,
    backgroundColor: 'rgba(197,168,255,0.07)',
    bottom: -80,
    right:  -60,
  },

  container: {
    flex: 1,
    // 最大宽度 430，在平板上居中
    maxWidth: 430,
    alignSelf: 'center',
    width: '100%',
  },

  // ── 顶栏 ──
  header: {
    paddingHorizontal: 28,
    paddingTop:        16,
    paddingBottom:     16,
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'flex-start',
  },
  titleText: {
    fontSize:   30,
    fontWeight: '700',
    color:      Colors.text,
    // RN 没有 text gradient，用纯白代替
    // 如果需要渐变文字：用 MaskedView + LinearGradient
  },
  subText: {
    fontSize:  12,
    color:     Colors.textDim,
    marginTop: 3,
  },
  avatar: {
    width:           38,
    height:          38,
    borderRadius:    19,
    alignItems:      'center',
    justifyContent:  'center',
  },

  // ── 轮播区 ──
  carouselSection: {
    flex: 1,
    justifyContent: 'center',
  },
  sectionLabel: {
    fontSize:          11,
    color:             Colors.textDim,
    letterSpacing:     1.0,
    textTransform:     'uppercase',
    paddingHorizontal: 28,
    marginBottom:      10,
  },

  // ── 底部导航 ──
  bottomNav: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 32,
    paddingBottom:     20,
    paddingTop:        10,
  },
  navBtn: {
    alignItems: 'center',
    gap:        3,
    padding:    6,
  },
  navIcon:  { fontSize: 20 },
  navLabel: { fontSize: 10, color: Colors.textDim },

  // 加号按钮
  addBtn: {
    width:           52,
    height:          52,
    borderRadius:    26,
    alignItems:      'center',
    justifyContent:  'center',
    shadowColor:     Colors.accent,
    shadowOffset:    { width: 0, height: 8 },
    shadowOpacity:   0.35,
    shadowRadius:    16,
    elevation:       10,
  },
  addBtnText: {
    fontSize:   26,
    fontWeight: '700',
    color:      '#0d0d14',
    lineHeight: 30,
  },
});
