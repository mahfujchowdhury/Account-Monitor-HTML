/* =====================================================
   MT5 AI Account Monitor — app.js
   ===================================================== */

// ── Tab switching ─────────────────────────────────────
const sbBtns    = document.querySelectorAll('.sb-btn');
const tabPanels = document.querySelectorAll('.tab-content');
const summaryPeriodWrapper = document.getElementById('summaryPeriodWrapper');

sbBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;

    sbBtns.forEach(b => b.classList.remove('active'));
    tabPanels.forEach(t => t.classList.remove('active'));

    btn.classList.add('active');
    const panel = document.getElementById('tab-' + target);
    if (panel) panel.classList.add('active');

    if (summaryPeriodWrapper) {
      summaryPeriodWrapper.style.display = target === 'dashboard' ? 'flex' : 'none';
    }

    const rootEl = document.querySelector('.root');
    if (rootEl) {
      if (target === 'correlation') {
        rootEl.classList.add('wide-mode');
      } else {
        rootEl.classList.remove('wide-mode');
      }
    }
  });
});

// Shared sample trade performance data (percentage returns)
const appTradesData = [
  10.2, 16.5, 46.0, 25.8, 3.2, -6.5, -3.8, -10.0,
  20.0, 38.2, -2.5, -18.5, 23.8, -4.2, 14.8, 12.5,
  -7.2, 15.0, -3.0, 31.5, 19.5, 10.5, -1.8, 10.8,
  -5.5, -10.2, 8.5, 15.2, 12.0, 4.0, 2.5, -2.0,
  -8.5, 18.0, -25.5, 7.5, -6.8, -4.0, 15.5, 24.2,
  -7.5, 9.8, 20.0, -3.5, 34.2, 28.5, -8.0, -5.2,
  25.0, -10.5, 12.8, 10.0, 8.5, 18.5, 22.5, -12.0,
  -3.5, -7.8, 14.2, 30.0, 24.5, -6.0, 12.0, 15.8,
  -9.5, 10.2, -4.5, 25.5, -15.2, 14.0, 11.5, 16.5,
  -3.0, 28.0, -8.2
];

// ── 15-Trade Performance Sequence Chart ──────────────
(function drawTradePerformanceChart() {
  const canvas = document.getElementById('tradePerformanceCanvas');
  if (!canvas) return;

  const displayTrades = appTradesData.slice(-75);

  const wins = displayTrades.filter(t => t > 0);
  const losses = displayTrades.filter(t => t < 0);
  const avgWin = wins.length > 0 ? wins.reduce((a, b) => a + b, 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((a, b) => a + b, 0) / losses.length) : 0;

  function render() {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;

    ctx.clearRect(0, 0, W, H);

    const marginLeft = 36;
    const marginRight = 48;
    const marginTop = 8;
    const marginBottom = 8;
    const chartW = W - marginLeft - marginRight;
    const chartH = H - marginTop - marginBottom;

    const maxVal = Math.max(Math.max(...displayTrades.map(Math.abs)), 50);
    const yRange = Math.ceil(maxVal / 10) * 10;
    const zeroY = marginTop + chartH / 2;
    const pxPerPct = (chartH / 2) / yRange;
    const isLight = document.body.classList.contains('light');

    const gridSteps = [];
    for (let v = -yRange; v <= yRange; v += 10) {
      gridSteps.push(v);
    }

    ctx.font = '9px "DM Sans", sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    gridSteps.forEach(v => {
      const y = zeroY - (v * pxPerPct);
      if (y < marginTop - 2 || y > marginTop + chartH + 2) return;

      ctx.strokeStyle = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 0.5;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(marginLeft, y);
      ctx.lineTo(marginLeft + chartW, y);
      ctx.stroke();

      ctx.fillStyle = isLight ? '#7a85a0' : '#5c6580';
      ctx.fillText(v + '%', marginLeft - 5, y);
    });

    ctx.strokeStyle = isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(marginLeft, zeroY);
    ctx.lineTo(marginLeft + chartW, zeroY);
    ctx.stroke();

    const barGap = 1.5;
    const totalBarSpace = chartW - (displayTrades.length - 1) * barGap;
    const barW = Math.max(2, totalBarSpace / displayTrades.length);

    const winColor = isLight ? '#1a2744' : '#1a2f4f';
    const winColorDark = isLight ? '#0f1a30' : '#142640';
    const lossColor = isLight ? '#e8cbb8' : '#e8cfc0';
    const lossColorDark = isLight ? '#3d2a1a' : '#4a3020';

    displayTrades.forEach((val, i) => {
      const x = marginLeft + i * (barW + barGap);
      const barH = Math.abs(val) * pxPerPct;

      if (val >= 0) {
        const y = zeroY - barH;
        const grad = ctx.createLinearGradient(x, y, x, zeroY);
        grad.addColorStop(0, winColor);
        grad.addColorStop(1, winColorDark);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, [1.5, 1.5, 0, 0]);
        ctx.fill();
      } else {
        const y = zeroY;
        const isDeep = Math.abs(val) > 15;
        const grad = ctx.createLinearGradient(x, y, x, y + barH);
        if (isDeep) {
          grad.addColorStop(0, lossColorDark);
          grad.addColorStop(1, isLight ? '#2a1a10' : '#3d2418');
        } else {
          grad.addColorStop(0, lossColor);
          grad.addColorStop(1, isLight ? '#d4b8a2' : '#d8bba8');
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, [0, 0, 1.5, 1.5]);
        ctx.fill();
      }
    });

    if (avgWin > 0) {
      const avgWinY = zeroY - (avgWin * pxPerPct);
      ctx.strokeStyle = '#00bcd4';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(marginLeft, avgWinY);
      ctx.lineTo(marginLeft + chartW, avgWinY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#00bcd4';
      ctx.font = '600 9px "DM Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(avgWin.toFixed(1) + '%', marginLeft + chartW + 4, avgWinY);
    }

    if (avgLoss > 0) {
      const avgLossY = zeroY + (avgLoss * pxPerPct);
      ctx.strokeStyle = '#e69500';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(marginLeft, avgLossY);
      ctx.lineTo(marginLeft + chartW, avgLossY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#e69500';
      ctx.font = '600 9px "DM Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(avgLoss.toFixed(1) + '%', marginLeft + chartW + 4, avgLossY);
    }
  }

  window.renderTradePerformance = render;
  render();

  const ro = new ResizeObserver(() => render());
  ro.observe(canvas);
})();

// ── Equity Curve Chart ──────────────────────────────
(function drawEquityCurveChart() {
  const canvas = document.getElementById('equityCurveCanvas');
  if (!canvas) return;

  const displayTrades = appTradesData.slice(-75);
  let currentBal = 1000;
  const equityPoints = [currentBal];
  displayTrades.forEach(pct => {
    currentBal = currentBal * (1 + pct / 100);
    equityPoints.push(currentBal);
  });

  function render() {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;

    ctx.clearRect(0, 0, W, H);

    const marginLeft = 36;
    const marginRight = 48;
    const marginTop = 12;
    const marginBottom = 12;
    const chartW = W - marginLeft - marginRight;
    const chartH = H - marginTop - marginBottom;

    const minVal = Math.min(...equityPoints);
    const maxVal = Math.max(...equityPoints);
    const valRange = maxVal - minVal;
    
    const yMin = minVal - (valRange * 0.1 || 10);
    const yMax = maxVal + (valRange * 0.1 || 10);
    const yRange = yMax - yMin;

    const isLight = document.body.classList.contains('light');

    // Grid lines
    const gridSteps = 5;
    ctx.font = '9px "DM Sans", sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < gridSteps; i++) {
      const val = yMin + (yRange * i / (gridSteps - 1));
      const y = marginTop + chartH - ((val - yMin) / yRange * chartH);

      ctx.strokeStyle = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(marginLeft, y);
      ctx.lineTo(marginLeft + chartW, y);
      ctx.stroke();

      ctx.fillStyle = isLight ? '#7a85a0' : '#5c6580';
      ctx.fillText('$' + val.toFixed(0), marginLeft - 5, y);
    }

    // Draw Line
    const pointsCount = equityPoints.length;
    const stepX = chartW / (pointsCount - 1);

    ctx.strokeStyle = isLight ? '#2d7dd2' : '#22c97a';
    ctx.lineWidth = 2;
    ctx.beginPath();

    equityPoints.forEach((val, idx) => {
      const x = marginLeft + idx * stepX;
      const y = marginTop + chartH - ((val - yMin) / yRange * chartH);
      if (idx === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Area Gradient Fill
    const areaGrad = ctx.createLinearGradient(0, marginTop, 0, marginTop + chartH);
    if (isLight) {
      areaGrad.addColorStop(0, 'rgba(45, 125, 210, 0.15)');
      areaGrad.addColorStop(1, 'rgba(45, 125, 210, 0.0)');
    } else {
      areaGrad.addColorStop(0, 'rgba(34, 201, 122, 0.15)');
      areaGrad.addColorStop(1, 'rgba(34, 201, 122, 0.0)');
    }

    ctx.fillStyle = areaGrad;
    ctx.beginPath();
    ctx.moveTo(marginLeft, marginTop + chartH);
    equityPoints.forEach((val, idx) => {
      const x = marginLeft + idx * stepX;
      const y = marginTop + chartH - ((val - yMin) / yRange * chartH);
      ctx.lineTo(x, y);
    });
    ctx.lineTo(marginLeft + chartW, marginTop + chartH);
    ctx.closePath();
    ctx.fill();

    // Final dot
    const finalVal = equityPoints[pointsCount - 1];
    const finalX = marginLeft + chartW;
    const finalY = marginTop + chartH - ((finalVal - yMin) / yRange * chartH);

    ctx.fillStyle = isLight ? '#2d7dd2' : '#22c97a';
    ctx.beginPath();
    ctx.arc(finalX, finalY, 4, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = isLight ? '#2d7dd2' : '#22c97a';
    ctx.font = '600 9px "DM Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('$' + finalVal.toFixed(2), finalX + 6, finalY);
  }

  window.renderEquityCurve = render;
  render();

  const ro = new ResizeObserver(() => render());
  ro.observe(canvas);
})();

// ── Chart Toggler ────────────────────────────────────
(function initChartToggler() {
  const toggle = document.getElementById('toggleChart');
  const title = document.getElementById('miniChartTitle');
  const label = document.getElementById('toggleChartLabel');
  const perfCanvas = document.getElementById('tradePerformanceCanvas');
  const equityCanvas = document.getElementById('equityCurveCanvas');

  if (!toggle || !perfCanvas || !equityCanvas) return;

  toggle.addEventListener('change', () => {
    if (toggle.checked) {
      perfCanvas.style.display = 'none';
      equityCanvas.style.display = 'block';
      if (title) title.textContent = 'Equity Curve (Last 75 Trades)';
      if (label) label.textContent = 'Performance';
      if (window.renderEquityCurve) {
        window.renderEquityCurve();
      }
    } else {
      perfCanvas.style.display = 'block';
      equityCanvas.style.display = 'none';
      if (title) title.textContent = '15-Trade Performance Sequence';
      if (label) label.textContent = 'Equity Curve';
      if (window.renderTradePerformance) {
        window.renderTradePerformance();
      }
    }
  });
})();


// ── Live Server Clock ─────────────────────────────────
(function startClock() {
  const el = document.getElementById('serverTime');
  if (!el) return;

  const timeSelect = document.getElementById('timeSelect');
  
  // Load saved time preference or default to 'server'
  let timePref = localStorage.getItem('account-monitor-time-pref') || 'server';
  if (timeSelect) {
    timeSelect.value = timePref;
    timeSelect.addEventListener('change', (e) => {
      timePref = e.target.value;
      localStorage.setItem('account-monitor-time-pref', timePref);
      tick();
    });
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const now = new Date();
    let displayDate = now;
    let label = 'Server';

    if (timePref === 'gmt') {
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      displayDate = new Date(utc);
      label = 'GMT';
    } else if (timePref === 'local') {
      displayDate = now;
      label = 'Local';
    } else {
      // server time (GMT+2)
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      displayDate = new Date(utc + (3600000 * 2));
      label = 'Server';
    }

    const y  = displayDate.getFullYear();
    const mo = pad(displayDate.getMonth() + 1);
    const d  = pad(displayDate.getDate());
    const h  = pad(displayDate.getHours());
    const m  = pad(displayDate.getMinutes());
    const s  = pad(displayDate.getSeconds());
    el.textContent = `${label}: ${y}.${mo}.${d} \u00a0 ${h}:${m}:${s}`;
  }

  tick();
  setInterval(tick, 1000);
})();

// ── History filter buttons (period) ───────────────────
function setPeriod(clicked) {
  const group = clicked.closest('.filter-bar');
  // Only toggle within the first group of period buttons
  const periodBtns = Array.from(group.querySelectorAll('.period-btn'))
    .slice(0, 4); // Today, This Week, This Month, All
  periodBtns.forEach(b => b.classList.remove('active'));
  clicked.classList.add('active');
}

function setFilter(clicked) {
  const group = clicked.closest('.filter-bar');
  const filterBtns = Array.from(group.querySelectorAll('.period-btn'))
    .slice(4); // All, Win, Loss
  filterBtns.forEach(b => b.classList.remove('active'));
  clicked.classList.add('active');
}

// ── Refresh stub ──────────────────────────────────────
function refreshData() {
  const btn = document.querySelector('.icon-btn');
  if (btn) {
    btn.style.transform = 'rotate(360deg)';
    btn.style.transition = 'transform 0.4s ease';
    setTimeout(() => { btn.style.transform = ''; btn.style.transition = ''; }, 450);
  }
  // In a real EA integration, you'd fetch new data here.
  console.log('[MT5 Monitor] Refresh triggered at', new Date().toLocaleTimeString());
}

// ── Export CSV stub ───────────────────────────────────
function exportCSV() {
  console.log('[MT5 Monitor] Export CSV triggered at', new Date().toLocaleTimeString());
  alert('Exporting account data to CSV...');
}

// ── Theme Switcher ────────────────────────────────────
(function initTheme() {
  const themeSelect = document.getElementById('themeSelect');
  if (!themeSelect) return;

  // Apply theme class based on value
  function applyTheme(theme) {
    if (theme === 'light') {
      document.body.classList.add('light');
    } else if (theme === 'dark') {
      document.body.classList.remove('light');
    } else if (theme === 'system') {
      const isSystemLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      if (isSystemLight) {
        document.body.classList.add('light');
      } else {
        document.body.classList.remove('light');
      }
    }
  }

  // Load saved theme
  const savedTheme = localStorage.getItem('account-monitor-theme') || 'dark';
  themeSelect.value = savedTheme;
  applyTheme(savedTheme);

  // Listen to select changes
  themeSelect.addEventListener('change', (e) => {
    const selected = e.target.value;
    localStorage.setItem('account-monitor-theme', selected);
    applyTheme(selected);
  });

  // Listen to system changes if in system mode
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
    if (themeSelect.value === 'system') {
      applyTheme('system');
    }
  });
})();

// ── News Tab Interactive Filter Buttons ─────────────────
(function initNewsFilters() {
  const fBtns = document.querySelectorAll('.filter-bar .f-btn');
  const curBtns = document.querySelectorAll('.cur-row .cur-btn');

  // Identify impact buttons in the right margin-left:auto div container
  const impactContainer = document.querySelector('.filter-bar div[style*="margin-left:auto"]');
  const impactBtns = impactContainer ? impactContainer.querySelectorAll('.f-btn') : [];
  const noneBtn = Array.from(impactBtns).find(b => b.textContent.trim() === 'None');
  const levelBtns = Array.from(impactBtns).filter(b => b !== noneBtn);

  // Set default active state for None impact button
  if (noneBtn && !levelBtns.some(b => b.classList.contains('active'))) {
    noneBtn.classList.add('active');
  }

  fBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Check if it belongs to the impact group
      if (impactBtns && Array.from(impactBtns).includes(btn)) {
        if (btn === noneBtn) {
          // If "None" is clicked, activate it and deactivate Low, Medium, High
          noneBtn.classList.add('active');
          levelBtns.forEach(b => b.classList.remove('active'));
        } else {
          // If a level button is clicked, toggle it and deactivate "None"
          btn.classList.toggle('active');
          noneBtn.classList.remove('active');
          
          // If all level buttons are unchecked, reactivate "None"
          const anyActive = levelBtns.some(b => b.classList.contains('active'));
          if (!anyActive) {
            noneBtn.classList.add('active');
          }
        }
      } else {
        // Standard toggle for ON Currency, ON Impact, ON Time
        btn.classList.toggle('active');
      }
    });
  });

  curBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
    });
  });
})();

