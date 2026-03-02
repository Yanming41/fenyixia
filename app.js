/* ══════════════════════════════════════════════════════════════
   数据
   ── 新格式：数值存数字，日期存 ISO，成员存对象 ──
   ── 接入 Supabase 后由 DB.fetchMyBills() 填充 ──
══════════════════════════════════════════════════════════════ */
const DEMO_MEMBERS = [
  { id: 'a', name: 'Abby',  emoji: '🐱' },
  { id: 'l', name: 'Lin',   emoji: '🐻' },
  { id: 'w', name: 'Wendy', emoji: '🦊' },
  { id: 'm', name: 'May',   emoji: '🐰' },
];

const bills = [
  { id:'d1', icon:'🛒', title:'超市采购',   description:'月嫂超市 · 生活用品', total_amount:268,  date:'2025-02-19', payer_name:'Abby',  settled:true,  members:DEMO_MEMBERS, per_amount:67,  items:[{name:'生活用品',price:268,qty:1,members:DEMO_MEMBERS}], color:'linear-gradient(135deg,#34C759,#28A745)' },
  { id:'d2', icon:'🍜', title:'晚饭外卖',   description:'美团 · 沙县小吃',     total_amount:112,  date:'2025-02-17', payer_name:'Lin',   settled:false, members:DEMO_MEMBERS, per_amount:28,  items:[{name:'沙县小吃',price:112,qty:1,members:DEMO_MEMBERS}], color:'linear-gradient(135deg,#FF9500,#FF6B00)' },
  { id:'d3', icon:'🏸', title:'羽毛球馆',   description:'UofT 体育馆 · 2h',   total_amount:192,  date:'2025-02-15', payer_name:'Abby',  settled:false, members:DEMO_MEMBERS, per_amount:48,  items:[{name:'场地费',price:192,qty:1,members:DEMO_MEMBERS}], color:'linear-gradient(135deg,#AF52DE,#5E5CE6)' },
  { id:'d4', icon:'⚡', title:'月度水电',   description:'物业 · 1月账单',      total_amount:712,  date:'2025-02-01', payer_name:'Wendy', settled:true,  members:DEMO_MEMBERS, per_amount:178, items:[{name:'水电费',price:712,qty:1,members:DEMO_MEMBERS}], color:'linear-gradient(135deg,#FF3B30,#FF2D55)' },
  { id:'d5', icon:'☕', title:'星巴克',     description:'Starbucks · 下午茶',  total_amount:136,  date:'2025-01-29', payer_name:'May',   settled:true,  members:DEMO_MEMBERS, per_amount:34,  items:[{name:'咖啡',price:136,qty:1,members:DEMO_MEMBERS}], color:'linear-gradient(135deg,#007AFF,#5AC8FA)' },
  { id:'d6', icon:'🎮', title:'Switch游戏', description:'eShop · 双人成行',   total_amount:198,  date:'2025-01-15', payer_name:'Lin',   settled:true,  members:DEMO_MEMBERS, per_amount:50,  items:[{name:'游戏',price:198,qty:1,members:DEMO_MEMBERS}], color:'linear-gradient(135deg,#FF2D55,#AF52DE)' },
  { id:'d7', icon:'🛒', title:'日用囤货',   description:'京东 · 纸巾洗衣液',  total_amount:156,  date:'2024-12-28', payer_name:'Wendy', settled:true,  members:DEMO_MEMBERS, per_amount:39,  items:[{name:'日用品',price:156,qty:1,members:DEMO_MEMBERS}], color:'linear-gradient(135deg,#34C759,#28A745)' },
  { id:'d8', icon:'🍜', title:'火锅聚餐',   description:'海底捞 · 4人套餐',   total_amount:488,  date:'2024-12-24', payer_name:'Abby',  settled:true,  members:DEMO_MEMBERS, per_amount:122, items:[{name:'火锅',price:488,qty:1,members:DEMO_MEMBERS}], color:'linear-gradient(135deg,#FF9500,#FF6B00)' },
  { id:'d9', icon:'🎮', title:'KTV',        description:'好乐迪 · 平安夜',    total_amount:320,  date:'2024-12-24', payer_name:'May',   settled:true,  members:DEMO_MEMBERS, per_amount:80,  items:[{name:'KTV',price:320,qty:1,members:DEMO_MEMBERS}], color:'linear-gradient(135deg,#5E5CE6,#007AFF)' },
  { id:'d10',icon:'⚡', title:'月度水电',   description:'物业 · 12月账单',     total_amount:684,  date:'2024-12-01', payer_name:'Wendy', settled:true,  members:DEMO_MEMBERS, per_amount:171, items:[{name:'水电费',price:684,qty:1,members:DEMO_MEMBERS}], color:'linear-gradient(135deg,#FF3B30,#FF2D55)' },
  { id:'d11',icon:'🏸', title:'羽毛球馆',   description:'UofT 体育馆 · 3h',   total_amount:288,  date:'2024-11-20', payer_name:'Lin',   settled:true,  members:DEMO_MEMBERS, per_amount:72,  items:[{name:'场地费',price:288,qty:1,members:DEMO_MEMBERS}], color:'linear-gradient(135deg,#AF52DE,#5E5CE6)' },
  { id:'d12',icon:'🛒', title:'超市采购',   description:'沃尔玛 · 零食饮料',   total_amount:214,  date:'2024-11-12', payer_name:'Abby',  settled:true,  members:DEMO_MEMBERS, per_amount:54,  items:[{name:'零食饮料',price:214,qty:1,members:DEMO_MEMBERS}], color:'linear-gradient(135deg,#34C759,#28A745)' },
  { id:'d13',icon:'🚗', title:'打车费',     description:'滴滴 · 机场接人',    total_amount:186,  date:'2024-10-30', payer_name:'May',   settled:true,  members:DEMO_MEMBERS, per_amount:47,  items:[{name:'打车',price:186,qty:1,members:DEMO_MEMBERS}], color:'linear-gradient(135deg,#FF9500,#FF6B00)' },
  { id:'d14',icon:'🍜', title:'烧烤',       description:'路边摊 · 宵夜',      total_amount:176,  date:'2024-10-18', payer_name:'Lin',   settled:true,  members:DEMO_MEMBERS, per_amount:44,  items:[{name:'烧烤',price:176,qty:1,members:DEMO_MEMBERS}], color:'linear-gradient(135deg,#FF6B00,#FF3B30)' },
];

let N = bills.length;

