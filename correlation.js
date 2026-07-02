/* =====================================================
   Correlation Matrix — correlation.js
   ===================================================== */

const corData = {
  M15: {
    pairs: [
      ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF', 'EURJPY', 'GBPJPY', 'XAUUSD', 'BTCUSD'],
      ['GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF', 'EURJPY', 'GBPJPY', 'XAUUSD', 'BTCUSD'],
      ['USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF', 'EURJPY', 'GBPJPY', 'XAUUSD', 'BTCUSD'],
      ['AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF', 'EURJPY', 'GBPJPY', 'XAUUSD', 'BTCUSD'],
      ['USDCAD', 'NZDUSD', 'USDCHF', 'EURJPY', 'GBPJPY', 'XAUUSD', 'BTCUSD'],
      ['NZDUSD', 'USDCHF', 'EURJPY', 'GBPJPY', 'XAUUSD', 'BTCUSD'],
      ['USDCHF', 'EURJPY', 'GBPJPY', 'XAUUSD', 'BTCUSD'],
      ['EURJPY', 'GBPJPY', 'XAUUSD', 'BTCUSD'],
      ['GBPJPY', 'XAUUSD', 'BTCUSD'],
      ['XAUUSD', 'BTCUSD'],
      ['BTCUSD']
    ],
    matrix: [
      [1, 0.84, -0.63, 0.79, -0.71, 0.72, -0.86, 0.82, 0.65, 0.22, 0.08],
      [0.84, 1, -0.54, 0.71, -0.62, 0.68, -0.78, 0.88, 0.73, 0.18, 0.12],
      [-0.63, -0.54, 1, -0.45, 0.73, -0.42, 0.82, -0.28, -0.35, -0.15, -0.05],
      [0.79, 0.71, -0.45, 1, -0.55, 0.85, -0.74, 0.68, 0.52, 0.31, 0.15],
      [-0.71, -0.62, 0.73, -0.55, 1, -0.52, 0.76, -0.36, -0.28, -0.12, -0.06],
      [0.72, 0.68, -0.42, 0.85, -0.52, 1, -0.69, 0.58, 0.45, 0.28, 0.11],
      [-0.86, -0.78, 0.82, -0.74, 0.76, -0.69, 1, -0.55, -0.48, -0.25, -0.10],
      [0.82, 0.88, -0.28, 0.68, -0.36, 0.58, -0.55, 1, 0.82, 0.10, 0.04],
      [0.65, 0.73, -0.35, 0.52, -0.28, 0.45, -0.48, 0.82, 1, 0.08, 0.02],
      [0.22, 0.18, -0.15, 0.31, -0.12, 0.28, -0.25, 0.10, 0.08, 1, 0.35],
      [0.08, 0.12, -0.05, 0.15, -0.06, 0.11, -0.10, 0.04, 0.02, 0.35, 1]
    ]
  },
  H1: {
    pairs: [
      ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF', 'EURJPY', 'GBPJPY', 'XAUUSD', 'BTCUSD'],
      ['GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF', 'EURJPY', 'GBPJPY', 'XAUUSD', 'BTCUSD'],
      ['USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF', 'EURJPY', 'GBPJPY', 'XAUUSD', 'BTCUSD'],
      ['AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF', 'EURJPY', 'GBPJPY', 'XAUUSD', 'BTCUSD'],
      ['USDCAD', 'NZDUSD', 'USDCHF', 'EURJPY', 'GBPJPY', 'XAUUSD', 'BTCUSD'],
      ['NZDUSD', 'USDCHF', 'EURJPY', 'GBPJPY', 'XAUUSD', 'BTCUSD'],
      ['USDCHF', 'EURJPY', 'GBPJPY', 'XAUUSD', 'BTCUSD'],
      ['EURJPY', 'GBPJPY', 'XAUUSD', 'BTCUSD'],
      ['GBPJPY', 'XAUUSD', 'BTCUSD'],
      ['XAUUSD', 'BTCUSD'],
      ['BTCUSD']
    ],
    matrix: [
      [1, 0.82, -0.68, 0.76, -0.74, 0.70, -0.88, 0.80, 0.62, 0.25, 0.10],
      [0.82, 1, -0.58, 0.69, -0.65, 0.66, -0.80, 0.86, 0.71, 0.20, 0.14],
      [-0.68, -0.58, 1, -0.48, 0.76, -0.45, 0.85, -0.30, -0.38, -0.18, -0.08],
      [0.76, 0.69, -0.48, 1, -0.58, 0.83, -0.76, 0.66, 0.50, 0.34, 0.18],
      [-0.74, -0.65, 0.76, -0.58, 1, -0.55, 0.78, -0.38, -0.30, -0.15, -0.08],
      [0.70, 0.66, -0.45, 0.83, -0.55, 1, -0.71, 0.56, 0.43, 0.30, 0.14],
      [-0.88, -0.80, 0.85, -0.76, 0.78, -0.71, 1, -0.58, -0.50, -0.28, -0.12],
      [0.80, 0.86, -0.30, 0.66, -0.38, 0.56, -0.58, 1, 0.80, 0.12, 0.06],
      [0.62, 0.71, -0.38, 0.50, -0.30, 0.43, -0.50, 0.80, 1, 0.10, 0.04],
      [0.25, 0.20, -0.18, 0.34, -0.15, 0.30, -0.28, 0.12, 0.10, 1, 0.38],
      [0.10, 0.14, -0.08, 0.18, -0.08, 0.14, -0.12, 0.06, 0.04, 0.38, 1]
    ]
  },
  H4: {
    pairs: [
      ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF', 'EURJPY', 'GBPJPY', 'XAUUSD', 'BTCUSD'],
      ['GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF', 'EURJPY', 'GBPJPY', 'XAUUSD', 'BTCUSD'],
      ['USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF', 'EURJPY', 'GBPJPY', 'XAUUSD', 'BTCUSD'],
      ['AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF', 'EURJPY', 'GBPJPY', 'XAUUSD', 'BTCUSD'],
      ['USDCAD', 'NZDUSD', 'USDCHF', 'EURJPY', 'GBPJPY', 'XAUUSD', 'BTCUSD'],
      ['NZDUSD', 'USDCHF', 'EURJPY', 'GBPJPY', 'XAUUSD', 'BTCUSD'],
      ['USDCHF', 'EURJPY', 'GBPJPY', 'XAUUSD', 'BTCUSD'],
      ['EURJPY', 'GBPJPY', 'XAUUSD', 'BTCUSD'],
      ['GBPJPY', 'XAUUSD', 'BTCUSD'],
      ['XAUUSD', 'BTCUSD'],
      ['BTCUSD']
    ],
    matrix: [
      [1, 0.79, -0.72, 0.73, -0.77, 0.67, -0.91, 0.77, 0.59, 0.28, 0.12],
      [0.79, 1, -0.62, 0.66, -0.68, 0.63, -0.83, 0.84, 0.68, 0.22, 0.16],
      [-0.72, -0.62, 1, -0.52, 0.79, -0.48, 0.88, -0.34, -0.42, -0.20, -0.10],
      [0.73, 0.66, -0.52, 1, -0.61, 0.80, -0.79, 0.63, 0.47, 0.36, 0.20],
      [-0.77, -0.68, 0.79, -0.61, 1, -0.58, 0.81, -0.40, -0.33, -0.18, -0.10],
      [0.67, 0.63, -0.48, 0.80, -0.58, 1, -0.74, 0.54, 0.41, 0.32, 0.16],
      [-0.91, -0.83, 0.88, -0.79, 0.81, -0.74, 1, -0.62, -0.54, -0.30, -0.14],
      [0.77, 0.84, -0.34, 0.63, -0.40, 0.54, -0.62, 1, 0.78, 0.14, 0.08],
      [0.59, 0.68, -0.42, 0.47, -0.33, 0.41, -0.54, 0.78, 1, 0.12, 0.06],
      [0.28, 0.22, -0.20, 0.36, -0.18, 0.32, -0.30, 0.14, 0.12, 1, 0.42],
      [0.12, 0.16, -0.10, 0.20, -0.10, 0.16, -0.14, 0.08, 0.06, 0.42, 1]
    ]
  },
  D1: {
    pairs: [
      ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF', 'EURJPY', 'GBPJPY', 'XAUUSD', 'BTCUSD'],
      ['GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF', 'EURJPY', 'GBPJPY', 'XAUUSD', 'BTCUSD'],
      ['USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF', 'EURJPY', 'GBPJPY', 'XAUUSD', 'BTCUSD'],
      ['AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF', 'EURJPY', 'GBPJPY', 'XAUUSD', 'BTCUSD'],
      ['USDCAD', 'NZDUSD', 'USDCHF', 'EURJPY', 'GBPJPY', 'XAUUSD', 'BTCUSD'],
      ['NZDUSD', 'USDCHF', 'EURJPY', 'GBPJPY', 'XAUUSD', 'BTCUSD'],
      ['USDCHF', 'EURJPY', 'GBPJPY', 'XAUUSD', 'BTCUSD'],
      ['EURJPY', 'GBPJPY', 'XAUUSD', 'BTCUSD'],
      ['GBPJPY', 'XAUUSD', 'BTCUSD'],
      ['XAUUSD', 'BTCUSD'],
      ['BTCUSD']
    ],
    matrix: [
      [1, 0.75, -0.78, 0.70, -0.80, 0.64, -0.93, 0.74, 0.56, 0.32, 0.15],
      [0.75, 1, -0.66, 0.63, -0.72, 0.60, -0.86, 0.82, 0.65, 0.25, 0.18],
      [-0.78, -0.66, 1, -0.56, 0.82, -0.52, 0.90, -0.38, -0.46, -0.24, -0.12],
      [0.70, 0.63, -0.56, 1, -0.64, 0.78, -0.82, 0.60, 0.44, 0.38, 0.22],
      [-0.80, -0.72, 0.82, -0.64, 1, -0.60, 0.84, -0.44, -0.36, -0.20, -0.12],
      [0.64, 0.60, -0.52, 0.78, -0.60, 1, -0.76, 0.52, 0.38, 0.34, 0.18],
      [-0.93, -0.86, 0.90, -0.82, 0.84, -0.76, 1, -0.66, -0.58, -0.34, -0.16],
      [0.74, 0.82, -0.38, 0.60, -0.44, 0.52, -0.66, 1, 0.75, 0.16, 0.10],
      [0.56, 0.65, -0.46, 0.44, -0.36, 0.38, -0.58, 0.75, 1, 0.14, 0.08],
      [0.32, 0.25, -0.24, 0.38, -0.20, 0.34, -0.34, 0.16, 0.14, 1, 0.48],
      [0.15, 0.18, -0.12, 0.22, -0.12, 0.18, -0.16, 0.10, 0.08, 0.48, 1]
    ]
  }
};

