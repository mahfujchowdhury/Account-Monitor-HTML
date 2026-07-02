/* =====================================================
   Signals — 4-Category Market Direction Engine
   Multi-symbol, multi-timeframe. — signals.js
   =====================================================
   Categories: Trend · Momentum · Volatility/Volume · S&R Structure.
   Readings are generated deterministically per (symbol, timeframe)
   so the display is stable across re-renders (no random flicker).
*/

// ── Universe ──────────────────────────────────────────
const SIG_SYMBOLS = [
  { sym: 'XAUUSDm', label: 'Gold vs US Dollar',     price: 3342.80, digits: 2,  bias: -52 },
  { sym: 'BTCUSDm', label: 'Bitcoin vs US Dollar',  price: 83835.0, digits: 1,  bias:  46 },
  { sym: 'EURUSDm', label: 'Euro vs US Dollar',     price: 1.09140, digits: 5,  bias: -18 },
  { sym: 'GBPUSDm', label: 'Pound vs US Dollar',    price: 1.27300, digits: 5,  bias:  30 },
  { sym: 'USDJPYm', label: 'US Dollar vs Yen',      price: 157.200, digits: 3,  bias:  58 },
  { sym: 'GBPJPYm', label: 'Pound vs Yen',          price: 200.100, digits: 3,  bias:  44 },
  { sym: 'AUDUSDm', label: 'Aussie vs US Dollar',   price: 0.66200, digits: 5,  bias: -34 }
];
const SIG_TFS = ['M1', 'M5', 'M15', 'H1', 'H4', 'D1'];
const SIG_TF_WEIGHT = { M1: 0.42, M5: 0.56, M15: 0.70, H1: 0.86, H4: 1.0, D1: 1.12 };
const SIG_TF_NAME = { M1: '1 Min', M5: '5 Min', M15: '15 Min', H1: '1 Hour', H4: '4 Hour', D1: 'Daily' };

// Current selection
let sigSymbol = 'XAUUSDm';
let sigTf = 'H1';

// ── Deterministic RNG (stable per symbol+tf) ──────────
function sigHash(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h ^ (h >>> 16)) >>> 0;
}
function sigRng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// ── Verdict / action helpers ──────────────────────────
function verdictInfo(score) {
  if (score >= 50)  return { label: 'STRONG BUY',  cls: 'buy',     badge: 'badge-strong-buy',  tag: 'tag-buy' };
  if (score >= 20)  return { label: 'BUY',         cls: 'buy',     badge: 'badge-buy',         tag: 'tag-buy' };
  if (score > -20)  return { label: 'NEUTRAL',     cls: 'neutral', badge: 'badge-neutral',     tag: 'tag-neutral' };
  if (score > -50)  return { label: 'SELL',        cls: 'sell',    badge: 'badge-sell',        tag: 'tag-sell' };
  return              { label: 'STRONG SELL', cls: 'sell',    badge: 'badge-strong-sell', tag: 'tag-sell' };
}
// Short form (no STRONG) for compact cells
function shortInfo(score) {
  if (score >= 20)  return { label: 'BUY',     cls: 'buy' };
  if (score > -20)  return { label: 'NEUTRAL', cls: 'neutral' };
  return              { label: 'SELL',    cls: 'sell' };
}