/* ══════════════════════════════════════════════════════════════
   动画参数
══════════════════════════════════════════════════════════════ */
const CFG = {
  STEP: 148,
  DRAG_PX: 72,
  SCALE_STEP: 0.13,
  MIN_SCALE: 0.60,
  Y_STEP: 14,
  OPACITY_STEP: 0.26,
  SNAP_DUR: 420,
  POP_SCALE: 1.08,  // 选中弹跳放大倍数
  POP_DUR: 280,   // 选中弹跳时长 ms
  popMode: 'all', // 'single' = 仅居中卡片放大, 'all' = 整行滑过再回弹
  INERTIA_DUR: 300,  // 惯性滑行持续时间 ms
  INERTIA_RATIO: 0.6,  // 惯性速度比例（乘以滑动速度）
  showShadow: true,
  showFPS: false,
  showTexture: true,
  showSheen: true,
  cycle: false, // 无限循环
  // 曲线指数：1.0 = 线性, >1 = 中心缓慢/边缘加速, <1 = 中心快/边缘缓
  curveX: 0.8,   // 位移曲线
  curveScale: 2.4,   // 缩放曲线
  curveY: 1.7,   // 下沉曲线
  curveOpacity: 1.7,   // 透明度曲线
};

/* ══════════════════════════════════════════════════════════════
   格式化工具
══════════════════════════════════════════════════════════════ */
function fmtMoney(n) { return `¥ ${Number.isInteger(n) ? n : n.toFixed(2)}`; }
function fmtDate(d) { return `${d.getMonth() + 1}月${d.getDate()}日`; }

// ISO 日期 → 中文显示  '2025-02-19' → '2月19日'
function fmtISODate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

// ISO 日期 → 月份 key  '2025-02-19' → '2月'
function isoToMonthKey(iso) {
  const d = new Date(iso + 'T00:00:00');
  return `${d.getMonth() + 1}月`;
}

/* ══════════════════════════════════════════════════════════════
   DOM 构建：卡片 / 指示点
══════════════════════════════════════════════════════════════ */
const stage = document.getElementById('stage');
const dotsEl = document.getElementById('dots');

function createCard(b, i) {
  const el = document.createElement('div');
  el.className = 'bill-card';
  el.dataset.idx = i;
  if (b.id) el.dataset.billId = b.id;

  const displayDate   = fmtISODate(b.date);
  const displayAmount = fmtMoney(b.total_amount);
  const displayPer    = fmtMoney(b.per_amount);

  // 成员头像：优先用 emoji，fallback 用首字母
  const memberAvatars = b.members.map(m => {
    const label = m.emoji || m.name?.[0] || m;
    return `<div class="cav">${label}</div>`;
  }).join('');

  el.innerHTML = `
    <div class="card-bg" style="background:${b.color}"></div>
    <div class="card-highlight"></div>
    <div class="card-noise"></div>
    <div class="card-inner">
      <div class="card-header">
        <div class="card-title">${b.title}</div>
        <div class="card-date">${displayDate}</div>
      </div>
      <div class="card-divider"></div>
      <div class="card-emoji">${b.icon}</div>
      <div class="card-amount-section">
        <div class="card-amount-num">${displayAmount}</div>
        <div class="card-per-line">每人均摊 <em>${displayPer}</em></div>
      </div>
      <div class="card-bottom-row">
        <div class="card-avs">${memberAvatars}</div>
        <div class="card-pill ${b.settled ? 'ok' : 'ng'}">${b.settled ? '✓ 已结清' : '待结算'}</div>
      </div>
    </div>`;
  stage.appendChild(el);
  return el;
}

function createDot() {
  const d = document.createElement('div');
  d.className = 'dot';
  dotsEl.appendChild(d);
  return d;
}

const cardEls = bills.map((b, i) => createCard(b, i));
const dotEls = bills.map(() => createDot());

/* ══════════════════════════════════════════════════════════════
   滑动音效引擎
══════════════════════════════════════════════════════════════ */
const SFX = {
  enabled: true,
  volume: 0.6,
  sounds: [],       // AudioBuffer[]
  current: 0,        // 当前选中的音效索引
  names: [],       // 文件名列表
  lastInt: 0,        // 上一次经过的整数位置（用于检测跨越）
};

let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playSfx() {
  if (!SFX.enabled || SFX.sounds.length === 0) return;
  const ctx = getAudioCtx();
  if (ctx.state === 'suspended') ctx.resume();
  const src = ctx.createBufferSource();
  const gain = ctx.createGain();
  src.buffer = SFX.sounds[SFX.current % SFX.sounds.length];
  gain.gain.value = SFX.volume;
  src.connect(gain).connect(ctx.destination);
  src.start();
}

// 检测 frac 是否跨过了新的整数边界
function checkSfxTrigger(frac) {
  const nearest = Math.round(frac);
  if (nearest !== SFX.lastInt) {
    SFX.lastInt = nearest;
    playSfx();
  }
}

// 加载音频文件（File 对象）
async function loadSoundFile(file) {
  const ctx = getAudioCtx();
  const buf = await file.arrayBuffer();
  const audio = await ctx.decodeAudioData(buf);
  SFX.sounds.push(audio);
  SFX.names.push(file.name.replace(/\.[^.]+$/, ''));
  // 默认选最新加的
  SFX.current = SFX.sounds.length - 1;
  updateSoundLabel();
}

function updateSoundLabel() {
  const el = document.getElementById('sound-name');
  if (SFX.names.length === 0) {
    el.textContent = '无';
  } else {
    el.textContent = `${SFX.current + 1}/${SFX.sounds.length} ${SFX.names[SFX.current]}`;
  }
}

// 加载内置音效
async function loadBuiltinSound(url, name) {
  const ctx = getAudioCtx();
  const resp = await fetch(url);
  const buf = await resp.arrayBuffer();
  const audio = await ctx.decodeAudioData(buf);
  SFX.sounds.push(audio);
  SFX.names.push(name);
  updateSoundLabel();
}

// 内置音效（外部文件）
const BUILTIN_SOUNDS = [
  { name: '滑动01', src: 'assets/sfx/滑动音效01.wav' },
  { name: '滑动02', src: 'assets/sfx/滑动音效02.wav' },
  { name: '滑动03', src: 'assets/sfx/滑动音效03.wav' },
];

/* ══════════════════════════════════════════════════════════════
   核心渲染
══════════════════════════════════════════════════════════════ */
let fracLive = 0;

// 调试面板状态（需在 render() 调用前声明）
let debugOpen = false;
let logoClickCnt = 0;
let logoClickTs = 0;

