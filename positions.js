/* =====================================================
   Positions Management & Quick Close Actions — positions.js
   ===================================================== */

// Initial active positions state
let activePositions = [
  {
    id: 1,
    symbol: 'BTCUSDm',
    type: 'BUY',
    lots: 0.01,
    entryPrice: 73779.09,
    currentPrice: 83835.22,
    sl: 0,
    tp: 0,
    pnl: 0.56,
    duration: '18:18:40',
    slTpText: 'No Protection',
    protectionBadge: 'badge-warn',
    slDistance: '—',
    riskUsd: 'Unprotected',
    riskPct: '—',
    rr: '—',
    status: 'No SL',
    statusBadge: 'expo-warn'
  },
  {
    id: 2,
    symbol: 'XAUUSDm',
    type: 'BUY',
    lots: 0.02,
    entryPrice: 3310.45,
    currentPrice: 3342.80,
    sl: 3290.00,
    tp: 3380.00,
    pnl: 6.47,
    duration: '02:45:10',
    slTpText: '3290.00 / 3380.00',
    protectionBadge: 'badge-ok',
    slDistance: '200 pips',
    riskUsd: '$4.00',
    riskPct: '0.38%',
    rr: '1 : 3.5',
    status: 'Protected',
    statusBadge: 'expo-ok'
  },
  {
    id: 3,
    symbol: 'EURUSDm',
    type: 'SELL',
    lots: 0.05,
    entryPrice: 1.08820,
    currentPrice: 1.09140,
    sl: 0,
    tp: 0,
    pnl: -1.60,
    duration: '05:12:33',
    slTpText: 'No Protection',
    protectionBadge: 'badge-warn',
    slDistance: '—',
    riskUsd: 'Unprotected',
    riskPct: '—',
    rr: '—',
    status: 'No SL',
    statusBadge: 'expo-warn'
  }
];

// Account Metrics State
let accountState = {
  balance: 1043.95,
  initialTodayNetPnl: 3.40,
  closedTodayPnl: 0.00
};

