// App.js
// ══════════════════════════════════════════
// App 入口
//
// GestureHandlerRootView 必须包在最外层，
// 否则 react-native-gesture-handler 的手势识别不工作。
// ══════════════════════════════════════════

import 'react-native-gesture-handler'; // 必须第一行 import
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  return (
    // flex:1 让 GestureHandlerRootView 撑满全屏
    <GestureHandlerRootView style={styles.root}>
      <HomeScreen />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