// ── Summary Period Cycling ────────────────────────────
(function initSummaryPeriodCycle() {
  const btn = document.getElementById('summaryPeriodBtn');
  if (!btn) return;

  const periods = ['Today', 'Weekly', 'Monthly', 'All Time'];
  
  btn.addEventListener('click', () => {
    const currentText = btn.textContent.trim();
    let currentIndex = periods.indexOf(currentText);
    if (currentIndex === -1) currentIndex = 0;
    
    const nextIndex = (currentIndex + 1) % periods.length;
    btn.textContent = periods[nextIndex];
  });
})();

// Helper function to get account value based on type
function getAccountValue(type) {
  // Parse values from UI - remove $ and commas
  const parseVal = (str) => parseFloat(str.replace(/[$,]/g, '')) || 0;
  
  const balance = parseVal(document.getElementById('rmBalance')?.textContent || '0');
  const equity = parseVal(document.getElementById('rmEquity')?.textContent || '0');
  const cpr = parseVal(document.getElementById('rmCPR')?.textContent || '0');
  
  switch(type) {
    case 'equity': return equity;
    case 'cpr': return cpr;
    case 'balance': 
    default: return balance;
  }
}

// ── Instrument configs ──────────────────────────────
// pipSize:     price units per pip (e.g. 0.0001 for Forex)
// pipValue:    USD profit/loss per pip per 1 standard lot
// priceStep:   HTML input step attribute for price fields
// defaultPrices: [entry, sl, tp] sensible defaults per instrument
const instrumentConfig = {
  forex:   { pipSize: 0.0001, pipValue: 10, priceStep: '0.00001', defaultPrices: [1.10000, 1.09900, 1.10200] },
  jpy:     { pipSize: 0.01,   pipValue: 7,  priceStep: '0.001',   defaultPrices: [155.000, 154.500, 155.800] },
  gold:    { pipSize: 0.01,   pipValue: 1,  priceStep: '0.01',    defaultPrices: [3320.00, 3300.00, 3360.00] },
  silver:  { pipSize: 0.001,  pipValue: 50, priceStep: '0.001',   defaultPrices: [33.000, 32.500, 33.800] },
  bitcoin: { pipSize: 1.0,    pipValue: 1,  priceStep: '1',       defaultPrices: [105000, 104000, 107000] },
  indices: { pipSize: 1.0,    pipValue: 1,  priceStep: '0.1',     defaultPrices: [42500, 42000, 43200] },
  oil:     { pipSize: 0.01,   pipValue: 10, priceStep: '0.01',    defaultPrices: [78.00, 77.00, 80.00] }
};

// Apply instrument defaults (price step + sensible entry/SL/TP) on dropdown change
function applyInstrumentDefaults(key) {
  const cfg = instrumentConfig[key];
  if (!cfg) return;
  const entry = document.getElementById('calcEntryPrice');
  const sl = document.getElementById('calcSLPrice');
  const tp = document.getElementById('calcTPPrice');
  [entry, sl, tp].forEach((el, i) => {
    if (el) {
      el.step = cfg.priceStep;
      el.value = cfg.defaultPrices[i];
    }
  });
}

// ── Risk Tab: Position Size Calculator ──────────────
function updateCalc() {
  const accountType = getToggleValue('calcAccountType') || 'balance';
  const accountValueInput = parseFloat(document.getElementById('calcAccountValue')?.value) || 0;
  const riskType = getToggleValue('calcRiskType') || 'percent';
  const riskAmtInput = parseFloat(document.getElementById('calcRiskAmt')?.value) || 0;
  const lotSize = parseFloat(document.getElementById('calcLotSize')?.value) || 0.01;
  const commissionType = getToggleValue('calcCommissionType') || 'dollar';
  const commissionInput = parseFloat(document.getElementById('calcCommission')?.value) || 0;

  const instrKey = document.getElementById('calcInstrument')?.value || 'forex';
  const cfg = instrumentConfig[instrKey] || instrumentConfig.forex;

  const entryPrice = parseFloat(document.getElementById('calcEntryPrice')?.value) || 0;
  const slPrice = parseFloat(document.getElementById('calcSLPrice')?.value) || 0;
  const tpPrice = parseFloat(document.getElementById('calcTPPrice')?.value) || 0;

  // Derive pip distances from actual price differences
  const slPips = (entryPrice > 0 && slPrice > 0) ? Math.abs(entryPrice - slPrice) / cfg.pipSize : 0;
  const tpPips = (entryPrice > 0 && tpPrice > 0) ? Math.abs(entryPrice - tpPrice) / cfg.pipSize : 0;

  // Update pip-distance hints below the price inputs
  const slHint = document.getElementById('slPipsHint');
  const tpHint = document.getElementById('tpPipsHint');
  if (slHint) {
    slHint.textContent = slPips > 0 ? `= ${slPips.toFixed(1)} pips` : '—';
    slHint.className = 'pip-hint' + (slPips === 0 ? ' warn' : '');
  }
  if (tpHint) {
    tpHint.textContent = tpPips > 0 ? `= ${tpPips.toFixed(1)} pips` : '—';
    tpHint.className = 'pip-hint' + (tpPips === 0 ? ' warn' : '');
  }

  // Get actual account value from metrics if available, else use input
  let accountValue = getAccountValue(accountType);
  if (accountValue <= 0) {
    accountValue = accountValueInput;
  } else {
    // Sync the input field with the metric value
    const inputEl = document.getElementById('calcAccountValue');
    if (inputEl && parseFloat(inputEl.value) !== accountValue) {
      inputEl.value = accountValue.toFixed(2);
    }
  }

  const pipValPerLot = cfg.pipValue;  // USD per pip per standard lot

  // Calculate risk amount based on lot size and stop loss
  let actualRiskAmt = lotSize * slPips * pipValPerLot;
  const grossProfit = lotSize * tpPips * pipValPerLot;

  // Calculate commission
  let actualCommission;
  if (commissionType === 'dollar') {
    actualCommission = commissionInput;
  } else {
    // Percentage of profit (or of position value - let's do profit for simplicity)
    actualCommission = (grossProfit * commissionInput) / 100;
  }

  const netProfit = grossProfit - actualCommission;
  const rr = slPips > 0 ? (tpPips / slPips) : 0;
  const actualRiskPct = accountValue > 0 ? (actualRiskAmt / accountValue) * 100 : 0;

  // Max Position Size = risk budget ÷ (sl pips × pip value per lot)
  const riskBudget = riskType === 'percent' ? (accountValue * riskAmtInput) / 100 : riskAmtInput;
  const riskPerLot = slPips * pipValPerLot;
  let maxPS = (riskPerLot > 0 && isFinite(riskPerLot)) ? riskBudget / riskPerLot : 0;
  if (!isFinite(maxPS) || isNaN(maxPS)) maxPS = 0;
  const maxPsEl = document.getElementById('calcMaxPS');
  if (maxPsEl) maxPsEl.value = maxPS.toFixed(2);

  // Update result cards
  const riskEl   = document.getElementById('crRiskAmt');
  const rrEl     = document.getElementById('crRR');
  const profitEl = document.getElementById('crProfit');
  const riskPctEl = document.getElementById('crRiskPct');
  const noteEl   = document.getElementById('calcNote');

  if (riskEl)   riskEl.textContent   = '$' + actualRiskAmt.toFixed(2);
  if (rrEl)     rrEl.textContent     = '1 : ' + rr.toFixed(1);
  if (profitEl) profitEl.textContent = '$' + netProfit.toFixed(2);
  if (riskPctEl) riskPctEl.textContent = actualRiskPct.toFixed(1) + '%';

  // Update note
  if (noteEl) {
    noteEl.className = 'calc-note';
    const accountTypeLabel = accountType.charAt(0).toUpperCase() + accountType.slice(1);
    if (actualRiskPct <= 2) {
      noteEl.textContent = `✅ Risk is within safe limits (${actualRiskPct.toFixed(1)}% of ${accountTypeLabel})`;
    } else if (actualRiskPct <= 5) {
      noteEl.className = 'calc-note note-warn';
      noteEl.textContent = `⚠️ Moderate risk level (${actualRiskPct.toFixed(1)}% of ${accountTypeLabel}) — trade carefully`;
    } else {
      noteEl.className = 'calc-note note-danger';
      noteEl.textContent = `🚨 High risk! (${actualRiskPct.toFixed(1)}% of ${accountTypeLabel}) — consider reducing lot size`;
    }

    if (maxPS > 0 && lotSize > maxPS) {
      noteEl.className = 'calc-note note-danger';
      noteEl.textContent += ` | ⚠️ Exceeds Max PS (${lotSize.toFixed(2)} > ${maxPS.toFixed(2)} Lots)`;
    }
  }

  const lotSizeInput = document.getElementById('calcLotSize');
  if (lotSizeInput) {
    if (maxPS > 0 && lotSize > maxPS) {
      lotSizeInput.style.borderColor = 'var(--red)';
      lotSizeInput.style.color = 'var(--red)';
    } else {
      lotSizeInput.style.borderColor = '';
      lotSizeInput.style.color = '';
    }
  }
  
  // Update portfolio comparison
  const currRiskUsdEl = document.getElementById('currRiskUsd');
  const currRiskPctEl = document.getElementById('currRiskPct');
  const currRREl = document.getElementById('currRR');
  const potRiskUsdEl = document.getElementById('potRiskUsd');
  const potRiskPctEl = document.getElementById('potRiskPct');
  const potRREl = document.getElementById('potRR');
  
  // Current portfolio values from exposure table
  const currRiskUsd = 4.00;
  const currRiskPct = 0.38;
  const currRR = 3.5;
  
  // Calculate potential portfolio
  const potRiskUsd = currRiskUsd + actualRiskAmt;
  const potRiskPct = currRiskPct + actualRiskPct;
  const potRR = 2.2;
  
  if (currRiskUsdEl) currRiskUsdEl.textContent = '$' + currRiskUsd.toFixed(2);
  if (currRiskPctEl) currRiskPctEl.textContent = currRiskPct.toFixed(2) + '%';
  if (currRREl) currRREl.textContent = '1 : ' + currRR.toFixed(1);
  if (potRiskUsdEl) potRiskUsdEl.textContent = '$' + potRiskUsd.toFixed(2);
  if (potRiskPctEl) potRiskPctEl.textContent = potRiskPct.toFixed(2) + '%';
  if (potRREl) potRREl.textContent = '1 : ' + potRR.toFixed(1);
}