/* 辅助：将任意整数/浮点数 wrap 到 [0, N) */
function wrapN(v) { return ((v % N) + N) % N; }

function render(frac) {
  // 检测是否跨过整数边界 → 播放音效
  checkSfxTrigger(frac);

  fracLive = frac;

  // cycle 模式下，frac 可超出 [0,N-1]，用 modulo 折算视觉位置
  const fracW = CFG.cycle ? wrapN(frac) : frac;

  cardEls.forEach((el, i) => {
    let offset = i - fracW;
    if (CFG.cycle) {
      // 取最短圆弧方向（wrap 到 [-N/2, N/2]）
      if (offset > N / 2) offset -= N;
      if (offset < -N / 2) offset += N;
    }
    const absO = Math.abs(offset);
    const sign = Math.sign(offset);

    // 各属性独立走幂曲线：pow(absO, exponent)
    // exponent=1 → 线性 | >1 → 中心变化慢,边缘加速 | <1 → 中心变化快
    const cX = Math.pow(absO, CFG.curveX);
    const cS = Math.pow(absO, CFG.curveScale);
    const cY = Math.pow(absO, CFG.curveY);
    const cO = Math.pow(absO, CFG.curveOpacity);

    const x = sign * cX * CFG.STEP;
    const y = cY * CFG.Y_STEP;
    const scale = Math.max(CFG.MIN_SCALE, 1 - cS * CFG.SCALE_STEP);
    const op = Math.max(0.28, 1 - cO * CFG.OPACITY_STEP);

    el.style.transform = `translateX(${x}px) translateY(${y}px) scale(${scale})`;
    el.style.opacity = op;
    el.style.zIndex = Math.round(50 - absO * 10);

    el.classList.remove('shadow-active', 'shadow-side', 'no-shadow');
    if (!CFG.showShadow) {
      el.classList.add('no-shadow');
    } else if (absO < 0.5) {
      el.classList.add('shadow-active');
    } else if (absO < 1.6) {
      el.classList.add('shadow-side');
    }
  });

  const ci = CFG.cycle
    ? Math.round(wrapN(frac))
    : Math.max(0, Math.min(N - 1, Math.round(frac)));
  dotEls.forEach((d, i) => {
    const shouldOn = (i === ci);
    if (shouldOn !== d.classList.contains('on')) d.classList.toggle('on', shouldOn);
  });

  if (debugOpen) {
    document.getElementById('dbg-frac').textContent = frac.toFixed(3);
    document.getElementById('dbg-cur').textContent = current;
  }
}

/* ══════════════════════════════════════════════════════════════
   RAF 节流
══════════════════════════════════════════════════════════════ */
let rafId = null;
let pendFrac = 0;

function scheduleRender(frac) {
  pendFrac = frac;
  if (rafId) return;
  rafId = requestAnimationFrame(() => { rafId = null; render(pendFrac); });
}

/* ══════════════════════════════════════════════════════════════
   Snap
══════════════════════════════════════════════════════════════ */
let current = 0;

let popTimer1 = null;
let popTimer2 = null;

function snapTo(idx) {
  const oldCurrent = current;
  if (CFG.cycle) {
    current = Math.round(wrapN(idx));
  } else {
    idx = Math.max(0, Math.min(N - 1, idx));
    current = idx;
  }
  cardEls.forEach(el => {
    el.style.transition = `transform ${CFG.SNAP_DUR}ms cubic-bezier(.25,.46,.45,.94), opacity ${CFG.SNAP_DUR}ms ease`;
  });
  render(idx);
  playSfx(); // snap 居中时播放音效

  // 清理之前的弹跳定时器
  if (popTimer1) { clearTimeout(popTimer1); popTimer1 = null; }
  if (popTimer2) { clearTimeout(popTimer2); popTimer2 = null; }

  // 切换到新卡片时播放弹跳
  if (current !== oldCurrent) {
    if (CFG.popMode === 'all') {
      // 模式 A：整行滑过目标再回弹（模拟惯性过冲）
      const dir = current > oldCurrent ? 1 : -1;
      const overshoot = (CFG.POP_SCALE - 1);  // 复用 POP_SCALE 控制过冲幅度
      const overIdx = idx + dir * overshoot;

      // 先滑到过冲位置
      render(overIdx);

      popTimer1 = setTimeout(() => {
        // 再回弹到精确目标
        cardEls.forEach(el => {
          el.style.transition = `transform ${CFG.POP_DUR}ms cubic-bezier(.25,.46,.45,.94), opacity ${CFG.POP_DUR}ms ease`;
        });
        render(idx);
      }, CFG.SNAP_DUR);
    } else {
      // 模式 B：仅居中卡片放大再缩回
      const targetEl = cardEls[current];
      if (targetEl) {
        popTimer1 = setTimeout(() => {
          targetEl.style.transition = `transform ${CFG.POP_DUR / 2}ms cubic-bezier(.25,.46,.45,.94)`;
          targetEl.style.transform = `translateX(0px) translateY(0px) scale(${CFG.POP_SCALE})`;

          popTimer2 = setTimeout(() => {
            targetEl.style.transition = `transform ${CFG.POP_DUR / 2}ms cubic-bezier(.25,.46,.45,.94)`;
            targetEl.style.transform = `translateX(0px) translateY(0px) scale(1)`;
          }, CFG.POP_DUR / 2);
        }, CFG.SNAP_DUR);
      }
    }
  }

  if (CFG.cycle) {
    setTimeout(() => { fracLive = current; }, CFG.SNAP_DUR + CFG.POP_DUR + 60);
  }
}

/* ══════════════════════════════════════════════════════════════
   拖动手势
══════════════════════════════════════════════════════════════ */
let dragging = false;
let startX = 0;
let startFrac = 0;
let touchStartTime = 0;
let touchStartX = 0;
let inertiaRafId = null;

// 保留最近若干采样点，用于计算松手速度
const VELOCITY_WINDOW = 80; // 只看最近 80ms 内的采样
let moveHistory = []; // { x, t }

function onDragStart(x) {
  if (inertiaRafId) { cancelAnimationFrame(inertiaRafId); inertiaRafId = null; }
  dragging = true; startX = x; touchStartX = x;
  startFrac = fracLive; touchStartTime = Date.now();
  moveHistory = [{ x, t: Date.now() }];
  stage.classList.add('dragging');
  cardEls.forEach(el => { el.style.transition = 'none'; });
}

