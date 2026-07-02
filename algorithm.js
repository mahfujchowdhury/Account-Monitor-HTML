/* =====================================================
   Algorithm Tab — EA Fleet, P&L & Risk — algorithm.js
   ===================================================== */

// Expert Advisor fleet state. Symbols kept consistent with the rest of the app.
let algoEAs = [
  {
    id: 1,
    name: 'Momentum Scalper',
    symbol: 'XAUUSDm',
    timeframe: 'H1',
    magic: 100234,
    status: 'active',        // 'active' | 'paused' | 'stopped'
    openTrades: 2,
    todayPnl: 18.40,
    totalPnl: 412.85,
    winRate: 64.2,
    trades: 318,
    riskPct: 3.80,
    exposureUsd: 6680.00
  },
  {
    id: 2,
    name: 'Trend Rider',
    symbol: 'BTCUSDm',
    timeframe: 'H4',
    magic: 100567,
    status: 'active',
    openTrades: 1,
    todayPnl: -6.10,
    totalPnl: 286.40,
    winRate: 51.9,
    trades: 133,
    riskPct: 2.10,
    exposureUsd: 8383.52
  },
  {
    id: 3,
    name: 'Mean Reversion',
    symbol: 'EURUSDm',
    timeframe: 'M15',
    magic: 100890,
    status: 'paused',
    openTrades: 0,
    todayPnl: 0.00,
    totalPnl: 94.55,
    winRate: 58.7,
    trades: 421,
    riskPct: 1.50,
    exposureUsd: 0.00
  },
  {
    id: 4,
    name: 'Grid Hedge',
    symbol: 'GBPUSDm',
    timeframe: 'M30',
    magic: 101122,
    status: 'stopped',
    openTrades: 0,
    todayPnl: 0.00,
    totalPnl: -42.30,
    winRate: 47.1,
    trades: 88,
    riskPct: 0.00,
    exposureUsd: 0.00
  }
];

// ── Formatting helpers ────────────────────────────────
function algoMoney(v) {
  const sign = v > 0 ? '+' : v < 0 ? '-' : '';
  return sign + '$' + Math.abs(v).toFixed(2);
}
function algoPnlClass(v) { return v > 0 ? 'green' : v < 0 ? 'red' : ''; }
function algoPosNeg(v) { return v > 0 ? 'pos' : v < 0 ? 'neg' : ''; }

const ALGO_STATUS = {
  active:  { label: 'ACTIVE',  badge: 'expo-ok' },
  paused:  { label: 'PAUSED',  badge: 'expo-warn' },
  stopped: { label: 'STOPPED', badge: 'algo-badge-muted' }
};

// ── Strategies table ──────────────────────────────────
function renderAlgoTable() {
  const tbody = document.getElementById('algoTableBody');
  if (!tbody) return;

  tbody.innerHTML = algoEAs.map(ea => {
    const st = ALGO_STATUS[ea.status];
    // Action button: Pause active, Resume paused, none for stopped.
    let action = '<span class="algo-action-na">—</span>';
    if (ea.status === 'active') {
      action = `<button class="algo-toggle-btn algo-pause" onclick="toggleEA(${ea.id})">Pause</button>`;
    } else if (ea.status === 'paused') {
      action = `<button class="algo-toggle-btn algo-resume" onclick="toggleEA(${ea.id})">Resume</button>`;
    }

    return `
      <tr>
        <td class="symbol">${ea.name}</td>
        <td>${ea.symbol} · ${ea.timeframe}</td>
        <td class="row-num">${ea.magic}</td>
        <td><span class="expo-badge ${st.badge}">${st.label}</span></td>
        <td>${ea.openTrades} / ${ea.trades}</td>
        <td class="${algoPosNeg(ea.todayPnl)}">${algoMoney(ea.todayPnl)}</td>
        <td class="${algoPosNeg(ea.totalPnl)}">${algoMoney(ea.totalPnl)}</td>
        <td>${ea.winRate.toFixed(1)}%</td>
        <td>${ea.riskPct.toFixed(2)}%</td>
        <td>${action}</td>
      </tr>`;
  }).join('');
}