function setRisk(val) {
  const input = document.getElementById('calcRiskAmt');
  if (input) { input.value = val; }
  // Update preset button highlight
  document.querySelectorAll('.rp-btn').forEach(btn => {
    btn.classList.toggle('rp-active', parseFloat(btn.textContent) === val);
  });
  updateCalc();
}

// Options for each toggle
const toggleOptions = {
  'calcAccountType': [
    { value: 'balance', label: 'Balance' },
    { value: 'equity', label: 'Equity' },
    { value: 'cpr', label: 'CPR' }
  ],
  'calcRiskType': [
    { value: 'percent', label: '%' },
    { value: 'dollar', label: '$' }
  ],
  'calcCommissionType': [
    { value: 'dollar', label: '$' },
    { value: 'percent', label: '%' }
  ]
};

// Helper to get current value from single toggle button
function getToggleValue(btnId) {
  const btn = document.getElementById(btnId);
  if (!btn) return '';
  const index = parseInt(btn.dataset.index || '0');
  const options = toggleOptions[btnId];
  return options ? options[index].value : '';
}

// Helper to setup single cycling button
function setupSingleToggleButton(btnId) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  
  const options = toggleOptions[btnId];
  
  btn.addEventListener('click', () => {
    let index = parseInt(btn.dataset.index || '0');
    index = (index + 1) % options.length;
    btn.dataset.index = index;
    btn.textContent = options[index].label;
    updateCalc();
  });
}

// Wire up all calculator inputs
(function initRiskCalc() {
  // Setup single toggle buttons
  setupSingleToggleButton('calcAccountType');
  setupSingleToggleButton('calcRiskType');
  setupSingleToggleButton('calcCommissionType');
  
  // Instrument dropdown — swap price defaults/step then recalculate
  const instrEl = document.getElementById('calcInstrument');
  if (instrEl) {
    instrEl.addEventListener('change', () => {
      applyInstrumentDefaults(instrEl.value);
      updateCalc();
    });
  }

  // Setup regular inputs
  const ids = ['calcAccountValue','calcRiskAmt','calcEntryPrice','calcSLPrice','calcTPPrice','calcCommission','calcLotSize'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateCalc);
    }
  });
  updateCalc(); // initial render
})();

// ── Exposure Table Filters ──────────────────────────
(function setupExposureFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const rows = document.querySelectorAll('.exposure-table tbody tr');
  
  if (!filterButtons.length || !rows.length) return;
  
  let currentFilter = 'all';
  let currentDirection = 'all';
  
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Handle status filter
      if (btn.dataset.filter) {
        currentFilter = btn.dataset.filter;
        // Update active state for status buttons
        document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
      
      // Handle direction filter
      if (btn.dataset.direction) {
        currentDirection = btn.dataset.direction;
        // Update active state for direction buttons
        document.querySelectorAll('[data-direction]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
      
      // Filter rows
      filterRows();
    });
  });
  
  function filterRows() {
    rows.forEach(row => {
      // Get row status
      const badge = row.querySelector('.expo-badge');
      const isProtected = badge && badge.textContent === 'Protected';
      const isUnprotected = badge && badge.textContent !== 'Protected';
      
      // Get row direction
      const typeCell = row.querySelector('.type-buy, .type-sell');
      const isBuy = typeCell && typeCell.classList.contains('type-buy');
      const isSell = typeCell && typeCell.classList.contains('type-sell');
      
      // Apply filters
      let statusMatch = true;
      if (currentFilter === 'protected') statusMatch = isProtected;
      if (currentFilter === 'unprotected') statusMatch = isUnprotected;
      
      let directionMatch = true;
      if (currentDirection === 'buy') directionMatch = isBuy;
      if (currentDirection === 'sell') directionMatch = isSell;
      
      // Show/hide row
      if (statusMatch && directionMatch) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }
})();

(function setupExposureToggle() {
  const toggle = document.getElementById('toggleExposure');
  const body = document.getElementById('exposureBody');
  if (toggle && body) {
    toggle.addEventListener('change', () => {
      body.style.display = toggle.checked ? '' : 'none';
      const header = document.querySelector('.exposure-header');
      if (header) {
        header.style.marginBottom = toggle.checked ? '12px' : '0';
      }
    });
  }
})();