function onDragMove(x) {
  if (!dragging) return;
  const now = Date.now();
  moveHistory.push({ x, t: now });
  // 只保留窗口内的采样
  while (moveHistory.length > 2 && now - moveHistory[0].t > VELOCITY_WINDOW) {
    moveHistory.shift();
  }
  const dx = x - startX;
  const raw = startFrac - dx / CFG.DRAG_PX;
  const frac = CFG.cycle ? raw : Math.max(0, Math.min(N - 1, raw));
  scheduleRender(frac);
}

function onDragEnd(x) {
  if (!dragging) return;
  dragging = false;
  stage.classList.remove('dragging');

  const dx = x - startX;
  const duration = Date.now() - touchStartTime;

  // 点击检测
  if (Math.abs(dx) < 8 && duration < 250) {
    const stageRect = stage.getBoundingClientRect();
    const clickX = x - stageRect.left - stageRect.width / 2;
    const clickedCard = Math.round(current + (clickX / CFG.STEP));
    const target = CFG.cycle
      ? clickedCard
      : Math.max(0, Math.min(N - 1, clickedCard));
    snapTo(target);
    return;
  }

  // 把松手点也加入历史
  moveHistory.push({ x, t: Date.now() });

  // 用历史窗口首尾计算速度（px/s → frac/s）
  const oldest = moveHistory[0];
  const newest = moveHistory[moveHistory.length - 1];
  const dt = Math.max(1, newest.t - oldest.t); // ms
  const dxRecent = newest.x - oldest.x;         // px
  const velocity = -(dxRecent / CFG.DRAG_PX) / (dt / 1000); // frac/s

  // 惯性滑行：用 RAF 逐帧减速
  const inertiaStart = performance.now();
  const startVelocity = velocity * CFG.INERTIA_RATIO;
  const inertiaDur = CFG.INERTIA_DUR;
  const inertiaStartF = fracLive;

  function inertiaStep(now) {
    const elapsed = now - inertiaStart;
    const t = Math.min(1, elapsed / inertiaDur);
    // ease-out 减速：v(t) = v0 * (1-t)^2 → 位移 = v0 * dur * (t - t²/2 + t³/3) ... 简化用积分
    // 简单用 easeOut: displacement = v0 * dur/1000 * (t - t²/2) * 2 归一化
    const easeT = t * (2 - t); // ease-out quadratic: 0→0, 1→1
    const displacement = startVelocity * (inertiaDur / 1000) * easeT * 0.5;
    let frac = inertiaStartF + displacement;
    if (!CFG.cycle) frac = Math.max(0, Math.min(N - 1, frac));

    cardEls.forEach(el => { el.style.transition = 'none'; });
    render(frac);

    if (t < 1) {
      inertiaRafId = requestAnimationFrame(inertiaStep);
    } else {
      inertiaRafId = null;
      // 惯性结束 → snap 到最近整数卡片
      let target = Math.round(frac);
      if (!CFG.cycle) target = Math.max(0, Math.min(N - 1, target));
      snapTo(target);
    }
  }

  // 如果速度太小直接 snap
  if (Math.abs(startVelocity) < 0.3) {
    let target = Math.round(fracLive);
    if (!CFG.cycle) target = Math.max(0, Math.min(N - 1, target));
    snapTo(target);
  } else {
    inertiaRafId = requestAnimationFrame(inertiaStep);
  }
}

/* ══════════════════════════════════════════════════════════════
   事件绑定
══════════════════════════════════════════════════════════════ */
stage.addEventListener('mousedown', e => { onDragStart(e.clientX); e.preventDefault(); });
document.addEventListener('mousemove', e => { if (dragging) onDragMove(e.clientX); });
document.addEventListener('mouseup', e => { if (dragging) onDragEnd(e.clientX); });

stage.addEventListener('touchstart', e => { onDragStart(e.touches[0].clientX); }, { passive: true });
stage.addEventListener('touchmove', e => {
  if (!dragging) return;
  e.preventDefault();
  onDragMove(e.touches[0].clientX);
}, { passive: false });
stage.addEventListener('touchend', e => { onDragEnd(e.changedTouches[0].clientX); });

snapTo(0);

// 加载内置音效（首次用户交互后 AudioContext 才能启动）
(async function initBuiltinSounds() {
  for (const s of BUILTIN_SOUNDS) {
    await loadBuiltinSound(s.src, s.name);
  }
  SFX.current = 0;
  updateSoundLabel();
})();

/* ══════════════════════════════════════════════════════════════
   FPS 计数器
══════════════════════════════════════════════════════════════ */
const fpsEl = document.getElementById('fps-counter');
const dbgFpsEl = document.getElementById('dbg-fps');
let fpsSamples = [];
let lastFpsTs = 0;
let fpsRafId = null;

function fpsLoop(ts) {
  if (lastFpsTs) {
    fpsSamples.push(ts - lastFpsTs);
    if (fpsSamples.length > 30) fpsSamples.shift();
  }
  lastFpsTs = ts;
  if (fpsSamples.length >= 10) {
    const avg = fpsSamples.reduce((a, b) => a + b, 0) / fpsSamples.length;
    const fps = Math.round(1000 / avg);
    const color = fps >= 55 ? '#30D158' : fps >= 40 ? '#FF9F0A' : '#FF453A';
    fpsEl.textContent = `FPS: ${fps}`;
    fpsEl.style.color = color;
    dbgFpsEl.textContent = fps;
    dbgFpsEl.style.color = color;
  }
  fpsRafId = requestAnimationFrame(fpsLoop);
}
function startFPS() { if (!fpsRafId) fpsRafId = requestAnimationFrame(fpsLoop); fpsEl.classList.add('visible'); }
function stopFPS() { if (fpsRafId) { cancelAnimationFrame(fpsRafId); fpsRafId = null; } fpsEl.classList.remove('visible'); fpsSamples = []; }

/* ══════════════════════════════════════════════════════════════
   调试控制台
══════════════════════════════════════════════════════════════ */
document.getElementById('logo').addEventListener('click', () => {
  const now = Date.now();
  if (now - logoClickTs < 600) { logoClickCnt++; } else { logoClickCnt = 1; }
  logoClickTs = now;
  if (logoClickCnt >= 3) {
    logoClickCnt = 0;
    debugOpen = !debugOpen;
    document.getElementById('debug-panel').classList.toggle('open', debugOpen);
    if (debugOpen && CFG.showFPS) startFPS();
  }
});