// Toast notification helper
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = '✓';
  if (type === 'warning') icon = '⚠️';
  if (type === 'info') icon = 'ℹ';
  
  toast.innerHTML = `<span>${icon}</span> <div>${message}</div>`;
  container.appendChild(toast);

  // Auto remove after animation completes
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// Render dynamic Positions Tab Table
function renderPositionsTable() {
  const tbody = document.querySelector('#tab-positions tbody');
  if (!tbody) return;

  if (activePositions.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 30px; color: var(--muted); font-family: var(--font-ui);">
          No active positions open.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = activePositions.map(pos => {
    const pnlClass = pos.pnl >= 0 ? 'pnl-pos' : 'pnl-neg';
    const pnlSign = pos.pnl >= 0 ? '+' : '';
    const typeClass = pos.type === 'BUY' ? 'type-buy' : 'type-sell';
    
    return `
      <tr>
        <td class="symbol">${pos.symbol}</td>
        <td class="${typeClass}">${pos.type}</td>
        <td>${pos.lots.toFixed(2)}</td>
        <td>${pos.entryPrice.toLocaleString()}</td>
        <td>${pos.currentPrice.toLocaleString()}</td>
        <td><span class="badge ${pos.protectionBadge}">${pos.slTpText}</span></td>
        <td class="${pnlClass}">${pnlSign}${pos.pnl.toFixed(2)}</td>
        <td>${pos.duration}</td>
      </tr>
    `;
  }).join('');
}

// Render dynamic Exposure Table (Risk Tab)
function renderExposureTable() {
  const tbody = document.querySelector('.exposure-table tbody');
  if (!tbody) return;

  if (activePositions.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 20px; color: var(--muted); font-family: var(--font-ui);">
          No risk exposure.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = activePositions.map(pos => {
    const typeClass = pos.type === 'BUY' ? 'type-buy' : 'type-sell';
    const riskClass = pos.riskUsd === 'Unprotected' ? 'pnl-neg' : 'pnl-neg'; // or styled differently
    const rrClass = pos.rr !== '—' ? 'pnl-pos' : '';

    return `
      <tr>
        <td class="symbol">${pos.symbol}</td>
        <td class="${typeClass}">${pos.type}</td>
        <td>${pos.lots.toFixed(2)}</td>
        <td>${pos.entryPrice.toLocaleString()}</td>
        <td class="pnl-neg">${pos.slDistance}</td>
        <td class="${riskClass}">${pos.riskUsd}</td>
        <td class="pnl-neg">${pos.riskPct}</td>
        <td class="${rrClass}">${pos.rr}</td>
        <td><span class="expo-badge ${pos.statusBadge}">${pos.status}</span></td>
      </tr>
    `;
  }).join('');
}

// Update all positions and exposure summary stats
function updateSummaries() {
  const openCount = activePositions.length;
  const totalLots = activePositions.reduce((sum, pos) => sum + pos.lots, 0);
  const floatingPnl = activePositions.reduce((sum, pos) => sum + pos.pnl, 0);
  const unprotectedCount = activePositions.filter(pos => pos.sl === 0).length;

  // 1. Positions Tab Summary
  const countEl = document.getElementById('pos-summary-count');
  const lotsEl = document.getElementById('pos-summary-lots');
  const pnlEl = document.getElementById('pos-summary-pnl');
  const unprotEl = document.getElementById('pos-summary-unprotected');

  if (countEl) countEl.textContent = openCount;
  if (lotsEl) lotsEl.textContent = totalLots.toFixed(2);
  if (pnlEl) {
    pnlEl.textContent = (floatingPnl >= 0 ? '+' : '') + '$' + floatingPnl.toFixed(2);
    pnlEl.className = floatingPnl >= 0 ? 'pos' : 'neg';
  }
  if (unprotEl) {
    unprotEl.textContent = unprotectedCount;
    unprotEl.style.color = unprotectedCount > 0 ? 'var(--yellow)' : 'var(--green)';
  }

  // 2. Risk Tab Exposure Summary
  const expProtEl = document.getElementById('expo-summary-protected');
  const expRiskEl = document.getElementById('expo-summary-risk');
  const expUnprotEl = document.getElementById('expo-summary-unprotected');
  const expRrEl = document.getElementById('expo-summary-rr');

  const protectedCount = openCount - unprotectedCount;
  if (expProtEl) expProtEl.textContent = `${protectedCount} / ${openCount}`;
  
  // Calculate total at risk (protected ones)
  const totalAtRiskUsd = activePositions
    .filter(pos => pos.sl > 0)
    .reduce((sum, pos) => {
      const val = parseFloat(pos.riskUsd.replace(/[$,]/g, '')) || 0;
      return sum + val;
    }, 0);
  if (expRiskEl) expRiskEl.textContent = '$' + totalAtRiskUsd.toFixed(2);
  
  if (expUnprotEl) {
    expUnprotEl.textContent = unprotectedCount;
    expUnprotEl.style.color = unprotectedCount > 0 ? 'var(--yellow)' : 'var(--green)';
  }
  
  // Hardcoded avg R:R for protected or calculated
  if (expRrEl) expRrEl.textContent = protectedCount > 0 ? '1 : 3.5' : '—';

  // 3. Update Overall Account State Metrics
  const balance = accountState.balance + accountState.closedTodayPnl;
  const equity = balance + floatingPnl;
  const netPnl = accountState.initialTodayNetPnl + accountState.closedTodayPnl;

  // Set metric fields in Dashboard
  const dbBalEl = document.getElementById('metric-balance');
  const dbDrawdownEl = document.getElementById('metric-drawdown');
  const dbMarginEl = document.getElementById('metric-margin');
  const dbFloatEl = document.getElementById('metric-floating-pnl');
  const dbNetEl = document.getElementById('metric-net-pnl');

  if (dbBalEl) dbBalEl.textContent = balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
  if (dbMarginEl) dbMarginEl.textContent = balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
  if (dbFloatEl) {
    dbFloatEl.textContent = (floatingPnl >= 0 ? '+' : '') + floatingPnl.toFixed(2);
    dbFloatEl.className = 'metric-val ' + (floatingPnl >= 0 ? 'green' : 'red');
  }
  if (dbNetEl) {
    dbNetEl.textContent = (netPnl >= 0 ? '+' : '') + netPnl.toFixed(2);
    dbNetEl.className = 'metric-val ' + (netPnl >= 0 ? 'green' : 'red');
  }

  // Set metric fields in Risk Tab
  const rmBalEl = document.getElementById('rmBalance');
  const rmEqEl = document.getElementById('rmEquity');
  const rmCPR = document.getElementById('rmCPR');
  const rmFloat = document.getElementById('rmFloat');
  const rmFreeMargin = document.getElementById('rmFreeMargin');

  if (rmBalEl) rmBalEl.textContent = '$' + balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
  if (rmEqEl) {
    rmEqEl.textContent = '$' + equity.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    rmEqEl.className = 'rm-val ' + (equity >= balance ? 'rm-pos' : 'rm-neg');
  }
  if (rmCPR) rmCPR.textContent = '$' + balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
  if (rmFloat) {
    rmFloat.textContent = (floatingPnl >= 0 ? '+' : '') + '$' + floatingPnl.toFixed(2);
    rmFloat.className = 'rm-val ' + (floatingPnl >= 0 ? 'rm-pos' : 'rm-neg');
  }
  if (rmFreeMargin) rmFreeMargin.textContent = '$' + balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});

  // Sync value to position size calculator input
  const calcAccValInput = document.getElementById('calcAccountValue');
  if (calcAccValInput) {
    calcAccValInput.value = balance.toFixed(2);
  }

  // Call Calculator refresh from app.js if exists
  if (typeof updateCalc === 'function') {
    updateCalc();
  }
}