// ── Signals Tab Redesign Logic ────────────────────────
const signalsData = {
  'M1': {
    summary: {
      direction: 'STRONG BUY',
      class: 'buy',
      gaugeValue: 15,
      oscillators: { buy: 3, neutral: 6, sell: 0, summary: 'BUY' },
      movingAverages: { buy: 12, neutral: 0, sell: 0, summary: 'STRONG BUY' }
    },
    oscillators: [
      { name: 'RSI (14)', value: '68.45', action: 'BUY', class: 'buy' },
      { name: 'Stochastic %K (9,6)', value: '82.10', action: 'NEUTRAL', class: 'neutral' },
      { name: 'CCI (14)', value: '142.30', action: 'BUY', class: 'buy' },
      { name: 'ADX (14)', value: '32.15', action: 'BUY', class: 'buy' },
      { name: 'MACD (12,26)', value: '1.24', action: 'BUY', class: 'buy' },
      { name: 'Awesome Osc.', value: '0.85', action: 'BUY', class: 'buy' }
    ],
    movingAverages: [
      { period: '10', emaVal: '2324.50', emaAct: 'BUY', emaClass: 'buy', smaVal: '2323.80', smaAct: 'BUY', smaClass: 'buy' },
      { period: '20', emaVal: '2322.10', emaAct: 'BUY', emaClass: 'buy', smaVal: '2321.40', smaAct: 'BUY', smaClass: 'buy' },
      { period: '50', emaVal: '2318.90', emaAct: 'BUY', emaClass: 'buy', smaVal: '2319.20', emaAct: 'BUY', emaClass: 'buy' },
      { period: '100', emaVal: '2314.50', emaAct: 'BUY', emaClass: 'buy', smaVal: '2315.00', emaAct: 'BUY', emaClass: 'buy' },
      { period: '200', emaVal: '2305.20', emaAct: 'BUY', emaClass: 'buy', smaVal: '2307.10', emaAct: 'BUY', emaClass: 'buy' }
    ]
  },
  'M5': {
    summary: {
      direction: 'BUY',
      class: 'buy',
      gaugeValue: 32,
      oscillators: { buy: 2, neutral: 7, sell: 0, summary: 'BUY' },
      movingAverages: { buy: 9, neutral: 1, sell: 2, summary: 'BUY' }
    },
    oscillators: [
      { name: 'RSI (14)', value: '59.20', action: 'NEUTRAL', class: 'neutral' },
      { name: 'Stochastic %K (9,6)', value: '64.50', action: 'NEUTRAL', class: 'neutral' },
      { name: 'CCI (14)', value: '88.10', action: 'BUY', class: 'buy' },
      { name: 'ADX (14)', value: '27.40', action: 'NEUTRAL', class: 'neutral' },
      { name: 'MACD (12,26)', value: '0.54', action: 'BUY', class: 'buy' },
      { name: 'Awesome Osc.', value: '0.32', action: 'NEUTRAL', class: 'neutral' }
    ],
    movingAverages: [
      { period: '10', emaVal: '2322.80', emaAct: 'BUY', emaClass: 'buy', smaVal: '2322.95', smaAct: 'BUY', smaClass: 'buy' },
      { period: '20', emaVal: '2321.15', emaAct: 'BUY', emaClass: 'buy', smaVal: '2321.50', emaAct: 'BUY', emaClass: 'buy' },
      { period: '50', emaVal: '2319.40', emaAct: 'BUY', emaClass: 'buy', smaVal: '2320.10', emaAct: 'BUY', emaClass: 'buy' },
      { period: '100', emaVal: '2316.80', emaAct: 'BUY', emaClass: 'buy', smaVal: '2318.00', emaAct: 'BUY', emaClass: 'buy' },
      { period: '200', emaVal: '2312.10', emaAct: 'SELL', emaClass: 'sell', smaVal: '2311.50', smaAct: 'SELL', smaClass: 'sell' }
    ]
  },
  'M15': {
    summary: {
      direction: 'NEUTRAL',
      class: 'neutral',
      gaugeValue: 50,
      oscillators: { buy: 1, neutral: 7, sell: 1, summary: 'NEUTRAL' },
      movingAverages: { buy: 6, neutral: 1, sell: 5, summary: 'NEUTRAL' }
    },
    oscillators: [
      { name: 'RSI (14)', value: '48.90', action: 'NEUTRAL', class: 'neutral' },
      { name: 'Stochastic %K (9,6)', value: '45.10', action: 'NEUTRAL', class: 'neutral' },
      { name: 'CCI (14)', value: '-12.40', action: 'NEUTRAL', class: 'neutral' },
      { name: 'ADX (14)', value: '18.90', action: 'NEUTRAL', class: 'neutral' },
      { name: 'MACD (12,26)', value: '-0.12', action: 'SELL', class: 'sell' },
      { name: 'Awesome Osc.', value: '0.05', action: 'BUY', class: 'buy' }
    ],
    movingAverages: [
      { period: '10', emaVal: '2320.15', emaAct: 'SELL', emaClass: 'sell', smaVal: '2320.40', smaAct: 'SELL', smaClass: 'sell' },
      { period: '20', emaVal: '2320.80', emaAct: 'BUY', emaClass: 'buy', smaVal: '2321.10', emaAct: 'BUY', emaClass: 'buy' },
      { period: '50', emaVal: '2319.60', emaAct: 'BUY', emaClass: 'buy', smaVal: '2319.90', emaAct: 'BUY', emaClass: 'buy' },
      { period: '100', emaVal: '2318.10', emaAct: 'SELL', emaClass: 'sell', smaVal: '2318.50', smaAct: 'SELL', smaClass: 'sell' },
      { period: '200', emaVal: '2315.40', emaAct: 'BUY', emaClass: 'buy', smaVal: '2314.90', emaAct: 'SELL', smaClass: 'sell' }
    ]
  },
  'H1': {
    summary: {
      direction: 'DISTRIBUTE (SELL)',
      class: 'sell',
      gaugeValue: 72,
      oscillators: { buy: 0, neutral: 6, sell: 3, summary: 'SELL' },
      movingAverages: { buy: 1, neutral: 1, sell: 10, summary: 'SELL' }
    },
    oscillators: [
      { name: 'RSI (14)', value: '37.70', action: 'NEUTRAL', class: 'neutral' },
      { name: 'Stochastic %K (9,6)', value: '28.40', action: 'NEUTRAL', class: 'neutral' },
      { name: 'CCI (14)', value: '-118.40', action: 'SELL', class: 'sell' },
      { name: 'ADX (14)', value: '25.30', action: 'NEUTRAL', class: 'neutral' },
      { name: 'MACD (12,26)', value: '-1.45', action: 'SELL', class: 'sell' },
      { name: 'Awesome Osc.', value: '-1.89', action: 'SELL', class: 'sell' }
    ],
    movingAverages: [
      { period: '10', emaVal: '2316.50', emaAct: 'SELL', emaClass: 'sell', smaVal: '2317.20', smaAct: 'SELL', smaClass: 'sell' },
      { period: '20', emaVal: '2319.10', emaAct: 'SELL', emaClass: 'sell', smaVal: '2320.50', emaAct: 'SELL', smaClass: 'sell' },
      { period: '50', emaVal: '2324.80', emaAct: 'SELL', emaClass: 'sell', smaVal: '2326.10', emaAct: 'SELL', smaClass: 'sell' },
      { period: '100', emaVal: '2329.40', emaAct: 'SELL', emaClass: 'sell', smaVal: '2331.00', emaAct: 'SELL', smaClass: 'sell' },
      { period: '200', emaVal: '2335.20', emaAct: 'BUY', emaClass: 'buy', smaVal: '2336.80', emaAct: 'SELL', smaClass: 'sell' }
    ]
  },
  'H4': {
    summary: {
      direction: 'STRONG SELL',
      class: 'sell',
      gaugeValue: 88,
      oscillators: { buy: 0, neutral: 4, sell: 5, summary: 'STRONG SELL' },
      movingAverages: { buy: 0, neutral: 0, sell: 12, summary: 'STRONG SELL' }
    },
    oscillators: [
      { name: 'RSI (14)', value: '28.10', action: 'SELL', class: 'sell' },
      { name: 'Stochastic %K (9,6)', value: '14.20', action: 'SELL', class: 'sell' },
      { name: 'CCI (14)', value: '-185.00', action: 'SELL', class: 'sell' },
      { name: 'ADX (14)', value: '38.90', action: 'NEUTRAL', class: 'neutral' },
      { name: 'MACD (12,26)', value: '-3.84', action: 'SELL', class: 'sell' },
      { name: 'Awesome Osc.', value: '-4.15', action: 'SELL', class: 'sell' }
    ],
    movingAverages: [
      { period: '10', emaVal: '2312.40', emaAct: 'SELL', emaClass: 'sell', smaVal: '2314.10', smaAct: 'SELL', smaClass: 'sell' },
      { period: '20', emaVal: '2318.90', emaAct: 'SELL', emaClass: 'sell', smaVal: '2321.20', emaAct: 'SELL', smaClass: 'sell' },
      { period: '50', emaVal: '2328.50', emaAct: 'SELL', emaClass: 'sell', smaVal: '2330.40', emaAct: 'SELL', smaClass: 'sell' },
      { period: '100', emaVal: '2336.10', emaAct: 'SELL', emaClass: 'sell', smaVal: '2338.00', emaAct: 'SELL', smaClass: 'sell' },
      { period: '200', emaVal: '2345.80', emaAct: 'SELL', emaClass: 'sell', smaVal: '2347.90', emaAct: 'SELL', smaClass: 'sell' }
    ]
  },
  'D1': {
    summary: {
      direction: 'STRONG SELL',
      class: 'sell',
      gaugeValue: 95,
      oscillators: { buy: 0, neutral: 3, sell: 6, summary: 'STRONG SELL' },
      movingAverages: { buy: 0, neutral: 0, sell: 12, summary: 'STRONG SELL' }
    },
    oscillators: [
      { name: 'RSI (14)', value: '22.40', action: 'SELL', class: 'sell' },
      { name: 'Stochastic %K (9,6)', value: '8.10', action: 'SELL', class: 'sell' },
      { name: 'CCI (14)', value: '-224.50', action: 'SELL', class: 'sell' },
      { name: 'ADX (14)', value: '44.20', action: 'NEUTRAL', class: 'neutral' },
      { name: 'MACD (12,26)', value: '-8.12', action: 'SELL', class: 'sell' },
      { name: 'Awesome Osc.', value: '-9.50', action: 'SELL', class: 'sell' }
    ],
    movingAverages: [
      { period: '10', emaVal: '2308.20', emaAct: 'SELL', emaClass: 'sell', smaVal: '2310.50', smaAct: 'SELL', smaClass: 'sell' },
      { period: '20', emaVal: '2320.40', emaAct: 'SELL', emaClass: 'sell', smaVal: '2324.00', emaAct: 'SELL', smaClass: 'sell' },
      { period: '50', emaVal: '2338.90', emaAct: 'SELL', emaClass: 'sell', smaVal: '2341.20', emaAct: 'SELL', smaClass: 'sell' },
      { period: '100', emaVal: '2355.00', emaAct: 'SELL', emaClass: 'sell', smaVal: '2358.50', emaAct: 'SELL', smaClass: 'sell' },
      { period: '200', emaVal: '2372.10', emaAct: 'SELL', emaClass: 'sell', smaVal: '2374.90', emaAct: 'SELL', smaClass: 'sell' }
    ]
  }
};

(function initSignalsDashboard() {
  return; // SUPERSEDED by signals.js (4-category redesign). Old logic below is dead; safe to delete.
  const tfButtons = document.querySelectorAll('#tab-signals .tf-btn');
  if (!tfButtons.length) return;

  function updateSignalsUI(tf) {
    const data = signalsData[tf];
    if (!data) return;

    // 1. Update timeframe buttons active class
    tfButtons.forEach(btn => {
      btn.classList.toggle('active', btn.textContent.trim() === tf);
    });

    // 2. Update Composite summary
    const compDir = document.querySelector('#tab-signals .comp-direction');
    const compNeedle = document.querySelector('#tab-signals .gauge-needle');
    const oscBuy = document.querySelector('#tab-signals #osc-buy');
    const oscNeut = document.querySelector('#tab-signals #osc-neut');
    const oscSell = document.querySelector('#tab-signals #osc-sell');
    const oscSummary = document.querySelector('#tab-signals #osc-summary');
    const maBuy = document.querySelector('#tab-signals #ma-buy');
    const maNeut = document.querySelector('#tab-signals #ma-neut');
    const maSell = document.querySelector('#tab-signals #ma-sell');
    const maSummary = document.querySelector('#tab-signals #ma-summary');

    if (compDir) {
      compDir.textContent = data.summary.direction;
      compDir.className = `comp-direction text-${data.summary.class}`;
    }

    if (compNeedle) {
      // Gauge ranges from -90deg (Strong Buy) to 90deg (Strong Sell)
      // gaugeValue: 0 = Strong Buy (-90deg), 50 = Neutral (0deg), 100 = Strong Sell (90deg)
      const deg = -90 + (data.summary.gaugeValue / 100) * 180;
      compNeedle.style.transform = `translateX(-50%) rotate(${deg}deg)`;
    }

    if (oscBuy) oscBuy.textContent = data.summary.oscillators.buy;
    if (oscNeut) oscNeut.textContent = data.summary.oscillators.neutral;
    if (oscSell) oscSell.textContent = data.summary.oscillators.sell;
    if (oscSummary) {
      oscSummary.textContent = data.summary.oscillators.summary;
      oscSummary.className = `summary-badge badge-${data.summary.oscillators.summary.toLowerCase().replace(' ', '-')}`;
    }

    if (maBuy) maBuy.textContent = data.summary.movingAverages.buy;
    if (maNeut) maNeut.textContent = data.summary.movingAverages.neutral;
    if (maSell) maSell.textContent = data.summary.movingAverages.sell;
    if (maSummary) {
      maSummary.textContent = data.summary.movingAverages.summary;
      maSummary.className = `summary-badge badge-${data.summary.movingAverages.summary.toLowerCase().replace(' ', '-')}`;
    }

    // 3. Update Oscillators list/table
    const oscTbody = document.querySelector('#tab-signals .osc-table tbody');
    if (oscTbody) {
      oscTbody.innerHTML = '';
      data.oscillators.forEach(osc => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="ind-cell-name">${osc.name}</td>
          <td class="ind-cell-val">${osc.value}</td>
          <td><span class="action-tag tag-${osc.class}">${osc.action}</span></td>
        `;
        oscTbody.appendChild(tr);
      });
    }

    // 4. Update Moving Averages list/table
    const maTbody = document.querySelector('#tab-signals .ma-table tbody');
    if (maTbody) {
      maTbody.innerHTML = '';
      data.movingAverages.forEach(ma => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="ind-cell-period">${ma.period}</td>
          <td class="ind-cell-val">${ma.emaVal} <span class="action-tag tag-sm tag-${ma.emaClass}">${ma.emaAct}</span></td>
          <td class="ind-cell-val">${ma.smaVal} <span class="action-tag tag-sm tag-${ma.smaClass}">${ma.smaAct}</span></td>
        `;
        maTbody.appendChild(tr);
      });
    }

    // 5. Update active-row in Multi-Timeframe Matrix
    const matrixRows = document.querySelectorAll('#tab-signals .matrix-table tbody tr');
    matrixRows.forEach(row => {
      row.classList.toggle('active-row', row.dataset.tf === tf);
    });
  }

  // Bind click handlers to timeframe buttons
  tfButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tf = btn.textContent.trim();
      updateSignalsUI(tf);
    });
  });

  // Initial render (H1 is the default active timeframe)
  updateSignalsUI('H1');
})();