function bindSlider(id, valId, cfgKey, unit, scale) {
  const sl = document.getElementById(id);
  const vl = document.getElementById(valId);
  sl.addEventListener('input', () => {
    const raw = parseFloat(sl.value);
    CFG[cfgKey] = raw * (scale || 1);
    vl.textContent = unit ? `${raw}${unit}` : (raw * (scale || 1)).toFixed(2);
    render(fracLive);
  });
}
bindSlider('sl-step', 'vl-step', 'STEP', 'px');
bindSlider('sl-drag', 'vl-drag', 'DRAG_PX', 'px');
bindSlider('sl-scale', 'vl-scale', 'SCALE_STEP', '/级', 0.01);
bindSlider('sl-minscale', 'vl-minscale', 'MIN_SCALE', '', 0.01);
bindSlider('sl-y', 'vl-y', 'Y_STEP', 'px');
bindSlider('sl-opacity', 'vl-opacity', 'OPACITY_STEP', '/级', 0.01);
bindSlider('sl-dur', 'vl-dur', 'SNAP_DUR', 'ms');
bindSlider('sl-pop', 'vl-pop', 'POP_SCALE', '', 0.01);
bindSlider('sl-popdur', 'vl-popdur', 'POP_DUR', 'ms');
// 惯性时长：滑块值就是 ms，显示为秒
(function () {
  const sl = document.getElementById('sl-inertdur');
  const vl = document.getElementById('vl-inertdur');
  sl.addEventListener('input', () => {
    CFG.INERTIA_DUR = parseFloat(sl.value);
    vl.textContent = (CFG.INERTIA_DUR / 1000).toFixed(1) + 's';
    render(fracLive);
  });
})();
bindSlider('sl-inertratio', 'vl-inertratio', 'INERTIA_RATIO', '', 0.01);

bindSlider('sl-cx', 'vl-cx', 'curveX', null, 0.10);  // 3~30 → 0.3~3.0
bindSlider('sl-cs', 'vl-cs', 'curveScale', null, 0.10);
bindSlider('sl-cy', 'vl-cy', 'curveY', null, 0.10);
bindSlider('sl-co', 'vl-co', 'curveOpacity', null, 0.10);

document.getElementById('vl-scale').textContent = `${CFG.SCALE_STEP.toFixed(2)}/级`;
document.getElementById('vl-minscale').textContent = CFG.MIN_SCALE.toFixed(2);
document.getElementById('vl-opacity').textContent = `${CFG.OPACITY_STEP.toFixed(2)}/级`;

document.getElementById('tog-shadow').addEventListener('change', e => { CFG.showShadow = e.target.checked; render(fracLive); });
document.getElementById('tog-fps').addEventListener('change', e => { CFG.showFPS = e.target.checked; CFG.showFPS ? startFPS() : stopFPS(); });

document.getElementById('tog-texture').addEventListener('change', e => {
  CFG.showTexture = e.target.checked;
  cardEls.forEach(el => {
    const noise = el.querySelector('.card-noise');
    if (noise) noise.style.opacity = CFG.showTexture ? '0.035' : '0';
  });
});

document.getElementById('tog-sheen').addEventListener('change', e => {
  CFG.showSheen = e.target.checked;
  cardEls.forEach(el => {
    const hl = el.querySelector('.card-highlight');
    if (hl) hl.style.opacity = CFG.showSheen ? '1' : '0';
  });
});

document.getElementById('tog-cycle').addEventListener('change', e => {
  CFG.cycle = e.target.checked;
  snapTo(current);
});

// 弹跳模式切换：点击文字在 'all' / 'single' 间切换
document.getElementById('pop-mode-label').addEventListener('click', () => {
  CFG.popMode = CFG.popMode === 'all' ? 'single' : 'all';
  document.getElementById('pop-mode-label').textContent =
    CFG.popMode === 'all' ? '整行过冲' : '仅居中放大';
});

document.getElementById('dbg-close-btn').addEventListener('click', () => {
  debugOpen = false;
  document.getElementById('debug-panel').classList.remove('open');
});

/* ── 音效控制台绑定 ── */
document.getElementById('tog-sound').addEventListener('change', e => {
  SFX.enabled = e.target.checked;
});

document.getElementById('sl-vol').addEventListener('input', function () {
  SFX.volume = this.value / 100;
  document.getElementById('vl-vol').textContent = this.value + '%';
});

// 点击切换音效
document.getElementById('sound-name').addEventListener('click', () => {
  if (SFX.sounds.length < 2) return;
  SFX.current = (SFX.current + 1) % SFX.sounds.length;
  updateSoundLabel();
  playSfx(); // 试听
});

// 拖放 & 点击选择文件
const soundDrop = document.getElementById('sound-drop');
const soundInput = document.getElementById('sound-input');

soundDrop.addEventListener('click', () => soundInput.click());
soundInput.addEventListener('change', () => {
  Array.from(soundInput.files).forEach(f => loadSoundFile(f));
});

soundDrop.addEventListener('dragover', e => {
  e.preventDefault();
  soundDrop.style.borderColor = 'var(--accent)';
});
soundDrop.addEventListener('dragleave', () => {
  soundDrop.style.borderColor = '';
});
soundDrop.addEventListener('drop', e => {
  e.preventDefault();
  soundDrop.style.borderColor = '';
  Array.from(e.dataTransfer.files)
    .filter(f => f.type.startsWith('audio/'))
    .forEach(f => loadSoundFile(f));
});

/* ══════════════════════════════════════════════════════════════
   Modal — 图标 / 人数选择器
══════════════════════════════════════════════════════════════ */
const overlay = document.getElementById('overlay');