// ── Signal builder ────────────────────────────────────
function buildSignals(symbol, tf) {
  const meta = SIG_SYMBOLS.find(s => s.sym === symbol) || SIG_SYMBOLS[0];
  const rng = sigRng(sigHash(symbol + '|' + tf));
  const rr = (a, b) => a + rng() * (b - a);
  const fmt = v => v.toLocaleString(undefined, { minimumFractionDigits: meta.digits, maximumFractionDigits: meta.digits });

  // Directional lean for this (symbol, tf)
  const bias = clamp(meta.bias * SIG_TF_WEIGHT[tf] + rr(-14, 14), -100, 100);

  // Per-category scores — correlated with bias but distinct
  const cs = {
    trend:      clamp(bias * 1.00 + rr(-22, 22), -100, 100),
    momentum:   clamp(bias * 0.90 + rr(-28, 28), -100, 100),
    volatility: clamp(bias * 0.70 + rr(-32, 32), -100, 100),
    structure:  clamp(bias * 0.95 + rr(-24, 24), -100, 100)
  };

  // Per-indicator action, noised around the category score
  const item = (name, score, valueFn) => {
    const iv = clamp(score + rr(-35, 35), -100, 100);
    const a = shortInfo(iv);
    return { name, value: valueFn(a, iv), action: a.label, cls: a.cls };
  };

  const dir = (a, up, down, flat) => a.cls === 'buy' ? up : a.cls === 'sell' ? down : flat;

  const categories = {
    trend: {
      score: cs.trend, ...verdictInfo(cs.trend),
      items: [
        item('EMA Stack (10/20/50/200)', cs.trend, a => dir(a, '10>20>50>200', '10<20<50<200', 'Crossing / mixed')),
        item('MACD (12,26)',             cs.trend, (a, iv) => 'Hist ' + (iv >= 0 ? '+' : '') + (iv / 100 * rr(0.8, 3.6)).toFixed(2)),
        item('ADX (14) + DI',            cs.trend, (a) => { const adx = rr(14, 46); return adx.toFixed(1) + dir(a, ' (+DI)', ' (−DI)', ' (flat)'); }),
        item('SuperTrend (10,3)',        cs.trend, a => dir(a, 'Bullish flip', 'Bearish flip', 'Neutral')),
        item('Ichimoku Cloud',           cs.trend, a => dir(a, 'Above cloud', 'Below cloud', 'In cloud'))
      ]
    },
    momentum: {
      score: cs.momentum, ...verdictInfo(cs.momentum),
      items: [
        item('RSI (14)',            cs.momentum, (a, iv) => { const v = clamp(50 + iv * 0.35 + rr(-5, 5), 1, 99); return v.toFixed(1) + (v > 70 ? ' OB' : v < 30 ? ' OS' : ''); }),
        item('Stochastic %K (14,3)', cs.momentum, (a, iv) => clamp(50 + iv * 0.40 + rr(-8, 8), 1, 99).toFixed(1)),
        item('CCI (14)',            cs.momentum, (a, iv) => (iv * 2 + rr(-30, 30)).toFixed(1)),
        item('Awesome Osc.',        cs.momentum, (a, iv) => (iv >= 0 ? '+' : '') + (iv / 100 * rr(1, 6)).toFixed(2)),
        item('Williams %R',         cs.momentum, (a, iv) => clamp(-50 + iv * 0.45 + rr(-6, 6), -99, -1).toFixed(1))
      ]
    },
    volatility: {
      score: cs.volatility, ...verdictInfo(cs.volatility),
      items: [
        item('Bollinger Band Width', cs.volatility, (a, iv) => (Math.abs(iv) > 38 ? 'Expanding ' : 'Contracting ') + rr(0.3, 3.4).toFixed(2) + '%'),
        item('ATR (14)',             cs.volatility, (a)     => fmt(meta.price * rr(0.001, 0.009)) + dir(a, ' ↑', ' ↓', ' →')),
        item('Volume vs 20-avg',     cs.volatility, (a, iv) => { const p = iv * 0.6 + rr(-18, 18); return (p >= 0 ? '+' : '') + p.toFixed(0) + '%'; }),
        item('OBV Trend',            cs.volatility, a => dir(a, 'Rising', 'Falling', 'Flat')),
        item('MFI (14)',             cs.volatility, (a, iv) => clamp(50 + iv * 0.35 + rr(-6, 6), 1, 99).toFixed(1))
      ]
    },
    structure: {
      score: cs.structure, ...verdictInfo(cs.structure),
      items: [
        item('Pivot (Classic)',   cs.structure, (a) => dir(a, 'Above P ', 'Below P ', 'At P ') + fmt(meta.price * (1 + rr(-0.002, 0.002)))),
        item('Donchian (20)',      cs.structure, a => dir(a, 'Near upper', 'Near lower', 'Mid-channel')),
        item('Order Block',        cs.structure, a => dir(a, 'Bull OB held', 'Bear OB active', 'No OB near')),
        item('Fair Value Gap',     cs.structure, a => dir(a, 'Bullish FVG', 'Bearish FVG', 'FVG filled')),
        item('Swing Structure',    cs.structure, a => dir(a, 'HH / HL', 'LH / LL', 'Ranging'))
      ]
    }
  };

  const composite = (cs.trend + cs.momentum + cs.volatility + cs.structure) / 4;
  const gaugeValue = clamp(50 - composite * 0.5, 0, 100); // 0 = strong buy, 100 = strong sell
  const sign = Math.sign(composite);
  const aligned = [cs.trend, cs.momentum, cs.volatility, cs.structure].filter(s => Math.sign(s) === sign).length;
  const confidence = Math.round(clamp((Math.abs(composite) / 100) * 60 + (aligned / 4) * 40, 0, 100));

  return { categories, composite, gaugeValue, confidence, ...verdictInfo(composite) };
}