// =====================================================
//  Performance Tab
// =====================================================
(function setupPerformanceTab() {
  // ── Data ──
  const PF_TRADES = {
    '2026-06-01': { pnl: 145.50, count: 3 }, '2026-06-02': { pnl: -82.30, count: 2 },
    '2026-06-03': { pnl: 210.00, count: 4 }, '2026-06-04': { pnl: -55.00, count: 1 },
    '2026-06-05': { pnl: 320.75, count: 5 }, '2026-06-09': { pnl: 95.00, count: 2 },
    '2026-06-10': { pnl: -175.50, count: 3 }, '2026-06-11': { pnl: 88.25, count: 2 },
    '2026-06-12': { pnl: 415.00, count: 6 }
  };
  const PF_DAY_DATA = { Mon: 320.50, Tue: -95.20, Wed: 188.75, Thu: -42.00, Fri: 510.30, Sat: 0, Sun: 0 };
  const PF_EQUITY = [10000, 10145, 10063, 10273, 10218, 10538, 10447, 10633, 10558, 10973, 11061];
  const PF_START_BAL = PF_EQUITY[0]; // baseline for calendar P&L %
  // Trading sessions (server time). Hours [start, end)
  const PF_SESSIONS = [
    { name: 'Asian', start: 0, end: 8 },
    { name: 'London', start: 8, end: 16 },
    { name: 'New York', start: 16, end: 24 }
  ];
  // Hours where trades realistically land (skews to London/NY); used to scatter a day's trades.
  const PF_ACTIVE_HOURS = [1, 2, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 21];

  // Derive a per-hour heatmap (24 slots of {pnl,count,wins}) for one date from that
  // day's total P&L + trade count in PF_TRADES. Deterministic, so navigating back and
  // forth always shows the same breakdown. Per-hour P&L sums exactly to the day total.
  function pfHourlyForDate(ds) {
    const arr = Array.from({ length: 24 }, () => ({ pnl: 0, count: 0, wins: 0 }));
    const tr = PF_TRADES[ds];
    if (!tr || tr.count <= 0) return arr;
    let seed = 0;
    for (let i = 0; i < ds.length; i++) seed = (seed * 31 + ds.charCodeAt(i)) >>> 0;
    const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };

    const daySign = tr.pnl >= 0 ? 1 : -1;
    // Winners lean the day's direction so the signed total lands on the right side.
    const winCount = Math.max(1, Math.min(tr.count, Math.round(tr.count * (daySign > 0 ? 0.62 : 0.38))));
    const trades = [];
    for (let i = 0; i < tr.count; i++) {
      const hr = PF_ACTIVE_HOURS[Math.floor(rnd() * PF_ACTIVE_HOURS.length)];
      const win = i < winCount;
      trades.push({ hr, raw: (0.3 + rnd()) * (win ? 1 : -1), win });
    }
    let sum = trades.reduce((s, t) => s + t.raw, 0);
    if (Math.sign(sum) !== daySign || sum === 0) sum = daySign * (Math.abs(sum) || 1); // keep scale factor positive
    const scale = tr.pnl / sum;
    trades.forEach(t => {
      const v = t.raw * scale;
      arr[t.hr].pnl += v;
      arr[t.hr].count += 1;
      if (v >= 0) arr[t.hr].wins += 1;
    });
    return arr;
  }
  // Journal entries. notes = {pre, post, emotions, lessons}; entry is journaled when any note is filled.
  const PF_JOURNAL = [
    { id: 1, sym: 'XAUUSD', dir: 'Long', entry: 5292.05, size: 2, pnl: +864.00, date: 'Mar 3, 2026, 14:29', isNew: true,
      notes: { pre: 'Bullish breakout above 5285 resistance with strong volume. Risk capped at 5275 swing low.', post: 'Entry was clean, scaled out near 5300. Could have held longer for the full move.', emotions: 'Calm and patient, waited for confirmation.', lessons: 'Trust the breakout when volume confirms.' } },
    { id: 2, sym: 'XAUUSD', dir: 'Long', entry: 5303.78, size: 2, pnl: -1672.00, date: 'Mar 3, 2026, 14:22', isNew: true,
      notes: { pre: '', post: '', emotions: '', lessons: '' } },
    { id: 3, sym: 'XAUUSD', dir: 'Long', entry: 5384.08, size: 3, pnl: +5550.00, date: 'Feb 27, 2026, 16:17', isNew: true,
      notes: { pre: '', post: '', emotions: '', lessons: '' } },
    { id: 4, sym: 'GBPJPY', dir: 'Short', entry: 20.66, size: 1, pnl: -3712.43, date: 'Feb 27, 2026, 13:51', isNew: true,
      notes: { pre: '', post: '', emotions: '', lessons: '' } },
    { id: 5, sym: 'EURUSD', dir: 'Long', entry: 1.08550, size: 1, pnl: +320.00, date: 'Feb 26, 2026, 09:30', isNew: false,
      notes: { pre: 'Pullback to 1.0850 support in an uptrend.', post: 'Took profit at first target. Solid execution.', emotions: 'Confident.', lessons: 'Buying dips in trend works.' } },
    { id: 6, sym: 'BTCUSD', dir: 'Short', entry: 67200, size: 1, pnl: -540.00, date: 'Feb 25, 2026, 18:02', isNew: false,
      notes: { pre: '', post: '', emotions: '', lessons: '' } },
    { id: 7, sym: 'XAUUSD', dir: 'Long', entry: 5210.40, size: 2, pnl: +1280.00, date: 'Feb 24, 2026, 11:15', isNew: false,
      notes: { pre: '', post: '', emotions: '', lessons: '' } },
    { id: 8, sym: 'EURUSD', dir: 'Short', entry: 1.09200, size: 1, pnl: -210.00, date: 'Feb 23, 2026, 15:40', isNew: false,
      notes: { pre: '', post: '', emotions: '', lessons: '' } }
  ];
  // Coin badge color per symbol
  const PF_COIN = { XAUUSD: '#f0b429', GBPJPY: '#22c97a', EURUSD: '#3d8ef0', BTCUSD: '#f7931a' };
  const pfCoinColor = sym => PF_COIN[sym] || '#5c6580';
  const pfIsJournaled = t => !!(t.notes && (t.notes.pre || t.notes.post || t.notes.emotions || t.notes.lessons));
  // Ensure every trade has a tags field (added for the Journal tag input)
  PF_JOURNAL.forEach(t => { if (t.notes && t.notes.tags == null) t.notes.tags = ''; });
  const PF_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  let pfEqView = 'bars';
  let pfCalYear = 2026, pfCalMonth = 5, pfCalDay = 12;
  let pfCalViewMode = 'monthly';
  let pfJournalFilter = 'all';
  let pfJrSelected = null;

  // ── Day Performance bars ──
  function pfBuildDayPerf() {
    const cont = document.getElementById('pf-day-perf');
    if (!cont || cont.dataset.built) return;
    const maxA = Math.max(...Object.values(PF_DAY_DATA).map(Math.abs), 1);
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(d => {
      const v = PF_DAY_DATA[d], cls = v > 0 ? 'pos' : v < 0 ? 'neg' : 'zero';
      const pct = Math.abs(v) / maxA * 100;
      const row = document.createElement('div');
      row.className = 'pf-dp-row';
      row.innerHTML = `<div class="pf-dp-lbl">${d}</div>
        <div class="pf-dp-track"><div class="pf-dp-fill ${v > 0 ? 'pos' : 'neg'}" style="width:${v === 0 ? '2px' : pct + '%'}"></div></div>
        <div class="pf-dp-num ${cls}">${v === 0 ? '—' : (v > 0 ? '+' : '') + v.toFixed(0)}</div>`;
      cont.appendChild(row);
    });
    cont.dataset.built = '1';
  }

  // ── Trade Performance chart (bars / line) ──
  const PF_RETURNS = (typeof appTradesData !== 'undefined' ? appTradesData : PF_EQUITY.map((v, i, a) => i ? (v - a[i - 1]) / a[i - 1] * 100 : 0).slice(1)).slice(-75);

  function pfChartSetup() {
    const canvas = document.getElementById('pf-eq-canvas');
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);
    return { ctx, W: rect.width, H: rect.height };
  }

  // Per-trade return bars (matches the dashboard's performance chart, dark themed)
  function pfDrawBars() {
    const s = pfChartSetup();
    if (!s) return;
    const { ctx, W, H } = s;
    const data = PF_RETURNS;
    const wins = data.filter(t => t > 0);
    const losses = data.filter(t => t < 0);
    const avgWin = wins.length ? wins.reduce((a, b) => a + b, 0) / wins.length : 0;
    const avgLoss = losses.length ? Math.abs(losses.reduce((a, b) => a + b, 0) / losses.length) : 0;

    const marginLeft = 36, marginRight = 48, marginTop = 8, marginBottom = 8;
    const chartW = W - marginLeft - marginRight;
    const chartH = H - marginTop - marginBottom;
    const maxVal = Math.max(Math.max(...data.map(Math.abs)), 50);
    const yRange = Math.ceil(maxVal / 10) * 10;
    const zeroY = marginTop + chartH / 2;
    const pxPerPct = (chartH / 2) / yRange;

    ctx.font = '9px "DM Sans", sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let v = -yRange; v <= yRange; v += 10) {
      const y = zeroY - v * pxPerPct;
      if (y < marginTop - 2 || y > marginTop + chartH + 2) continue;
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 0.5; ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(marginLeft, y); ctx.lineTo(marginLeft + chartW, y); ctx.stroke();
      ctx.fillStyle = '#5c6580';
      ctx.fillText(v + '%', marginLeft - 5, y);
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(marginLeft, zeroY); ctx.lineTo(marginLeft + chartW, zeroY); ctx.stroke();

    const barGap = 1.5;
    const barW = Math.max(2, (chartW - (data.length - 1) * barGap) / data.length);
    data.forEach((val, i) => {
      const x = marginLeft + i * (barW + barGap);
      const barH = Math.abs(val) * pxPerPct;
      if (val >= 0) {
        const y = zeroY - barH;
        const grad = ctx.createLinearGradient(x, y, x, zeroY);
        grad.addColorStop(0, '#3d8ef0'); grad.addColorStop(1, '#1e4a88');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.roundRect(x, y, barW, barH, [1.5, 1.5, 0, 0]); ctx.fill();
      } else {
        const y = zeroY;
        const isDeep = Math.abs(val) > 15;
        const grad = ctx.createLinearGradient(x, y, x, y + barH);
        if (isDeep) { grad.addColorStop(0, '#7a3530'); grad.addColorStop(1, '#5a2420'); }
        else { grad.addColorStop(0, '#e8cfc0'); grad.addColorStop(1, '#d8bba8'); }
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.roundRect(x, y, barW, barH, [0, 0, 1.5, 1.5]); ctx.fill();
      }
    });

    if (avgWin > 0) {
      const y = zeroY - avgWin * pxPerPct;
      ctx.strokeStyle = '#00bcd4'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(marginLeft, y); ctx.lineTo(marginLeft + chartW, y); ctx.stroke();
      ctx.setLineDash([]); ctx.fillStyle = '#00bcd4';
      ctx.font = '600 9px "DM Sans", sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(avgWin.toFixed(1) + '%', marginLeft + chartW + 4, y);
    }
    if (avgLoss > 0) {
      const y = zeroY + avgLoss * pxPerPct;
      ctx.strokeStyle = '#e69500'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(marginLeft, y); ctx.lineTo(marginLeft + chartW, y); ctx.stroke();
      ctx.setLineDash([]); ctx.fillStyle = '#e69500';
      ctx.font = '600 9px "DM Sans", sans-serif'; ctx.textAlign = 'left';
      ctx.fillText('-' + avgLoss.toFixed(1) + '%', marginLeft + chartW + 4, y);
    }
  }

  // Equity curve as a price-style line: each segment colored by direction
  // (green when rising, orange when falling), right-side axis, dashed gridlines.
  function pfDrawLine() {
    const s = pfChartSetup();
    if (!s) return;
    const { ctx, W, H } = s;
    let bal = 1000;
    const pts = [bal];
    PF_RETURNS.forEach(p => { bal *= (1 + p / 100); pts.push(bal); });

    const UP = '#5b9d4e', DOWN = '#e0853a';   // green up / orange down

    const marginLeft = 10, marginRight = 54, marginTop = 12, marginBottom = 12;
    const chartW = W - marginLeft - marginRight;
    const chartH = H - marginTop - marginBottom;
    const mn = Math.min(...pts), mx = Math.max(...pts);
    const range = (mx - mn) || 1;
    const yMin = mn - range * 0.08, yMax = mx + range * 0.08;
    const yRange = yMax - yMin;
    const sx = i => marginLeft + (i / (pts.length - 1)) * chartW;
    const sy = v => marginTop + chartH - ((v - yMin) / yRange) * chartH;

    // Dashed horizontal gridlines + right-aligned value labels
    ctx.font = '9px "DM Sans", sans-serif'; ctx.textBaseline = 'middle';
    for (let i = 0; i <= 6; i++) {
      const val = yMin + (yRange * i / 6);
      const y = sy(val);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 0.5; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(marginLeft, y); ctx.lineTo(marginLeft + chartW, y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#7a8499'; ctx.textAlign = 'left';
      ctx.fillText(Math.round(val).toLocaleString(), marginLeft + chartW + 6, y);
    }

    // Directional colored line segments
    ctx.lineWidth = 1.3; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.setLineDash([]);
    for (let i = 1; i < pts.length; i++) {
      ctx.strokeStyle = pts[i] >= pts[i - 1] ? UP : DOWN;
      ctx.beginPath();
      ctx.moveTo(sx(i - 1), sy(pts[i - 1]));
      ctx.lineTo(sx(i), sy(pts[i]));
      ctx.stroke();
    }

    // Last-value marker dot
    const fx = sx(pts.length - 1), fy = sy(pts[pts.length - 1]);
    const last = pts[pts.length - 1], rising = last >= pts[pts.length - 2];
    ctx.fillStyle = rising ? UP : DOWN;
    ctx.beginPath(); ctx.arc(fx, fy, 2.5, 0, Math.PI * 2); ctx.fill();
  }

  function pfDrawChart() {
    if (pfEqView === 'line') pfDrawLine(); else pfDrawBars();
  }

  // ── Donut (theme-aware ring) ──
  function pfDrawDonut() {
    const canvas = document.getElementById('pf-donut-canvas');
    if (!canvas) return;
    const size = 104;
    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    const cs = getComputedStyle(document.body);
    const cv = n => cs.getPropertyValue(n).trim();

    const slices = [
      { v: 11, c: cv('--accent') },
      { v: 5, c: cv('--red') },
      { v: 0, c: cv('--yellow') }
    ].filter(s => s.v > 0);
    const total = slices.reduce((a, b) => a + b.v, 0) || 1;

    const cx = size / 2, cy = size / 2;
    const thickness = 14;
    const r = size / 2 - thickness / 2 - 4;
    const gap = slices.length > 1 ? 0.06 : 0;

    // Track ring
    ctx.lineWidth = thickness;
    ctx.lineCap = 'butt';
    ctx.strokeStyle = cv('--border');
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();

    // Colored segments
    let angle = -Math.PI / 2;
    slices.forEach(s => {
      const sweep = (s.v / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.strokeStyle = s.c;
      ctx.arc(cx, cy, r, angle + gap / 2, angle + sweep - gap / 2);
      ctx.stroke();
      angle += sweep;
    });

    // Center label
    ctx.fillStyle = cv('--text');
    ctx.font = '800 22px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(total), cx, cy - 5);
    ctx.fillStyle = cv('--muted');
    ctx.font = '700 8px "DM Sans", sans-serif';
    ctx.fillText('TRADES', cx, cy + 12);
  }

  function pfDrawAll() { pfDrawChart(); pfDrawDonut(); }

  // ── Calendar ──
  function pfRenderCalendar() {
    const lbl = document.getElementById('pf-cal-lbl');
    if (lbl) {
      if (pfCalViewMode === 'daily') {
        lbl.textContent = `${PF_MONTHS[pfCalMonth].slice(0, 3)} ${pfCalDay}, ${pfCalYear}`;
      } else {
        lbl.textContent = `${PF_MONTHS[pfCalMonth]} ${pfCalYear}`;
      }
    }
    pfUpdateCalSummary();
    if (pfCalViewMode === 'monthly') pfRenderMonthly(); else pfRenderDaily();
  }

  // Summary header — aggregates the whole month (Monthly view) or the selected day (Daily view)
  function pfUpdateCalSummary() {
    const setVal = (id, txt, sign) => {
      const el = document.getElementById(id);
      if (el) { el.textContent = txt; el.className = 'pf-jsm-val ' + sign; }
    };
    let totalPnl = 0, totalTrades = 0, winRate = 0, hasData = false;
    let cum = 0, peak = 0, maxDD = 0;

    if (pfCalViewMode === 'daily') {
      // Per-day stats from the hour breakdown; max drawdown is intraday (hour by hour)
      const ds = `${pfCalYear}-${String(pfCalMonth + 1).padStart(2, '0')}-${String(pfCalDay).padStart(2, '0')}`;
      const hours = pfHourlyForDate(ds);
      let wins = 0;
      hours.forEach(h => {
        totalPnl += h.pnl; totalTrades += h.count; wins += h.wins;
        cum += h.pnl;
        if (cum > peak) peak = cum;
        if (peak - cum > maxDD) maxDD = peak - cum;
      });
      hasData = totalTrades > 0;
      winRate = totalTrades ? (wins / totalTrades * 100) : 0;
    } else {
      let winDays = 0, tradingDays = 0;
      const daysInMonth = new Date(pfCalYear, pfCalMonth + 1, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const ds = `${pfCalYear}-${String(pfCalMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const tr = PF_TRADES[ds];
        if (!tr) continue;
        totalPnl += tr.pnl; totalTrades += tr.count; tradingDays++;
        if (tr.pnl >= 0) winDays++;
        cum += tr.pnl;
        if (cum > peak) peak = cum;
        if (peak - cum > maxDD) maxDD = peak - cum;
      }
      hasData = tradingDays > 0;
      winRate = tradingDays ? (winDays / tradingDays * 100) : 0;
    }

    const pnlTxt = totalPnl === 0 ? '$0' : (totalPnl > 0 ? '+$' : '-$') + Math.abs(totalPnl).toFixed(0);
    setVal('pf-cal-pnl', pnlTxt, totalPnl > 0 ? 'pos' : totalPnl < 0 ? 'neg' : 'neu');
    setVal('pf-cal-winrate', hasData ? winRate.toFixed(0) + '%' : '—', 'neu');
    setVal('pf-cal-dd', maxDD > 0 ? '-$' + maxDD.toFixed(0) : '$0', maxDD > 0 ? 'neg' : 'neu');
    setVal('pf-cal-trades', String(totalTrades), 'neu');
  }

  function pfRenderMonthly() {
    const grid = document.getElementById('pf-cal-grid');
    if (!grid) return;
    grid.innerHTML = '';
    ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN', 'WK'].forEach(h => {
      const d = document.createElement('div'); d.className = 'pf-cal-hdr'; d.textContent = h; grid.appendChild(d);
    });
    const firstDay = new Date(pfCalYear, pfCalMonth, 1).getDay();
    const daysInMonth = new Date(pfCalYear, pfCalMonth + 1, 0).getDate();
    const offset = (firstDay + 6) % 7;
    let wkPnl = 0, wkDays = 0, wkTrades = 0;
    for (let i = 0; i < offset; i++) {
      const e = document.createElement('div'); e.className = 'pf-cal-cell empty'; grid.appendChild(e);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${pfCalYear}-${String(pfCalMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const tr = PF_TRADES[ds];
      const cell = document.createElement('div');
      cell.className = 'pf-cal-cell';
      if (tr) {
        cell.classList.add(tr.pnl >= 0 ? 'profit' : 'loss');
        const pct = PF_START_BAL ? (tr.pnl / PF_START_BAL * 100) : 0;
        cell.innerHTML = `
          <div class="pf-cal-top">
            <span class="pf-cal-dn">${d}</span>
            <span class="pf-cal-tn">${tr.count}T</span>
          </div>
          <div class="pf-cal-vals">
            <span class="pf-cal-pnl">${tr.pnl >= 0 ? '+' : '-'}$${Math.abs(tr.pnl).toFixed(0)}</span>
            <span class="pf-cal-pct">${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%</span>
          </div>`;
        wkPnl += tr.pnl; wkDays++; wkTrades += tr.count;
      } else {
        cell.innerHTML = `<div class="pf-cal-top"><span class="pf-cal-dn">${d}</span></div>`;
      }
      const today = new Date();
      if (d === today.getDate() && pfCalMonth === today.getMonth() && pfCalYear === today.getFullYear())
        cell.classList.add('today');
      grid.appendChild(cell);
      const colPos = (offset + d - 1) % 7;
      if (colPos === 6 || d === daysInMonth) {
        const wc = document.createElement('div');
        wc.className = 'pf-wk-cell';
        const wcolor = wkPnl > 0 ? 'var(--accent)' : wkPnl < 0 ? 'var(--red)' : 'var(--muted)';
        const wkPct = PF_START_BAL ? (wkPnl / PF_START_BAL * 100) : 0;
        wc.innerHTML = `<div class="pf-wk-lbl">WK</div>
          <div class="pf-wk-val" style="color:${wcolor}">${wkPnl >= 0 ? '+' : '-'}$${Math.abs(wkPnl).toFixed(0)}</div>
          <div class="pf-wk-pct" style="color:${wcolor}">${wkPct >= 0 ? '+' : ''}${wkPct.toFixed(2)}%</div>
          <div class="pf-wk-sub">${wkTrades}T · ${wkDays}d</div>`;
        grid.appendChild(wc);
        wkPnl = 0; wkDays = 0; wkTrades = 0;
      }
    }
  }

  // Daily view: session summary cards + an hour-of-day heatmap grouped by session
  function pfRenderDaily() {
    const mapEl = document.getElementById('pf-hourmap');
    const cardsEl = document.getElementById('pf-sess-cards');
    if (!mapEl) return;

    const ds = `${pfCalYear}-${String(pfCalMonth + 1).padStart(2, '0')}-${String(pfCalDay).padStart(2, '0')}`;
    const PF_HOURLY = pfHourlyForDate(ds);

    // Peak |pnl| across active hours drives heatmap colour intensity
    let maxAbs = 1;
    PF_HOURLY.forEach(h => { if (Math.abs(h.pnl) > maxAbs) maxAbs = Math.abs(h.pnl); });

    // Session summary cards
    if (cardsEl) {
      cardsEl.innerHTML = '';
      PF_SESSIONS.forEach(s => {
        let pnl = 0, count = 0, wins = 0;
        for (let h = s.start; h < s.end; h++) { pnl += PF_HOURLY[h].pnl; count += PF_HOURLY[h].count; wins += PF_HOURLY[h].wins; }
        const pct = PF_START_BAL ? (pnl / PF_START_BAL * 100) : 0;
        const wr = count ? (wins / count * 100) : 0;
        const cls = pnl > 0 ? 'profit' : pnl < 0 ? 'loss' : '';
        const card = document.createElement('div');
        card.className = 'pf-sess-card ' + cls;
        card.innerHTML = `
          <div class="pf-sess-top">
            <span class="pf-sess-name">${s.name}</span>
            <span class="pf-sess-hours">${String(s.start).padStart(2, '0')}:00–${String(s.end % 24).padStart(2, '0')}:00</span>
          </div>
          <div class="pf-sess-pnl">${pnl >= 0 ? '+' : '-'}$${Math.abs(pnl).toFixed(0)}
            <span class="pf-sess-pct">${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%</span></div>
          <div class="pf-sess-meta">${count} trades · ${wr.toFixed(0)}% win</div>`;
        cardsEl.appendChild(card);
      });
    }

    // Hour heatmap — one row per session
    mapEl.innerHTML = '';
    const dayCount = PF_HOURLY.reduce((s, h) => s + h.count, 0);
    if (!dayCount) {
      const note = document.createElement('div');
      note.className = 'pf-hm-empty';
      note.textContent = 'No trades on this day';
      mapEl.appendChild(note);
    }
    PF_SESSIONS.forEach(s => {
      const row = document.createElement('div');
      row.className = 'pf-hm-row';
      const lbl = document.createElement('div');
      lbl.className = 'pf-hm-rowlbl';
      lbl.textContent = s.name;
      row.appendChild(lbl);
      const cells = document.createElement('div');
      cells.className = 'pf-hm-cells';
      for (let h = s.start; h < s.end; h++) {
        const hd = PF_HOURLY[h];
        const cell = document.createElement('div');
        cell.className = 'pf-hm-cell';
        if (hd.count > 0) {
          const intensity = Math.min(1, Math.abs(hd.pnl) / maxAbs) * 0.78 + 0.18;
          cell.style.background = (hd.pnl >= 0 ? 'rgba(34,201,122,' : 'rgba(240,80,74,') + intensity.toFixed(2) + ')';
          cell.classList.add('active');
          cell.title = `${String(h).padStart(2, '0')}:00 · ${hd.pnl >= 0 ? '+' : '-'}$${Math.abs(hd.pnl).toFixed(0)} · ${hd.count} trades`;
          cell.innerHTML = `
            <div class="pf-hm-hr">${String(h).padStart(2, '0')}</div>
            <div class="pf-hm-pnl">${hd.pnl >= 0 ? '+' : '-'}${Math.abs(hd.pnl).toFixed(0)}</div>
            <div class="pf-hm-tn">${hd.count}T</div>`;
        } else {
          cell.innerHTML = `<div class="pf-hm-hr">${String(h).padStart(2, '0')}</div>`;
        }
        cells.appendChild(cell);
      }
      row.appendChild(cells);
      mapEl.appendChild(row);
    });
  }

  // ── Journal (master / detail) ──
  const pfFmtPnl = v => (v >= 0 ? '+$' : '-$') + Math.abs(v).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const pfFmtPrice = v => v >= 1000 ? v.toLocaleString(undefined, { minimumFractionDigits: 2 }) : v.toString();

  function pfJrFiltered() {
    return PF_JOURNAL.filter(t => {
      if (pfJournalFilter === 'journaled') return pfIsJournaled(t);
      if (pfJournalFilter === 'pending') return !pfIsJournaled(t);
      return true;
    });
  }

  function pfRenderJrCounts() {
    const setTxt = (id, n) => { const el = document.getElementById(id); if (el) el.textContent = n; };
    const journaled = PF_JOURNAL.filter(pfIsJournaled).length;
    setTxt('pf-jr-c-all', PF_JOURNAL.length);
    setTxt('pf-jr-c-journaled', journaled);
    setTxt('pf-jr-c-pending', PF_JOURNAL.length - journaled);
  }

  function pfRenderJrCards() {
    const wrap = document.getElementById('pf-jr-cards');
    if (!wrap) return;
    const list = pfJrFiltered();
    const countEl = document.getElementById('pf-jr-count');
    if (countEl) countEl.textContent = list.length + ' entr' + (list.length === 1 ? 'y' : 'ies');

    if (pfJrSelected == null || !list.some(t => t.id === pfJrSelected)) {
      pfJrSelected = list.length ? list[0].id : null;
    }

    wrap.innerHTML = '';
    list.forEach(t => {
      const card = document.createElement('div');
      card.className = 'pf-jr-card' + (t.id === pfJrSelected ? ' active' : '');
      const dirCls = t.dir === 'Long' ? 'long' : 'short';
      const pnlCls = t.pnl >= 0 ? 'pos' : 'neg';
      card.innerHTML = `
        <div class="pf-jr-card-top">
          <div class="pf-jr-coin" style="background:${pfCoinColor(t.sym)}">${t.sym.slice(0, 2)}</div>
          <div class="pf-jr-sym">${t.sym}</div>
          ${t.isNew ? '<div class="pf-jr-new">NEW</div>' : ''}
        </div>
        <div class="pf-jr-card-mid">
          <span class="pf-jr-dir ${dirCls}">${t.dir}</span>
          <span class="pf-jr-entry">$${pfFmtPrice(t.entry)}</span>
          <span class="pf-jr-pnl ${pnlCls}">${pfFmtPnl(t.pnl)}</span>
        </div>
        <div class="pf-jr-date">${t.date}</div>`;
      card.addEventListener('click', () => { pfJrSelected = t.id; pfRenderJrCards(); pfRenderJrDetail(); });
      wrap.appendChild(card);
    });
    pfRenderJrDetail();
  }

  function pfRenderJrDetail() {
    const box = document.getElementById('pf-jr-detail');
    if (!box) return;
    const t = PF_JOURNAL.find(x => x.id === pfJrSelected);
    if (!t) { box.innerHTML = '<div class="pf-jr-empty">No trade selected</div>'; return; }
    const win = t.pnl >= 0;
    box.innerHTML = `
      <div class="pf-jr-d-head">
        <div class="pf-jr-d-coin" style="background:${pfCoinColor(t.sym)}">${t.sym.slice(0, 2)}</div>
        <div class="pf-jr-d-sym">${t.sym}</div>
        <div class="pf-jr-badge ${win ? 'win' : 'loss'}">${win ? 'WINNER' : 'LOSER'}</div>
        <div class="pf-jr-d-refresh" title="Reset notes" id="pf-jr-reset">&#x21bb;</div>
      </div>
      <div class="pf-jr-d-sub">${t.dir} · Entry $${pfFmtPrice(t.entry)} · Size ${t.size} · ${t.date}</div>

      <div class="pf-jr-section">
        <div class="pf-jr-sec-title">&#128203; Pre-Trade Analysis</div>
        <textarea class="pf-jr-ta" data-note="pre" placeholder="What did you see? Plan, thesis, levels, risk...">${t.notes.pre || ''}</textarea>
      </div>
      <div class="pf-jr-section">
        <div class="pf-jr-sec-title">&#128202; Post-Trade Review</div>
        <textarea class="pf-jr-ta" data-note="post" placeholder="What happened? Execution, slippage, improvements...">${t.notes.post || ''}</textarea>
      </div>
      <div class="pf-jr-grid2">
        <div class="pf-jr-section" style="margin-bottom:0">
          <div class="pf-jr-sec-title">&#128522; Emotions</div>
          <textarea class="pf-jr-ta" data-note="emotions" placeholder="Calm, anxious, FOMO, confident...">${t.notes.emotions || ''}</textarea>
        </div>
        <div class="pf-jr-section" style="margin-bottom:0">
          <div class="pf-jr-sec-title">&#128214; Lessons Learned</div>
          <textarea class="pf-jr-ta" data-note="lessons" placeholder="Key takeaways to repeat or avoid...">${t.notes.lessons || ''}</textarea>
        </div>
      </div>

      <div class="pf-jr-section pf-jr-tags-sec">
        <div class="pf-jr-sec-title">&#127991; Tags</div>
        <input class="pf-jr-tags" id="pf-jr-tags" type="text" placeholder="e.g. breakout, gold, news-driven (comma separated)" value="${(t.notes.tags || '').replace(/"/g, '&quot;')}" />
      </div>
      <div class="pf-jr-actions">
        <button class="pf-jr-btn" id="pf-jr-clear">Clear</button>
        <button class="pf-jr-btn pf-jr-btn-save" id="pf-jr-save">Save</button>
      </div>`;

    box.querySelectorAll('.pf-jr-ta').forEach(ta => {
      ta.addEventListener('input', () => {
        const wasJournaled = pfIsJournaled(t);
        t.notes[ta.dataset.note] = ta.value;
        if (pfIsJournaled(t) !== wasJournaled) { pfRenderJrCounts(); pfRenderJrCards(); }
      });
    });
    const reset = document.getElementById('pf-jr-reset');
    if (reset) reset.addEventListener('click', () => {
      t.notes = { pre: '', post: '', emotions: '', lessons: '', tags: '' };
      pfRenderJrCounts(); pfRenderJrCards();
    });

    const tagsInput = document.getElementById('pf-jr-tags');
    if (tagsInput) tagsInput.addEventListener('input', () => { t.notes.tags = tagsInput.value; });

    const saveBtn = document.getElementById('pf-jr-save');
    if (saveBtn) saveBtn.addEventListener('click', () => {
      if (tagsInput) t.notes.tags = tagsInput.value;
      pfRenderJrCounts(); pfRenderJrCards();
      if (typeof showToast === 'function') showToast(`Journal saved for ${t.sym}`, 'success');
    });

    const clearBtn = document.getElementById('pf-jr-clear');
    if (clearBtn) clearBtn.addEventListener('click', () => {
      t.notes = { pre: '', post: '', emotions: '', lessons: '', tags: '' };
      pfRenderJrCounts(); pfRenderJrCards();
      if (typeof showToast === 'function') showToast('Journal cleared', 'info');
    });
  }

  function pfRenderJournal() {
    pfRenderJrCounts();
    pfRenderJrCards();
  }

  // ── Sub-tab switching ──
  function pfSetTab(name) {
    document.querySelectorAll('.pf-tab').forEach(t => t.classList.toggle('active', t.dataset.pftab === name));
    document.querySelectorAll('.pf-pane').forEach(p => p.classList.remove('active'));
    const pane = document.getElementById('pf-' + name);
    if (pane) pane.classList.add('active');
    if (name === 'dashboard') setTimeout(pfDrawAll, 30);
    if (name === 'calendar') setTimeout(pfRenderCalendar, 30);
  }

  // ── Wire up controls ──
  document.querySelectorAll('.pf-tab').forEach(t => {
    t.addEventListener('click', () => pfSetTab(t.dataset.pftab));
  });
  document.querySelectorAll('.pf-eq-btn').forEach(b => {
    b.addEventListener('click', () => {
      pfEqView = b.dataset.eqview;
      document.querySelectorAll('.pf-eq-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      pfDrawChart();
    });
  });
  document.querySelectorAll('.pf-cal-sub-btn').forEach(b => {
    b.addEventListener('click', () => {
      pfCalViewMode = b.dataset.calview;
      document.querySelectorAll('.pf-cal-sub-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      const mv = document.getElementById('pf-monthly-view');
      const dv = document.getElementById('pf-daily-view');
      if (mv) mv.style.display = pfCalViewMode === 'monthly' ? 'block' : 'none';
      if (dv) dv.style.display = pfCalViewMode === 'daily' ? 'block' : 'none';
      pfRenderCalendar();
    });
  });
  const prevBtn = document.getElementById('pf-cal-prev');
  const nextBtn = document.getElementById('pf-cal-next');
  function pfChangeMonth(dir) {
    pfCalMonth += dir;
    if (pfCalMonth > 11) { pfCalMonth = 0; pfCalYear++; }
    if (pfCalMonth < 0) { pfCalMonth = 11; pfCalYear--; }
    const dim = new Date(pfCalYear, pfCalMonth + 1, 0).getDate();
    if (pfCalDay > dim) pfCalDay = dim;
    pfRenderCalendar();
  }
  function pfChangeDay(dir) {
    const d = new Date(pfCalYear, pfCalMonth, pfCalDay + dir);
    pfCalYear = d.getFullYear(); pfCalMonth = d.getMonth(); pfCalDay = d.getDate();
    pfRenderCalendar();
  }
  // Arrows move by month in Monthly view, by day in Daily view
  function pfNav(dir) { if (pfCalViewMode === 'daily') pfChangeDay(dir); else pfChangeMonth(dir); }
  if (prevBtn) prevBtn.addEventListener('click', () => pfNav(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => pfNav(1));
  document.querySelectorAll('.pf-jr-fbtn').forEach(b => {
    b.addEventListener('click', () => {
      pfJournalFilter = b.dataset.jrfilter;
      document.querySelectorAll('.pf-jr-fbtn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      pfRenderJrCards();
    });
  });
  const jrLive = document.getElementById('pf-jr-live-toggle');
  if (jrLive) jrLive.addEventListener('change', () => {
    pfJournalFilter = jrLive.checked ? 'pending' : 'all';
    document.querySelectorAll('.pf-jr-fbtn').forEach(x => x.classList.toggle('active', x.dataset.jrfilter === pfJournalFilter));
    pfRenderJrCards();
  });

  // ── Lazy init when Performance tab opens ──
  let pfInited = false;
  function pfInit() {
    if (pfInited) return;
    pfInited = true;
    pfBuildDayPerf();
    pfRenderJournal();
    const mv = document.getElementById('pf-monthly-view');
    const dv = document.getElementById('pf-daily-view');
    if (mv) mv.style.display = pfCalViewMode === 'monthly' ? 'block' : 'none';
    if (dv) dv.style.display = pfCalViewMode === 'daily' ? 'block' : 'none';
    pfRenderCalendar();
    setTimeout(pfDrawAll, 60);
  }

  const perfNavBtn = document.querySelector('.sb-btn[data-tab="performance"]');
  if (perfNavBtn) perfNavBtn.addEventListener('click', () => setTimeout(pfInit, 20));

  window.addEventListener('resize', () => { if (pfInited) pfDrawAll(); });
})();

/* =====================================================
   AI AGENT — Chat Assistant (account-aware, simulated)
   ===================================================== */
(function () {
  const thread = document.getElementById('ai-thread');
  const input = document.getElementById('ai-input');
  const sendBtn = document.getElementById('ai-send');
  const chipsWrap = document.getElementById('ai-chips');
  const clearBtn = document.getElementById('ai-clear');
  if (!thread || !input || !sendBtn) return;

  // Snapshot of account context the assistant can reason over (mirrors the dashboard)
  const ACCT = {
    balance: 1043.95, equity: 1049.38, floating: 5.43, todayPnl: 3.40,
    freeMargin: 1043.95, riskScore: 12.4, profile: 'LOW RISK',
    ddDaily: 0.0, ddDailyLimit: 5.0, ddMax: 12.4, ddMaxLimit: 30.0,
    winRate: 60.0, profitFactor: 2.14,
    positions: [
      { sym: 'BTCUSDm', dir: 'BUY', lots: 0.01, entry: 73779.09, protected: false, risk: null },
      { sym: 'XAUUSDm', dir: 'BUY', lots: 0.02, entry: 3310.45, protected: true, risk: 4.00, riskPct: 0.38, rr: '1 : 3.5' },
      { sym: 'EURUSDm', dir: 'SELL', lots: 0.05, entry: 1.08820, protected: false, risk: null },
    ],
    nextNews: { event: 'Fed Chair Powell Speech', impact: 'High', when: 'in 3h 29m' },
  };
  const money = n => (n >= 0 ? '+$' : '-$') + Math.abs(n).toFixed(2);
  const pos = s => `<span class="ai-pos">${s}</span>`;
  const neg = s => `<span class="ai-neg">${s}</span>`;

  // Keyword-driven response engine. Returns an HTML string.
  function respond(qRaw) {
    const q = qRaw.toLowerCase();
    const has = (...ks) => ks.some(k => q.includes(k));

    if (has('position', 'open trade', 'my trade', 'holdings')) {
      const unprot = ACCT.positions.filter(p => !p.protected);
      const lines = ACCT.positions.map(p => {
        const tag = p.protected ? pos('Protected') : neg('No SL');
        const risk = p.protected ? ` · risk ${neg('$' + p.risk.toFixed(2))} (${p.riskPct}%) · R:R ${p.rr}` : '';
        return `• <b>${p.sym}</b> ${p.dir} ${p.lots} lots @ ${p.entry} — ${tag}${risk}`;
      }).join('\n');
      return `You have <b>${ACCT.positions.length} open positions</b>:\n${lines}\n\n${unprot.length
        ? `⚠️ <b>${unprot.length} positions have no stop loss</b> (${unprot.map(p => p.sym).join(', ')}). Consider adding protection.`
        : 'All positions are protected. 👍'}`;
    }

    if (has('risk', 'drawdown', 'exposure', 'safe')) {
      return `Your risk profile is <b>${ACCT.profile}</b> (score ${ACCT.riskScore}/100).\n` +
        `• Daily drawdown: <b>${ACCT.ddDaily.toFixed(2)}%</b> / ${ACCT.ddDailyLimit.toFixed(2)}% limit\n` +
        `• Max drawdown: <b>${ACCT.ddMax.toFixed(2)}%</b> / ${ACCT.ddMaxLimit.toFixed(2)}% limit\n` +
        `• Unprotected positions: ${neg(String(ACCT.positions.filter(p => !p.protected).length))}\n\n` +
        `You're well within limits, but 2 trades without a stop loss are your biggest exposure right now.`;
    }

    if (has('performance', 'today', 'how am i', 'pnl', 'p&l', 'profit', 'doing')) {
      return `Here's today so far:\n` +
        `• Net P&L: ${ACCT.todayPnl >= 0 ? pos(money(ACCT.todayPnl)) : neg(money(ACCT.todayPnl))}\n` +
        `• Floating P&L: ${ACCT.floating >= 0 ? pos(money(ACCT.floating)) : neg(money(ACCT.floating))}\n` +
        `• Win rate: <b>${ACCT.winRate.toFixed(1)}%</b> · Profit factor <b>${ACCT.profitFactor}</b>\n` +
        `• Equity: <b>$${ACCT.equity.toFixed(2)}</b>\n\nSolid, steady day. Profit factor above 1.5 is healthy.`;
    }

    if (has('news', 'event', 'calendar', 'economic')) {
      const n = ACCT.nextNews;
      return `Next high-impact event:\n• <b>${n.event}</b> (${n.impact} impact) — ${n.when}\n\n` +
        `Heads up: you hold an unprotected XAUUSD position and USD news can move gold sharply. Consider a stop loss before the release.`;
    }

    if (has('balance', 'equity', 'margin', 'account')) {
      return `Account snapshot:\n• Balance: <b>$${ACCT.balance.toFixed(2)}</b>\n• Equity: <b>$${ACCT.equity.toFixed(2)}</b>\n` +
        `• Free margin: <b>$${ACCT.freeMargin.toFixed(2)}</b>\n• Floating P&L: ${pos(money(ACCT.floating))}`;
    }

    if (has('hello', 'hi', 'hey', 'help', 'what can you')) {
      return `Hi! I'm your account-aware assistant. I can help with:\n• Reviewing open positions & risk\n• Today's performance & P&L\n• Upcoming news that affects your trades\n\nTry one of the quick prompts below, or just ask.`;
    }

    if (has('thank')) return `Anytime! Trade safe. 📈`;

    return `I can help with your <b>positions</b>, <b>risk</b>, <b>performance</b>, <b>account balance</b>, and <b>upcoming news</b>. ` +
      `Try asking "What's my risk?" or tap a quick prompt below.`;
  }

  function nowTime() {
    const el = document.getElementById('serverTime');
    const m = el && el.textContent.match(/(\d{1,2}:\d{2})/);
    return m ? m[1] : '';
  }
  const WELCOME = `👋 Hi! I'm your <b>AI account assistant</b>. Ask me about your positions, risk, performance, or upcoming news — or tap a quick prompt below.`;
  const stripHtml = h => h.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&amp;/g, '&').trim();

  // ── Conversation store (persisted to localStorage) ──
  const histWrap = document.getElementById('ai-hist');
  const newBtn = document.getElementById('ai-new');
  const searchInput = document.getElementById('ai-search-input');
  const aiRoot = document.querySelector('.ai-root');
  const menuBtn = document.getElementById('ai-menu-btn');
  const backdrop = document.getElementById('ai-backdrop');
  const closeMenu = () => aiRoot && aiRoot.classList.remove('menu-open');
  let convos = [];
  let activeId = null;
  let searchQ = '';

  const genId = () => 'c' + Date.now() + Math.floor(Math.random() * 1000);
  function save() { try { localStorage.setItem('ai_convos', JSON.stringify({ convos, activeId })); } catch (e) {} }
  function loadStore() {
    try {
      const d = JSON.parse(localStorage.getItem('ai_convos'));
      if (d && Array.isArray(d.convos)) { convos = d.convos; activeId = d.activeId; }
    } catch (e) {}
  }
  const getActive = () => convos.find(c => c.id === activeId);
  function ensureActive() {
    if (!convos.length) convos.push({ id: genId(), messages: [], time: nowTime() });
    if (!convos.some(c => c.id === activeId)) activeId = convos[0].id;
  }
  function convoTitle(c) {
    const firstUser = c.messages.find(m => m.role === 'user');
    return firstUser ? stripHtml(firstUser.html).slice(0, 34) : 'New chat';
  }

  // ── Rendering ──
  function renderBubble(role, html, time) {
    const msg = document.createElement('div');
    msg.className = 'ai-msg ' + role;
    msg.innerHTML = `<div class="ai-msg-av">${role === 'bot' ? '🤖' : '🧑'}</div>` +
      `<div><div class="ai-bubble">${html}</div>${time ? `<div class="ai-time">${time}</div>` : ''}</div>`;
    thread.appendChild(msg);
    thread.scrollTop = thread.scrollHeight;
  }
  function renderThread() {
    thread.innerHTML = '';
    const c = getActive();
    if (!c || !c.messages.length) { renderBubble('bot', WELCOME, ''); return; }
    c.messages.forEach(m => renderBubble(m.role, m.html, m.time));
  }
  function renderHistory() {
    if (!histWrap) return;
    histWrap.innerHTML = '';
    const q = searchQ.toLowerCase();
    const list = convos.filter(c => {
      if (!q) return true;
      if (convoTitle(c).toLowerCase().includes(q)) return true;
      return c.messages.some(m => stripHtml(m.html).toLowerCase().includes(q));
    });
    if (!list.length) {
      histWrap.innerHTML = `<div class="ai-hist-empty">${searchQ ? 'No chats match your search.' : 'No conversations yet.'}</div>`;
      return;
    }
    list.forEach(c => {
      const item = document.createElement('div');
      item.className = 'ai-hist-item' + (c.id === activeId ? ' active' : '');
      const count = c.messages.length;
      item.innerHTML = `<div class="ai-hist-title">${stripHtml(convoTitle(c)).replace(/</g, '&lt;')}</div>` +
        `<div class="ai-hist-meta">${count ? count + ' message' + (count === 1 ? '' : 's') : 'Empty'}${c.time ? ' · ' + c.time : ''}</div>` +
        `<button class="ai-hist-del" title="Delete chat">&times;</button>`;
      item.addEventListener('click', () => selectChat(c.id));
      item.querySelector('.ai-hist-del').addEventListener('click', e => { e.stopPropagation(); deleteChat(c.id); });
      histWrap.appendChild(item);
    });
  }

  // ── Actions ──
  function newChat() {
    const empty = convos.find(c => !c.messages.length);
    if (empty) { activeId = empty.id; }
    else { const c = { id: genId(), messages: [], time: nowTime() }; convos.unshift(c); activeId = c.id; }
    searchQ = ''; if (searchInput) searchInput.value = '';
    save(); renderThread(); renderHistory(); closeMenu(); input.focus();
  }
  function selectChat(id) { activeId = id; save(); renderThread(); renderHistory(); closeMenu(); }
  function deleteChat(id) {
    convos = convos.filter(c => c.id !== id);
    if (activeId === id) activeId = null;
    ensureActive();
    save(); renderThread(); renderHistory();
  }
  function clearCurrent() {
    const c = getActive();
    if (c) { c.messages = []; c.time = nowTime(); }
    save(); renderThread(); renderHistory();
  }

  function showTyping() {
    const msg = document.createElement('div');
    msg.className = 'ai-msg bot';
    msg.id = 'ai-typing-row';
    msg.innerHTML = `<div class="ai-msg-av">🤖</div><div class="ai-bubble"><div class="ai-typing"><span></span><span></span><span></span></div></div>`;
    thread.appendChild(msg);
    thread.scrollTop = thread.scrollHeight;
  }
  function removeTyping() {
    const t = document.getElementById('ai-typing-row');
    if (t) t.remove();
  }

  function pushMessage(role, html) {
    const c = getActive();
    if (!c) return;
    const time = nowTime();
    c.messages.push({ role, html, time });
    c.time = time;
    renderBubble(role, html, time);
    save(); renderHistory();
  }

  let busy = false;
  function handleSend(text) {
    const q = (text != null ? text : input.value).trim();
    if (!q || busy) return;
    busy = true;
    pushMessage('user', q.replace(/</g, '&lt;'));
    input.value = '';
    autoGrow();
    showTyping();
    setTimeout(() => {
      removeTyping();
      pushMessage('bot', respond(q));
      busy = false;
    }, 650 + Math.min(q.length * 12, 700));
  }

  function autoGrow() {
    input.style.height = 'auto';
    input.style.height = Math.min(Math.max(input.scrollHeight, 80), 200) + 'px';
  }

  // ── Wiring ──
  sendBtn.addEventListener('click', () => handleSend());
  input.addEventListener('input', autoGrow);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  });
  if (chipsWrap) chipsWrap.addEventListener('click', e => {
    const chip = e.target.closest('.ai-chip');
    if (chip) handleSend(chip.dataset.prompt);
  });
  if (newBtn) newBtn.addEventListener('click', newChat);
  if (clearBtn) clearBtn.addEventListener('click', clearCurrent);
  if (searchInput) searchInput.addEventListener('input', () => { searchQ = searchInput.value.trim(); renderHistory(); });
  // Slide-in menu (New chat / Search / History)
  if (menuBtn) menuBtn.addEventListener('click', () => aiRoot.classList.toggle('menu-open'));
  if (backdrop) backdrop.addEventListener('click', closeMenu);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  // ── Init ──
  loadStore();
  ensureActive();
  renderThread();
  renderHistory();
})();