document.getElementById('icon-picker').addEventListener('click', e => {
  const btn = e.target.closest('.ip-btn');
  if (!btn) return;
  document.querySelectorAll('.ip-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
});

document.getElementById('people-picker').addEventListener('click', e => {
  const btn = e.target.closest('.pp-btn');
  if (!btn) return;
  document.querySelectorAll('.pp-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
});

/* ══════════════════════════════════════════════════════════════
   addBill
══════════════════════════════════════════════════════════════ */
const BILL_COLORS = [
  'linear-gradient(135deg,#34C759,#28A745)',
  'linear-gradient(135deg,#FF9500,#FF6B00)',
  'linear-gradient(135deg,#AF52DE,#5E5CE6)',
  'linear-gradient(135deg,#FF3B30,#FF2D55)',
  'linear-gradient(135deg,#007AFF,#5AC8FA)',
  'linear-gradient(135deg,#FFD60A,#FF9F0A)',
];

function addBill() {
  const inpTitle = document.getElementById('inp-title');
  const inpAmount = document.getElementById('inp-amount');
  const inpPayer = document.getElementById('inp-payer');

  const title = inpTitle.value.trim();
  const amount = parseFloat(inpAmount.value);
  const payer = inpPayer.value.trim();

  // 校验
  let valid = true;
  [inpTitle, inpAmount, inpPayer].forEach(el => {
    el.classList.remove('err');
    el.closest('.fg').classList.remove('err');
  });
  if (!title) { inpTitle.classList.add('err'); inpTitle.closest('.fg').classList.add('err'); valid = false; }
  if (!amount || amount <= 0) { inpAmount.classList.add('err'); inpAmount.closest('.fg').classList.add('err'); valid = false; }
  if (!payer) { inpPayer.classList.add('err'); inpPayer.closest('.fg').classList.add('err'); valid = false; }
  if (!valid) return;

  const icon = document.querySelector('.ip-btn.on').dataset.icon;
  const nPeople = parseInt(document.querySelector('.pp-btn.on').dataset.n);
  const perAmount = amount / nPeople;
  const members = DEMO_MEMBERS.slice(0, nPeople);
  const color = BILL_COLORS[bills.length % BILL_COLORS.length];
  const today = new Date().toISOString().slice(0, 10);

  const bill = {
    id: 'local_' + Date.now(),
    icon,
    title,
    description: `${payer} · ${nPeople}人均摊`,
    total_amount: amount,
    per_amount: perAmount,
    date: today,
    payer_name: payer,
    settled: false,
    members,
    items: [{ name: title, price: amount, qty: 1, members }],
    color,
  };

  // TODO: 接入 Supabase 后改为 await DB.createBill(...)
  bills.push(bill);
  const idx = bills.length - 1;
  N = bills.length;

  const newCard = createCard(bill, idx);
  cardEls.push(newCard);
  dotEls.push(createDot());

  newCard.classList.add('scale-pop');

  overlay.classList.remove('on');
  inpTitle.value = ''; inpAmount.value = ''; inpPayer.value = '';
  document.querySelectorAll('.ip-btn').forEach((b, i) => b.classList.toggle('on', i === 0));
  document.querySelectorAll('.pp-btn').forEach(b => b.classList.toggle('on', b.dataset.n === '4'));

  cardEls.forEach(el => {
    el.style.transition = `transform ${CFG.SNAP_DUR}ms cubic-bezier(.25,.46,.45,.94), opacity ${CFG.SNAP_DUR}ms ease`;
  });
  render(idx);
  current = idx;
  fracLive = idx;

  setTimeout(() => {
    requestAnimationFrame(() => {
      newCard.classList.add('pop-go');
    });
    setTimeout(() => {
      newCard.classList.remove('scale-pop', 'pop-go');
      snapTo(idx);
    }, 500);
  }, CFG.SNAP_DUR * 0.5);
}

document.getElementById('addBtn').onclick = () => overlay.classList.add('on');
document.getElementById('cancelBtn').onclick = () => overlay.classList.remove('on');
document.getElementById('createBtn').onclick = addBill;
overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('on'); });

// --- Debug: Add random card ---
function addRandomBill() {
  const RAND_ICONS = ['🍜', '🛒', '🎬', '🚕', '☕', '🏥', '📚', '🎮', '💡', '🏠', '✈️', '🍕'];
  const RAND_TITLES = ['外卖午餐', '超市采购', '电影票', '打车回家', '咖啡续命', '挂号费', '买书', '游戏充值', '电费', '房租', '机票', '聚餐'];
  const r = Math.floor(Math.random() * RAND_ICONS.length);
  const amount = Math.round((20 + Math.random() * 480) * 100) / 100;
  const nPeople = 2 + Math.floor(Math.random() * 3);
  const perAmount = amount / nPeople;
  const members = DEMO_MEMBERS.slice(0, nPeople);
  const color = BILL_COLORS[bills.length % BILL_COLORS.length];
  const today = new Date().toISOString().slice(0, 10);

  const bill = {
    id: 'rand_' + Date.now(),
    icon: RAND_ICONS[r],
    title: RAND_TITLES[r],
    description: `测试 · ${nPeople}人均摊`,
    total_amount: amount,
    per_amount: perAmount,
    date: today,
    payer_name: '测试用户',
    settled: false,
    members,
    items: [{ name: RAND_TITLES[r], price: amount, qty: 1, members }],
    color,
  };

  bills.push(bill);
  const idx = bills.length - 1;
  N = bills.length;

  const newCard = createCard(bill, idx);
  cardEls.push(newCard);
  dotEls.push(createDot());

  newCard.classList.add('scale-pop');

  cardEls.forEach(el => {
    el.style.transition = `transform ${CFG.SNAP_DUR}ms cubic-bezier(.25,.46,.45,.94), opacity ${CFG.SNAP_DUR}ms ease`;
  });
  render(idx);
  current = idx;
  fracLive = idx;

  setTimeout(() => {
    requestAnimationFrame(() => { newCard.classList.add('pop-go'); });
    setTimeout(() => {
      newCard.classList.remove('scale-pop', 'pop-go');
      snapTo(idx);
    }, 500);
  }, CFG.SNAP_DUR * 0.5);
}
document.getElementById('dbg-add-random').onclick = addRandomBill;

/* ══════════════════════════════════════════════════════════════
   燕尾夹 — 月份视图系统
══════════════════════════════════════════════════════════════ */

// --- View Mode State ---
let viewMode = 'all'; // 'all' | 'months' | 'month-detail'
let currentMonthKey = null; // e.g. '2月'
let monthPileEls = [];
let monthDotEls = [];
let monthKeys = []; // sorted month keys
let monthGroups = {}; // { '2月': [bill, ...], ... }
let monthN = 0;

// DOM refs
const monthStage = document.getElementById('month-stage');
const clipBtn = document.getElementById('clip-btn');
const backBtn = document.getElementById('back-btn');
const sectionLabel = document.getElementById('section-label');

// --- Group bills by month ---
function groupBillsByMonth() {
  monthGroups = {};
  bills.forEach(b => {
    const key = isoToMonthKey(b.date); // ISO '2025-02-19' → '2月'
    if (!monthGroups[key]) monthGroups[key] = [];
    monthGroups[key].push(b);
  });
  // Sort months descending (most recent first)
  const monthOrder = ['12月', '11月', '10月', '9月', '8月', '7月', '6月', '5月', '4月', '3月', '2月', '1月'];
  monthKeys = Object.keys(monthGroups).sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
  monthN = monthKeys.length;
}

