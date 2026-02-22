// src/components/CarouselCards.js
// ══════════════════════════════════════════
// 账单卡片轮播组件
//
// 这是整个 App 最核心的动画组件，对应 HTML 版本里的
// stage + JS 动画逻辑。
//
// 核心技术：
//   - react-native-gesture-handler  →  接管手势，比原生 TouchableOpacity 更精准
//   - react-native-reanimated       →  在 UI 线程直接执行动画，不经过 JS 桥
//     （这是 RN 动画性能好的关键：HTML 版用 RAF 在 JS 线程做，
//       Reanimated 把计算搬到原生 UI 线程，JS 繁忙也不掉帧）
// ══════════════════════════════════════════

import React, { useCallback } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,      // 在 UI 线程和 JS 线程之间共享的可动画值
  useAnimatedStyle,    // 根据 SharedValue 生成动画样式，运行在 UI 线程
  withSpring,          // 弹性动画（松手 snap 用这个）
  interpolate,         // 把一个值域映射到另一个值域（类似 CSS calc）
  Extrapolation,       // 插值的边界行为（clamp = 超出范围就夹住）
  runOnJS,             // 在 UI 线程里调用 JS 函数（更新 React state 用）
} from 'react-native-reanimated';
import BillCard, { CARD_WIDTH, CARD_HEIGHT } from './BillCard';
import { Colors } from '../theme';

// ── 动画参数（对应 HTML 版的 CFG 对象）──
const STEP        = 148;   // px — 卡片横向间距
const DRAG_PX     = 72;    // px — 拖动多少像素切一张
const SCALE_STEP  = 0.13;  // 每级缩放衰减
const MIN_SCALE   = 0.60;  // 最小缩放
const Y_STEP      = 14;    // px — 每级下沉（弧线感）
const OPACITY_STEP = 0.26; // 每级透明度衰减

// 弹性 snap 动画配置（对应 HTML 版 cubic-bezier）
const SPRING_CONFIG = {
  damping:   18,    // 阻尼，越大越快停
  stiffness: 200,   // 弹性，越大越快回弹
  mass:      0.8,   // 质量，越小越轻盈
};

const { width: SCREEN_W } = Dimensions.get('window');

export default function CarouselCards({ bills, onCardChange }) {
  // ── SharedValue：当前"浮点位置"──
  // 对应 HTML 版的 fracLive / frac
  // 0 = 第一张居中，1 = 第二张居中，可以是小数（拖动中）
  // SharedValue 的修改直接在 UI 线程生效，不需要经过 JS，所以不掉帧
  const progress = useSharedValue(0);

  // ── 当前整数索引（JS 状态，用于更新指示点等） ──
  const currentIndex = useSharedValue(0);

  // ── snap 到目标卡片 ──
  // withSpring 在 UI 线程执行弹性动画，JS 不参与计算
  const snapTo = useCallback((index) => {
    'worklet'; // 标记这个函数可以在 UI 线程调用
    const clamped = Math.max(0, Math.min(bills.length - 1, index));
    progress.value = withSpring(clamped, SPRING_CONFIG);
    currentIndex.value = clamped;
    runOnJS(onCardChange)(clamped); // 回调 JS 更新指示点
  }, [bills.length]);

  // ── 手势识别器 ──
  const gesture = Gesture.Pan()
    // 手势开始时记录初始位置
    .onBegin(() => {
      // 取消正在进行的 spring 动画，让卡片立即跟手
    })
    // 手势进行中：实时更新 progress
    .onUpdate((e) => {
      'worklet';
      // translationX < 0 = 向左拖 = 看下一张 = progress 增大
      const dragDelta = -e.translationX / DRAG_PX;
      const rawFrac   = currentIndex.value + dragDelta;
      // clamp 到合法范围，加一点阻力感（超出边界时变慢）
      const clamped = Math.max(
        -0.3,
        Math.min(bills.length - 1 + 0.3, rawFrac)
      );
      progress.value = clamped;
    })
    // 手势结束：磁力 snap 到最近整数
    .onEnd((e) => {
      'worklet';
      const velocity = e.velocityX; // 手势速度，用来判断方向
      let target = currentIndex.value;

      // 判断逻辑（对应 HTML 版的 onDragEnd）：
      // 1. 快速滑动（速度 > 500px/s）→ 根据速度方向切换
      // 2. 慢速拖动 > 36px → 根据位移方向切换
      // 3. 其他 → 回弹到当前卡
      if (velocity < -500 && target < bills.length - 1) {
        target++;
      } else if (velocity > 500 && target > 0) {
        target--;
      } else {
        // 根据当前 progress 四舍五入到最近张
        const rounded = Math.round(progress.value);
        target = Math.max(0, Math.min(bills.length - 1, rounded));
      }

      snapTo(target);
    });

  // ── 为每张卡片生成动画样式 ──
  // useAnimatedStyle 在 UI 线程运行，progress 变化时自动触发
  // 不需要 JS 参与，这就是为什么比 HTML 版的 RAF 更流畅
  const makeAnimStyle = (index) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => {
      // offset = 此卡片距离焦点的距离（0 = 焦点卡，±1 = 相邻，以此类推）
      const offset = index - progress.value;
      const absO   = Math.abs(offset);

      // translateX：横向位移，对应 HTML 版的 offset * STEP
      const translateX = offset * STEP;

      // translateY：弧线下沉，对应 HTML 版的 absO * Y_STEP
      const translateY = absO * Y_STEP;

      // scale：插值计算，absO=0 时 scale=1，absO=1 时 scale=1-SCALE_STEP
      // interpolate 比 Math.max/min 更精确，支持多段映射
      const scale = interpolate(
        absO,
        [0, 1, 2],
        [1, 1 - SCALE_STEP, Math.max(MIN_SCALE, 1 - SCALE_STEP * 2)],
        Extrapolation.CLAMP  // 超出范围就夹住
      );

      // opacity：距离越远越透明
      const opacity = interpolate(
        absO,
        [0, 1, 2],
        [1, 1 - OPACITY_STEP, Math.max(0.25, 1 - OPACITY_STEP * 2)],
        Extrapolation.CLAMP
      );

      // zIndex：中间卡在最上面（注意 RN 的 zIndex 是整数）
      const zIndex = Math.round(50 - absO * 10);

      return {
        transform: [
          { translateX },
          { translateY },
          { scale },
        ],
        opacity,
        zIndex,
      };
    });

  return (
    <View style={styles.container}>
      {/* GestureDetector 包裹舞台，接管所有手势 */}
      <GestureDetector gesture={gesture}>
        <View style={styles.stage}>
          {bills.map((bill, index) => (
            <BillCard
              key={bill.id}
              bill={bill}
              // 每张卡片有自己的动画样式，互相独立
              animStyle={[
                styles.cardBase,
                makeAnimStyle(index),
              ]}
            />
          ))}
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex:1 让这个组件撑满父容器分配的空间
  },

  // 舞台：卡片的定位参考系
  // 高度固定，卡片用 absolute + 负 margin 居中
  stage: {
    width:          '100%',
    height:         CARD_HEIGHT + 40,   // 留上下 20px 给阴影
    alignItems:     'center',
    justifyContent: 'center',
  },

  // 卡片基础定位：所有卡片叠在舞台中心，由 animStyle 的 translateX 分开
  cardBase: {
    position: 'absolute',
  },
});