function getMatrixCellClass(val) {
  const abs = Math.abs(val);
  if (val >= 0) {
    if (abs >= 0.70) return 'cor-cell-strong-pos';
    if (abs >= 0.40) return 'cor-cell-mod-pos';
    if (abs >= 0.15) return 'cor-cell-weak-pos';
    return 'cor-cell-neutral';
  } else {
    if (abs >= 0.70) return 'cor-cell-strong-neg';
    if (abs >= 0.40) return 'cor-cell-mod-neg';
    if (abs >= 0.15) return 'cor-cell-weak-neg';
    return 'cor-cell-neutral';
  }
}

function renderCorrelation(tf) {
  const data = corData[tf];
  if (!data) return;

  const grid = document.getElementById('corMatrixGrid');
  const tfLabel = document.getElementById('corTfLabel');

  if (tfLabel) tfLabel.textContent = tf;

  const symbols = data.pairs[0]; // full symbol list
  const n = symbols.length;
  const allRelationships = [];

  // Set grid columns: 1 for row header + n data columns
  grid.style.gridTemplateColumns = `70px repeat(${n}, 1fr)`;

  let html = '';

  // ── Header row ──
  html += '<div class="cor-matrix-hdr empty-cell"></div>'; // top-left corner
  for (let j = 0; j < n; j++) {
    html += `<div class="cor-matrix-hdr">${symbols[j]}</div>`;
  }

  // ── Data rows ──
  for (let i = 0; i < n; i++) {
    // Row header
    html += `<div class="cor-matrix-hdr">${symbols[i]}</div>`;

    for (let j = 0; j < n; j++) {
      const val = data.matrix[i][j];

      if (i === j) {
        // Diagonal
        html += '<div class="cor-matrix-cell cor-cell-diagonal">';
        html += '<span class="cor-cell-val">100%</span>';
        html += '</div>';
      } else {
        const cls = getMatrixCellClass(val);
        const sign = val >= 0 ? '+' : '';
        const pct = Math.round(val * 100);

        html += `<div class="cor-matrix-cell ${cls}">`;
        html += `<span class="cor-cell-label">${symbols[i]} vs ${symbols[j]}</span>`;
        html += `<span class="cor-cell-val">${sign}${pct}%</span>`;
        html += '</div>';
      }

      // Collect upper triangle for summary
      if (j > i) {
        allRelationships.push({
          pair: `${symbols[i]}/${symbols[j]}`,
          val: val,
          abs: Math.abs(val)
        });
      }
    }
  }

  if (grid) grid.innerHTML = html;

  // ── Notable Correlations ──
  const positiveRels = allRelationships.filter(r => r.val > 0).sort((a, b) => b.abs - a.abs).slice(0, 4);
  const negativeRels = allRelationships.filter(r => r.val < 0).sort((a, b) => b.abs - a.abs).slice(0, 4);

  const positiveList = document.getElementById('corPositiveList');
  const negativeList = document.getElementById('corNegativeList');

  function renderNotableItem(r, type) {
    const absVal = Math.abs(r.val);
    const barWidth = Math.round(absVal * 100);
    const displayVal = r.val.toFixed(2);
    const colorClass = type === 'positive' ? 'notable-bar-positive' : 'notable-bar-negative';
    const valClass = type === 'positive' ? 'notable-val-positive' : 'notable-val-negative';
    const pairLabel = r.pair.replace('/', ' vs ');

    return `
      <div class="notable-item">
        <div class="notable-item-header">
          <span class="notable-item-pair">${pairLabel}</span>
          <span class="notable-item-val ${valClass}">${displayVal}</span>
        </div>
        <div class="notable-bar-track">
          <div class="notable-bar-fill ${colorClass}" style="width: ${barWidth}%"></div>
        </div>
      </div>
    `;
  }

  if (positiveList) {
    positiveList.innerHTML = positiveRels.map(r => renderNotableItem(r, 'positive')).join('');
  }
  if (negativeList) {
    negativeList.innerHTML = negativeRels.map(r => renderNotableItem(r, 'negative')).join('');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderCorrelation('H1');

  document.querySelectorAll('[data-cor-tf]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-cor-tf]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderCorrelation(btn.dataset.corTf);
    });
  });
});