// ── Toggle Active ⇄ Paused ────────────────────────────
function toggleEA(id) {
  const ea = algoEAs.find(e => e.id === id);
  if (!ea) return;
  if (ea.status === 'active') {
    ea.status = 'paused';
    ea.openTrades = 0;          // pausing flattens open trades
    ea.exposureUsd = 0;
    ea.riskPct = 0;
  } else if (ea.status === 'paused') {
    ea.status = 'active';
  }
  renderAlgoTable();
  recalcAlgoKPIs();
}

// ── KPI strip + risk panel recompute ──────────────────
const ALGO_RISK_BUDGET = 10.00; // % of account allocated to algos

function recalcAlgoKPIs() {
  const active = algoEAs.filter(e => e.status === 'active');

  const todayPnl = algoEAs.reduce((s, e) => s + e.todayPnl, 0);
  const totalPnl = algoEAs.reduce((s, e) => s + e.totalPnl, 0);
  const riskUsed = active.reduce((s, e) => s + e.riskPct, 0);
  const openTrades = algoEAs.reduce((s, e) => s + e.openTrades, 0);

  // Trade-weighted aggregate win rate.
  const totalTrades = algoEAs.reduce((s, e) => s + e.trades, 0);
  const winRate = totalTrades
    ? algoEAs.reduce((s, e) => s + e.winRate * e.trades, 0) / totalTrades
    : 0;

  // KPI strip
  setAlgoText('algoActiveCount', `${active.length} / ${algoEAs.length}`);
  setAlgoMoney('algoTodayPnl', todayPnl);
  setAlgoMoney('algoTotalPnl', totalPnl);
  setAlgoText('algoRiskUsed', riskUsed.toFixed(2) + '%');
  setAlgoText('algoWinRate', winRate.toFixed(1) + '%');
  setAlgoText('algoExposure', String(openTrades));

  // Risk budget meter
  setAlgoText('algoRiskUsedMeter', riskUsed.toFixed(2) + '%');
  const fill = document.getElementById('algoRiskFill');
  if (fill) {
    const pct = Math.min(100, (riskUsed / ALGO_RISK_BUDGET) * 100);
    fill.style.width = pct + '%';
    fill.className = 'dd-fill ' + (pct < 60 ? 'dd-fill-safe' : pct < 85 ? 'dd-fill-warn' : 'dd-fill-danger');
  }

  // Per-EA risk allocation bars (relative to budget)
  const allocList = document.getElementById('algoAllocList');
  if (allocList) {
    allocList.innerHTML = algoEAs.map(ea => {
      const pct = Math.min(100, (ea.riskPct / ALGO_RISK_BUDGET) * 100);
      const fillClass = ea.status === 'active' ? 'dd-fill-safe' : 'algo-fill-idle';
      return `
        <div class="algo-alloc-row">
          <div class="algo-alloc-head">
            <span class="algo-alloc-name">${ea.name}</span>
            <span class="algo-alloc-val">${ea.riskPct.toFixed(2)}%</span>
          </div>
          <div class="dd-track">
            <div class="dd-fill ${fillClass}" style="width:${pct}%"></div>
          </div>
        </div>`;
    }).join('');
  }

  // Exposure by symbol (active EAs only)
  const expoList = document.getElementById('algoExposureList');
  if (expoList) {
    const bySymbol = {};
    active.forEach(e => { bySymbol[e.symbol] = (bySymbol[e.symbol] || 0) + e.exposureUsd; });
    const entries = Object.entries(bySymbol).filter(([, v]) => v > 0);
    expoList.innerHTML = entries.length
      ? entries.map(([sym, v]) => `
          <div class="algo-expo-item">
            <span class="algo-expo-sym">${sym}</span>
            <span class="algo-expo-amt">$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>`).join('')
      : '<div class="algo-expo-empty">No open algo exposure</div>';
  }

  // Account P&L summary (floating ≈ today's open-trade contribution)
  const floating = active.reduce((s, e) => s + e.todayPnl, 0);
  setAlgoMoney('algoAcctToday', todayPnl, true);
  setAlgoMoney('algoAcctTotal', totalPnl, true);
  setAlgoMoney('algoAcctFloat', floating, true);

  // Profit contribution donut
  renderAlgoDonut();
}