// --- Create month pile element ---
function createMonthPile(key, billsInMonth, idx) {
  const el = document.createElement('div');
  el.className = 'month-pile';
  el.dataset.idx = idx;
  el.dataset.month = key;

  // Calculate total
  const total = billsInMonth.reduce((sum, b) => sum + (b.total_amount || 0), 0);

  // Unique icons
  const icons = [...new Set(billsInMonth.map(b => b.icon))].slice(0, 5);

  el.innerHTML = `
    <div class="pile-pin">📌</div>
    <div class="pile-card">
      <div class="pile-month-label">${key}</div>
      <div class="pile-year">所有账单</div>
      <div class="pile-divider"></div>
      <div class="pile-count">${billsInMonth.length} 笔账单</div>
      <div class="pile-total">¥ ${total.toLocaleString('zh-CN', { minimumFractionDigits: 0 })}</div>
      <div class="pile-icons">${icons.map(i => `<span>${i}</span>`).join('')}</div>
    </div>`;

  monthStage.appendChild(el);
  return el;
}

// --- Month pile carousel engine (mirrors card carousel) ---
let mFracLive = 0;
let mCurrent = 0;
let mDragging = false;
let mStartX = 0;
let mStartFrac = 0;
let mTouchStartTime = 0;
let mTouchStartX = 0;
let mInertiaRafId = null;
let mMoveHistory = [];
let mRafId = null;
let mPendFrac = 0;

function renderMonths(frac) {
  mFracLive = frac;
  monthPileEls.forEach((el, i) => {
    const offset = i - frac;
    const absO = Math.abs(offset);
    const sign = Math.sign(offset);

    const cX = Math.pow(absO, CFG.curveX);
    const cS = Math.pow(absO, CFG.curveScale);
    const cY = Math.pow(absO, CFG.curveY);
    const cO = Math.pow(absO, CFG.curveOpacity);

    const x = sign * cX * CFG.STEP;
    const y = cY * CFG.Y_STEP;
    const scale = Math.max(CFG.MIN_SCALE, 1 - cS * CFG.SCALE_STEP);
    const op = Math.max(0.28, 1 - cO * CFG.OPACITY_STEP);

    el.style.transform = `translateX(${x}px) translateY(${y}px) scale(${scale})`;
    el.style.opacity = op;
    el.style.zIndex = Math.round(50 - absO * 10);

    el.classList.remove('shadow-active', 'shadow-side');
    if (absO < 0.5) el.classList.add('shadow-active');
    else if (absO < 1.6) el.classList.add('shadow-side');
  });

  const ci = Math.max(0, Math.min(monthN - 1, Math.round(frac)));
  monthDotEls.forEach((d, i) => {
    const on = (i === ci);
    if (on !== d.classList.contains('on')) d.classList.toggle('on', on);
  });
}

function scheduleRenderMonths(frac) {
  mPendFrac = frac;
  if (mRafId) return;
  mRafId = requestAnimationFrame(() => { mRafId = null; renderMonths(mPendFrac); });
}

function snapToMonth(idx) {
  idx = Math.max(0, Math.min(monthN - 1, idx));
  mCurrent = idx;
  monthPileEls.forEach(el => {
    el.style.transition = `transform ${CFG.SNAP_DUR}ms cubic-bezier(.25,.46,.45,.94), opacity ${CFG.SNAP_DUR}ms ease`;
  });
  renderMonths(idx);
  setTimeout(() => { mFracLive = mCurrent; }, CFG.SNAP_DUR + 60);
}

// Drag handlers for month piles
function onMonthDragStart(x) {
  if (mInertiaRafId) { cancelAnimationFrame(mInertiaRafId); mInertiaRafId = null; }
  mDragging = true; mStartX = x; mTouchStartX = x;
  mStartFrac = mFracLive; mTouchStartTime = Date.now();
  mMoveHistory = [{ x, t: Date.now() }];
  monthStage.classList.add('dragging');
  monthPileEls.forEach(el => { el.style.transition = 'none'; });
}

function onMonthDragMove(x) {
  if (!mDragging) return;
  const now = Date.now();
  mMoveHistory.push({ x, t: now });
  while (mMoveHistory.length > 2 && now - mMoveHistory[0].t > VELOCITY_WINDOW) mMoveHistory.shift();
  const dx = x - mStartX;
  const frac = Math.max(0, Math.min(monthN - 1, mStartFrac - dx / CFG.DRAG_PX));
  scheduleRenderMonths(frac);
}

function onMonthDragEnd(x) {
  if (!mDragging) return;
  mDragging = false;
  monthStage.classList.remove('dragging');

  const dx = x - mStartX;
  const duration = Date.now() - mTouchStartTime;

  // Click detection on pile
  if (Math.abs(dx) < 8 && duration < 250) {
    const rect = monthStage.getBoundingClientRect();
    const clickX = x - rect.left - rect.width / 2;
    const clicked = Math.round(mCurrent + (clickX / CFG.STEP));
    const target = Math.max(0, Math.min(monthN - 1, clicked));

    // If tapping the center pile, enter that month's detail
    if (target === mCurrent) {
      enterMonthDetail(monthKeys[mCurrent]);
    } else {
      snapToMonth(target);
    }
    return;
  }

  mMoveHistory.push({ x, t: Date.now() });
  const oldest = mMoveHistory[0];
  const newest = mMoveHistory[mMoveHistory.length - 1];
  const dt = Math.max(1, newest.t - oldest.t);
  const dxRecent = newest.x - oldest.x;
  const velocity = -(dxRecent / CFG.DRAG_PX) / (dt / 1000);

  const inertiaStart = performance.now();
  const startVelocity = velocity * CFG.INERTIA_RATIO;
  const inertiaDur = CFG.INERTIA_DUR;
  const inertiaStartF = mFracLive;

  function inertiaStep(now) {
    const elapsed = now - inertiaStart;
    const t = Math.min(1, elapsed / inertiaDur);
    const easeT = t * (2 - t);
    const displacement = startVelocity * (inertiaDur / 1000) * easeT * 0.5;
    let frac = Math.max(0, Math.min(monthN - 1, inertiaStartF + displacement));
    monthPileEls.forEach(el => { el.style.transition = 'none'; });
    renderMonths(frac);
    if (t < 1) {
      mInertiaRafId = requestAnimationFrame(inertiaStep);
    } else {
      mInertiaRafId = null;
      snapToMonth(Math.round(frac));
    }
  }

  if (Math.abs(startVelocity) < 0.3) {
    snapToMonth(Math.round(mFracLive));
  } else {
    mInertiaRafId = requestAnimationFrame(inertiaStep);
  }
}

