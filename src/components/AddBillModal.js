// src/components/AddBillModal.js
// ══════════════════════════════════════════
// 新建账单底部弹窗（Bottom Sheet）
//
// 用 Modal + Animated 实现从底部滑入的效果
// 对应 HTML 版的 .overlay + .sheet
// ══════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Pressable,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
  Easing,
} from 'react-native-reanimated';
import { Colors, Radius } from '../theme';

export default function AddBillModal({ visible, onClose }) {
  const [title,  setTitle]  = useState('');
  const [amount, setAmount] = useState('');
  const [payer,  setPayer]  = useState('');

  // Sheet 的 Y 位置（0 = 展开，500 = 收起）
  const sheetY = useSharedValue(500);

  useEffect(() => {
    if (visible) {
      // 打开：从底部弹入
      sheetY.value = withSpring(0, { damping: 20, stiffness: 200 });
    } else {
      // 关闭：向下滑出
      sheetY.value = withTiming(500, { duration: 280, easing: Easing.out(Easing.quad) });
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetY.value }],
  }));

  const handleSubmit = () => {
    // 以后这里调用后端 API 创建账单
    console.log('新建账单:', { title, amount, payer });
    setTitle(''); setAmount(''); setPayer('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      {/* 背景蒙版（点击关闭） */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
      </Pressable>

      {/* KeyboardAvoidingView：键盘弹出时自动上移 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
        pointerEvents="box-none"
      >
        <Animated.View style={[styles.sheet, sheetStyle]}>
          {/* 把手 */}
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>新建账单</Text>

          {/* 表单 */}
          <Field label="账单名称" value={title}  onChangeText={setTitle}  placeholder="例：超市采购" />
          <Field label="总金额"   value={amount} onChangeText={setAmount} placeholder="¥ 0.00" keyboardType="numeric" />
          <Field label="垫付人"   value={payer}  onChangeText={setPayer}  placeholder="谁先付的？" />

          {/* 提交按钮 */}
          <TouchableOpacity onPress={handleSubmit} activeOpacity={0.85}>
            <LinearGradient
              colors={[Colors.accent, '#4fd4ae']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.submitBtn}
            >
              <Text style={styles.submitText}>创建账单</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// 表单输入行
function Field({ label, value, onChangeText, placeholder, keyboardType }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.fieldInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        keyboardType={keyboardType || 'default'}
        // iOS：关闭自动大写
        autoCapitalize="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  kav: {
    flex:           1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: 'rgba(20,20,30,0.97)',
    borderTopLeftRadius:  26,
    borderTopRightRadius: 26,
    borderWidth:     1,
    borderColor:     Colors.border,
    borderBottomWidth: 0,
    padding:         26,
    paddingBottom:   48,
  },
  handle: {
    width:           36,
    height:          4,
    borderRadius:    2,
    backgroundColor: Colors.border,
    alignSelf:       'center',
    marginBottom:    22,
  },
  sheetTitle: {
    fontSize:   19,
    fontWeight: '500',
    color:      Colors.text,
    marginBottom: 20,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize:      10,
    color:         Colors.textDim,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom:  6,
  },
  fieldInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth:     1,
    borderColor:     Colors.border,
    borderRadius:    Radius.small + 3,
    paddingHorizontal: 15,
    paddingVertical:   13,
    color:           Colors.text,
    fontSize:        15,
  },
  submitBtn: {
    borderRadius:   Radius.button,
    paddingVertical: 15,
    alignItems:     'center',
    marginTop:      6,
  },
  submitText: {
    color:      '#0d0d14',
    fontSize:   15,
    fontWeight: '700',
  },
});
