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

// ── Risk Tab: Position Size Calculator ──────────────
function updateCalc() {
  const accountType = getToggleValue('calcAccountType') || 'balance';
  const accountValueInput = parseFloat(document.getElementById('calcAccountValue')?.value) || 0;
  const riskType = getToggleValue('calcRiskType') || 'percent';
  const riskAmtInput = parseFloat(document.getElementById('calcRiskAmt')?.value) || 0;
  const slPips = parseFloat(document.getElementById('calcSLPips')?.value) || 1;
  const tpPips = parseFloat(document.getElementById('calcTPPips')?.value) || 1;
  const lotSize = parseFloat(document.getElementById('calcLotSize')?.value) || 0.01;
  const commissionType = getToggleValue('calcCommissionType') || 'dollar';
  const commissionInput = parseFloat(document.getElementById('calcCommission')?.value) || 0;
  const maxPS = parseFloat(document.getElementById('calcMaxPS')?.value) || 0;

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

  // Use a default pip value (we need this for calculations)
  // $0.10 per pip per 0.01 lot → $10 per pip per lot
  const pipValPerLot = 10;
  
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
  
  // Setup regular inputs
  const ids = ['calcAccountValue','calcRiskAmt','calcSLPips','calcSLPips2','calcTPPips','calcCommission','calcLotSize','calcMaxPS'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        if (id === 'calcSLPips') {
          const other = document.getElementById('calcSLPips2');
          if (other) other.value = el.value;
        } else if (id === 'calcSLPips2') {
          const other = document.getElementById('calcSLPips');
          if (other) other.value = el.value;
        }
        updateCalc();
      });
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