// ── Profit Contribution donut ─────────────────────────
const ALGO_PALETTE = ['#3d8ef0', '#22c97a', '#a06bff', '#f0b429', '#00bcd4', '#f0504a'];

function eaColor(i) { return ALGO_PALETTE[i % ALGO_PALETTE.length]; }

function renderAlgoDonut() {
  const canvas = document.getElementById('algoDonutCanvas');
  if (!canvas) return;

  const net = algoEAs.reduce((s, e) => s + e.totalPnl, 0);
  const winners = algoEAs.filter(e => e.totalPnl > 0);
  const grossProfit = winners.reduce((s, e) => s + e.totalPnl, 0);

  // Center label
  const centerEl = document.getElementById('algoDonutCenter');
  if (centerEl) {
    centerEl.textContent = algoMoney(net);
    centerEl.className = 'algo-donut-center-val ' + algoPosNeg(net);
  }

  // Legend — all EAs, with color dot + P&L + share of gross profit
  const legend = document.getElementById('algoDonutLegend');
  if (legend) {
    legend.innerHTML = algoEAs.map((ea, i) => {
      const share = ea.totalPnl > 0 && grossProfit > 0
        ? ((ea.totalPnl / grossProfit) * 100).toFixed(1) + '%'
        : '—';
      const dot = ea.totalPnl > 0 ? eaColor(i) : 'var(--muted)';
      return `
        <div class="algo-leg-item">
          <span class="algo-leg-dot" style="background:${dot}"></span>
          <span class="algo-leg-name">${ea.name}</span>
          <span class="algo-leg-pnl ${algoPosNeg(ea.totalPnl)}">${algoMoney(ea.totalPnl)}</span>
          <span class="algo-leg-share">${share}</span>
        </div>`;
    }).join('');
  }

  // Canvas ring
  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return; // hidden tab — ResizeObserver redraws later
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const W = rect.width, H = rect.height;
  const cx = W / 2, cy = H / 2;
  const radius = Math.min(W, H) / 2 - 4;
  const thickness = Math.max(10, radius * 0.34);
  const isLight = document.body.classList.contains('light');

  ctx.clearRect(0, 0, W, H);

  if (grossProfit <= 0) {
    // Nothing profitable — draw an empty track ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius - thickness / 2, 0, Math.PI * 2);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = isLight ? 'rgba(0,0,0,0.08)' : '#252a3d';
    ctx.stroke();
    return;
  }

  let start = -Math.PI / 2; // 12 o'clock
  const gap = 0.04;          // small gap between slices (radians)
  algoEAs.forEach((ea, i) => {
    if (ea.totalPnl <= 0) return;
    const frac = ea.totalPnl / grossProfit;
    const end = start + frac * (Math.PI * 2);
    ctx.beginPath();
    ctx.arc(cx, cy, radius - thickness / 2, start + gap / 2, end - gap / 2);
    ctx.lineWidth = thickness;
    ctx.lineCap = 'butt';
    ctx.strokeStyle = eaColor(i);
    ctx.stroke();
    start = end;
  });
}

// ── Small DOM helpers ─────────────────────────────────
function setAlgoText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
function setAlgoMoney(id, v, useSummaryClass) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = algoMoney(v);
  if (useSummaryClass) {
    el.className = 'algo-pnl-val ' + algoPosNeg(v);
  } else {
    el.className = 'metric-val ' + algoPnlClass(v);
  }
}

// ── Init ──────────────────────────────────────────────
(function initAlgorithmTab() {
  renderAlgoTable();
  recalcAlgoKPIs();

  // Redraw the donut when its canvas gains size (tab shown) or on resize.
  const canvas = document.getElementById('algoDonutCanvas');
  if (canvas && typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => renderAlgoDonut());
    ro.observe(canvas);
  }
})();