// Append closed positions to the History tab table
function appendToHistory(positionsToClose) {
  const tbody = document.querySelector('#tab-history tbody');
  if (!tbody) return;

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const closeTimeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  positionsToClose.forEach((pos, index) => {
    // Determine row count to update ID
    const currentRows = tbody.querySelectorAll('tr').length;
    const nextNum = currentRows + 1;
    
    const tr = document.createElement('tr');
    
    const pnlClass = pos.pnl >= 0 ? 'pnl-pos' : 'pnl-neg';
    const pnlSign = pos.pnl >= 0 ? '+' : '';
    const typeClass = pos.type === 'BUY' ? 'type-buy' : 'type-sell';
    
    // Simulate pip calculations (e.g. pnl / lots / 10)
    const pips = Math.round(pos.pnl / pos.lots / 10);
    const pipsText = (pips >= 0 ? '+' : '') + pips;
    const pipsClass = pips >= 0 ? 'pnl-pos' : 'pnl-neg';

    tr.innerHTML = `
      <td class="row-num">${nextNum}</td>
      <td class="symbol">${pos.symbol}</td>
      <td class="${typeClass}">${pos.type}</td>
      <td>${pos.lots.toFixed(2)}</td>
      <td>05:00:00</td>
      <td>${closeTimeStr}</td>
      <td>${pos.entryPrice.toLocaleString()}</td>
      <td>${pos.currentPrice.toLocaleString()}</td>
      <td>${pos.sl > 0 ? pos.sl.toFixed(2) + ' / ' + pos.tp.toFixed(2) : '—'}</td>
      <td class="${pnlClass}">${pnlSign}${pos.pnl.toFixed(2)}</td>
      <td class="${pipsClass}">${pipsText}</td>
      <td><span class="close-reason reason-manual">Manual</span></td>
    `;

    // Insert at the top of history table body
    if (tbody.firstChild) {
      tbody.insertBefore(tr, tbody.firstChild);
    } else {
      tbody.appendChild(tr);
    }
  });

  // Re-adjust row numbers in the table for cleanliness
  const allRows = tbody.querySelectorAll('tr');
  allRows.forEach((row, i) => {
    const numCell = row.querySelector('.row-num');
    if (numCell) numCell.textContent = i + 1;
  });

  // Update history metrics
  updateHistoryMetrics();
}