// ── Rendering ─────────────────────────────────────────
function renderSigSymbolRow() {
  const row = document.getElementById('sigSymbolRow');
  if (!row || row.childElementCount) return; // build pills once
  row.innerHTML = SIG_SYMBOLS.map(s =>
    `<button class="sig-sym-btn" data-symbol="${s.sym}">${s.sym}</button>`
  ).join('');
  row.querySelectorAll('.sig-sym-btn').forEach(btn => {
    btn.addEventListener('click', () => { sigSymbol = btn.dataset.symbol; renderSignals(); });
  });
}

function renderCategory(key, cat) {
  const tbody = document.getElementById('cat-' + key);
  if (tbody) {
    tbody.innerHTML = cat.items.map(it => `
      <tr>
        <td class="ind-cell-name">${it.name}</td>
        <td class="ind-cell-val">${it.value}</td>
        <td><span class="action-tag tag-${it.cls}">${it.action}</span></td>
      </tr>`).join('');
  }
  const badge = document.getElementById('catBadge-' + key);
  if (badge) {
    badge.textContent = cat.label;
    badge.className = 'summary-badge ' + cat.badge;
  }
}

function renderSigMatrix() {
  const body = document.getElementById('sigMatrixBody');
  if (!body) return;
  body.innerHTML = SIG_TFS.map(tf => {
    const d = buildSignals(sigSymbol, tf);
    const cell = sc => { const s = shortInfo(sc); return `<td class="text-${s.cls}">${s.label}</td>`; };
    const ov = verdictInfo(d.composite);
    const active = tf === sigTf ? ' class="active-row"' : '';
    return `
      <tr data-tf="${tf}"${active}>
        <td class="tf-name">${tf} (${SIG_TF_NAME[tf]})</td>
        ${cell(d.categories.trend.score)}
        ${cell(d.categories.momentum.score)}
        ${cell(d.categories.volatility.score)}
        ${cell(d.categories.structure.score)}
        <td><span class="action-tag ${ov.tag}">${ov.label}</span></td>
      </tr>`;
  }).join('');
}

function renderSignals() {
  const meta = SIG_SYMBOLS.find(s => s.sym === sigSymbol) || SIG_SYMBOLS[0];
  const data = buildSignals(sigSymbol, sigTf);

  // Header
  setSigText('sigSymbolName', meta.sym);
  setSigText('sigSymbolLabel', `${meta.label} · ${sigTf}`);

  // Active states
  document.querySelectorAll('#sigSymbolRow .sig-sym-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.symbol === sigSymbol));
  document.querySelectorAll('#sigTfRow .tf-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.tf === sigTf));

  // Gauge needle: 0 → -90deg (buy), 100 → +90deg (sell)
  const needle = document.getElementById('sigNeedle');
  if (needle) needle.style.transform = `translateX(-50%) rotate(${-90 + (data.gaugeValue / 100) * 180}deg)`;

  // Direction verdict
  const dirEl = document.getElementById('sigDirection');
  if (dirEl) { dirEl.textContent = data.label; dirEl.className = 'comp-direction text-' + data.cls; }

  // Confidence
  setSigText('sigConfVal', data.confidence + '%');
  const fill = document.getElementById('sigConfFill');
  if (fill) {
    fill.style.width = data.confidence + '%';
    fill.className = 'dd-fill ' + (data.confidence >= 66 ? 'dd-fill-safe' : data.confidence >= 40 ? 'dd-fill-warn' : 'dd-fill-danger');
  }

  // Category mini-badges
  const mini = document.getElementById('sigMiniBadges');
  if (mini) {
    const defs = [
      ['Trend', data.categories.trend.cls],
      ['Mom', data.categories.momentum.cls],
      ['Vol', data.categories.volatility.cls],
      ['S&R', data.categories.structure.cls]
    ];
    const arrow = cls => cls === 'buy' ? '▲' : cls === 'sell' ? '▼' : '●';
    mini.innerHTML = defs.map(([lbl, cls]) =>
      `<span class="sig-mini sig-mini-${cls}">${lbl} <b>${arrow(cls)}</b></span>`).join('');
  }

  // Category tables
  renderCategory('trend', data.categories.trend);
  renderCategory('momentum', data.categories.momentum);
  renderCategory('volatility', data.categories.volatility);
  renderCategory('structure', data.categories.structure);

  // Multi-timeframe matrix
  renderSigMatrix();
}

function setSigText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// ── Init ──────────────────────────────────────────────
(function initSignals() {
  if (!document.getElementById('tab-signals')) return;
  renderSigSymbolRow();
  document.querySelectorAll('#sigTfRow .tf-btn').forEach(btn => {
    btn.addEventListener('click', () => { sigTf = btn.dataset.tf; renderSignals(); });
  });
  renderSignals();
})();