// Month stage event listeners
monthStage.addEventListener('mousedown', e => { if (viewMode === 'months') { onMonthDragStart(e.clientX); e.preventDefault(); } });
document.addEventListener('mousemove', e => { if (mDragging) onMonthDragMove(e.clientX); });
document.addEventListener('mouseup', e => { if (mDragging) onMonthDragEnd(e.clientX); });

monthStage.addEventListener('touchstart', e => { if (viewMode === 'months') onMonthDragStart(e.touches[0].clientX); }, { passive: true });
monthStage.addEventListener('touchmove', e => {
  if (!mDragging) return;
  e.preventDefault();
  onMonthDragMove(e.touches[0].clientX);
}, { passive: false });
monthStage.addEventListener('touchend', e => { if (mDragging) onMonthDragEnd(e.changedTouches[0].clientX); });

// --- View Mode Switching ---
function buildMonthPiles() {
  groupBillsByMonth();
  // Clear old piles
  monthStage.innerHTML = '';
  monthPileEls = [];
  // Clear old month dots
  dotsEl.innerHTML = '';
  // Build piles
  monthKeys.forEach((key, i) => {
    monthPileEls.push(createMonthPile(key, monthGroups[key], i));
  });
  // Build dots for months
  monthDotEls = monthKeys.map(() => {
    const d = document.createElement('div');
    d.className = 'dot';
    dotsEl.appendChild(d);
    return d;
  });
}

function enterMonthsView() {
  viewMode = 'months';
  clipBtn.classList.add('active');

  // Build month piles
  buildMonthPiles();

  // Hide card stage, show month stage
  stage.classList.add('hidden');
  monthStage.classList.add('visible');

  // Update label
  sectionLabel.textContent = '月份账单';
  backBtn.style.display = 'none';

  // Reset and render
  mCurrent = 0;
  mFracLive = 0;
  snapToMonth(0);
}

function enterMonthDetail(monthKey) {
  viewMode = 'month-detail';
  currentMonthKey = monthKey;

  const monthBills = monthGroups[monthKey];

  // Step 1: Unpin animation on the current pile
  const currentPile = monthPileEls[mCurrent];
  const pinEl = currentPile ? currentPile.querySelector('.pile-pin') : null;
  if (pinEl) pinEl.classList.add('unpin');

  // Step 2: After unpin, switch view and add cards one-by-one
  setTimeout(() => {
    monthStage.classList.remove('visible');
    stage.classList.remove('hidden');
    stage.innerHTML = '';
    dotsEl.innerHTML = '';
    cardEls.length = 0;
    dotEls.length = 0;

    // Pre-create all cards but keep invisible
    const allCards = [];
    const allDots = [];
    monthBills.forEach((b, i) => {
      const card = createCard(b, i);
      const dot = createDot();
      allCards.push(card);
      allDots.push(dot);
      card.classList.add('scale-pop'); // invisible via scale:0
    });

    sectionLabel.textContent = `${monthKey}的账单`;
    backBtn.style.display = 'inline-block';
    current = 0;
    fracLive = 0;

    // Add cards one by one at stagger intervals
    const STAGGER = 100;
    let added = 0;
    N = allCards.length; // N is full count so render positions all correctly

    function addNextCard() {
      if (added >= allCards.length) {
        // All done — cleanup
        setTimeout(() => {
          cardEls.forEach(c => c.classList.remove('scale-pop', 'pop-go'));
          snapTo(0);
        }, 500);
        return;
      }

      const card = allCards[added];
      cardEls.push(card);
      dotEls.push(allDots[added]);

      // Render positions for all visible cards
      cardEls.forEach(el => { el.style.transition = 'none'; });
      render(0);

      // Pop this card in at its carousel position
      requestAnimationFrame(() => {
        card.classList.add('pop-go');
      });

      added++;
      setTimeout(addNextCard, STAGGER);
    }

    addNextCard();
  }, 350);
}

function exitToAllView() {
  viewMode = 'all';
  clipBtn.classList.remove('active');
  currentMonthKey = null;

  // Restore card stage with all bills
  monthStage.classList.remove('visible');
  stage.classList.remove('hidden');
  stage.innerHTML = '';
  dotsEl.innerHTML = '';

  cardEls.length = 0;
  dotEls.length = 0;
  N = bills.length;

  bills.forEach((b, i) => {
    cardEls.push(createCard(b, i));
    dotEls.push(createDot());
  });

  sectionLabel.textContent = '最近账单';
  backBtn.style.display = 'none';

  current = 0;
  fracLive = 0;
  snapTo(0);
}

function exitToMonthsView() {
  // Step 1: Collapse cards animation
  cardEls.forEach(card => {
    card.classList.add('anim-collapse');
  });

  // Trigger collapse by forcing all to center
  requestAnimationFrame(() => {
    cardEls.forEach(card => {
      card.classList.add('collapsed');
    });
  });

  // Step 2: After collapse, switch to months view with repin
  setTimeout(() => {
    viewMode = 'months';

    // Hide card stage, show month stage
    stage.classList.add('hidden');
    monthStage.classList.add('visible');

    sectionLabel.textContent = '月份账单';
    backBtn.style.display = 'none';

    // Find index of the month we were viewing
    const idx = monthKeys.indexOf(currentMonthKey);
    if (idx >= 0) {
      mCurrent = idx;
      mFracLive = idx;
      snapToMonth(idx);
    }

    // Rebuild dots for months
    dotsEl.innerHTML = '';
    monthDotEls = monthKeys.map(() => {
      const d = document.createElement('div');
      d.className = 'dot';
      dotsEl.appendChild(d);
      return d;
    });
    renderMonths(mFracLive);

    // Step 3: Repin animation on the current pile's pushpin
    const targetPile = monthPileEls[mCurrent];
    if (targetPile) {
      const pinEl = targetPile.querySelector('.pile-pin');
      if (pinEl) {
        pinEl.classList.remove('unpin');
        pinEl.classList.add('repin');
        setTimeout(() => pinEl.classList.remove('repin'), 550);
      }
    }
  }, 420); // wait for collapse animation
}

// --- Event: Clip button toggle ---
clipBtn.addEventListener('click', () => {
  if (viewMode === 'all') {
    enterMonthsView();
  } else if (viewMode === 'months') {
    exitToAllView();
  } else if (viewMode === 'month-detail') {
    exitToAllView();
  }
});

// --- Event: Back button ---
backBtn.addEventListener('click', () => {
  if (viewMode === 'month-detail') {
    exitToMonthsView();
  }
});