// Update History summary cards dynamically
function updateHistoryMetrics() {
  const tbody = document.querySelector('#tab-history tbody');
  if (!tbody) return;

  const rows = tbody.querySelectorAll('tr');
  const totalTrades = rows.length;
  
  let wins = 0;
  let totalPnl = 0;
  let bestTrade = -99999;
  let worstTrade = 99999;

  rows.forEach(row => {
    const pnlCell = row.cells[9];
    if (pnlCell) {
      const pnlVal = parseFloat(pnlCell.textContent.replace(/[+$]/g, '')) || 0;
      totalPnl += pnlVal;
      if (pnlVal > 0) wins++;
      if (pnlVal > bestTrade) bestTrade = pnlVal;
      if (pnlVal < worstTrade) worstTrade = pnlVal;
    }
  });

  if (bestTrade === -99999) bestTrade = 0;
  if (worstTrade === 99999) worstTrade = 0;

  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;

  // Find cards
  const sumCards = document.querySelectorAll('#tab-history .sum-card-val');
  if (sumCards.length >= 5) {
    sumCards[0].textContent = totalTrades;
    sumCards[1].textContent = winRate.toFixed(1) + '%';
    sumCards[2].textContent = (totalPnl >= 0 ? '+$' : '-$') + Math.abs(totalPnl).toFixed(2);
    sumCards[2].className = 'sum-card-val ' + (totalPnl >= 0 ? 'pos' : 'neg');
    
    sumCards[3].textContent = (bestTrade >= 0 ? '+$' : '-$') + Math.abs(bestTrade).toFixed(2);
    sumCards[3].className = 'sum-card-val ' + (bestTrade >= 0 ? 'pos' : 'neg');
    
    sumCards[4].textContent = (worstTrade >= 0 ? '+$' : '-$') + Math.abs(worstTrade).toFixed(2);
    sumCards[4].className = 'sum-card-val ' + (worstTrade >= 0 ? 'pos' : 'neg');
  }

  // Update Today's Net P&L in Dashboard too
  const dbNetEl = document.getElementById('metric-net-pnl');
  if (dbNetEl) {
    const todayPnl = accountState.initialTodayNetPnl + accountState.closedTodayPnl;
    dbNetEl.textContent = (todayPnl >= 0 ? '+' : '') + todayPnl.toFixed(2);
    dbNetEl.className = 'metric-val ' + (todayPnl >= 0 ? 'green' : 'red');
  }
}

// Primary action: Close positions based on selection type
function closePositions(type) {
  let toClose = [];
  let remaining = [];

  activePositions.forEach(pos => {
    let match = false;
    switch (type) {
      case 'all':
        match = true;
        break;
      case 'buy':
        match = (pos.type === 'BUY');
        break;
      case 'sell':
        match = (pos.type === 'SELL');
        break;
      case 'profitable':
        match = (pos.pnl > 0);
        break;
      case 'loss':
        match = (pos.pnl <= 0);
        break;
    }

    if (match) {
      toClose.push(pos);
    } else {
      remaining.push(pos);
    }
  });

  if (toClose.length === 0) {
    showToast(`No active positions found to close for: ${type.toUpperCase()}`, 'warning');
    return;
  }

  // Calculate closed metrics
  const closedPnlSum = toClose.reduce((sum, pos) => sum + pos.pnl, 0);
  accountState.closedTodayPnl += closedPnlSum;

  // Move closed positions to history
  appendToHistory(toClose);

  // Update active state
  activePositions = remaining;

  // Re-render
  renderPositionsTable();
  renderExposureTable();
  updateSummaries();

  // Show premium feedback notification
  const count = toClose.length;
  const pnlText = (closedPnlSum >= 0 ? '+' : '') + '$' + closedPnlSum.toFixed(2);
  const toastMsg = `Closed ${count} position${count > 1 ? 's' : ''} (${type.toUpperCase()}). Realized P&L: ${pnlText}`;
  showToast(toastMsg, closedPnlSum >= 0 ? 'success' : 'info');
}

// Initial binding
document.addEventListener('DOMContentLoaded', () => {
  renderPositionsTable();
  renderExposureTable();
  updateSummaries();
});
