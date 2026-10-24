/* =============================================
   EXPENSE TRACKER – app.js
   Đề 38: Hệ thống Quản lý Chi tiêu / Expense Tracker
   ============================================= */

// =============================================
// DATA
// =============================================
let categories = [
  { id: 1, name: 'Ăn uống',     emoji: '🍔', color: '#f97316' },
  { id: 2, name: 'Đi lại',      emoji: '🚗', color: '#06b6d4' },
  { id: 3, name: 'Nhà ở',       emoji: '🏠', color: '#8b5cf6' },
  { id: 4, name: 'Giải trí',    emoji: '🎮', color: '#ec4899' },
  { id: 5, name: 'Sức khỏe',    emoji: '💊', color: '#10b981' },
  { id: 6, name: 'Giáo dục',    emoji: '📚', color: '#3b82f6' },
  { id: 7, name: 'Lương',       emoji: '💵', color: '#22c55e' },
  { id: 8, name: 'Thưởng',      emoji: '🎁', color: '#f59e0b' },
  { id: 9, name: 'Mua sắm',     emoji: '🛍️', color: '#e11d48' },
  { id:10, name: 'Khác',        emoji: '📦', color: '#64748b' },
];

let transactions = [
  { id:1,  type:'income',  desc:'Lương tháng 10',        catId:7, amount:12000000, date:'2026-10-01', note:'Lương cơ bản' },
  { id:2,  type:'expense', desc:'Tiền nhà tháng 10',     catId:3, amount:3500000,  date:'2026-10-02', note:'' },
  { id:3,  type:'income',  desc:'Thưởng dự án Q3',       catId:8, amount:2500000,  date:'2026-10-03', note:'Thưởng hiệu suất' },
  { id:4,  type:'expense', desc:'Siêu thị tuần 1',       catId:1, amount:850000,   date:'2026-10-05', note:'' },
  { id:5,  type:'expense', desc:'Xăng xe tháng 10',      catId:2, amount:350000,   date:'2026-10-07', note:'' },
  { id:6,  type:'expense', desc:'Netflix + Spotify',     catId:4, amount:280000,   date:'2026-10-08', note:'Giải trí định kỳ' },
  { id:7,  type:'expense', desc:'Khám bệnh định kỳ',     catId:5, amount:500000,   date:'2026-10-10', note:'' },
  { id:8,  type:'expense', desc:'Sách lập trình',        catId:6, amount:420000,   date:'2026-10-12', note:'Học Node.js' },
  { id:9,  type:'expense', desc:'Siêu thị tuần 2',       catId:1, amount:720000,   date:'2026-10-14', note:'' },
  { id:10, type:'income',  desc:'Freelance project',     catId:7, amount:1000000,  date:'2026-10-15', note:'Web design' },
  { id:11, type:'expense', desc:'Cà phê & ăn sáng',      catId:1, amount:260000,   date:'2026-10-17', note:'' },
  { id:12, type:'expense', desc:'Quần áo',               catId:9, amount:440000,   date:'2026-10-18', note:'Mua sắm mùa' },
];

let nextTxnId = 13;
let nextCatId = 11;
let currentTxnType = 'income';

// Month navigation
let viewDate = new Date(2026, 9, 1); // Oct 2026

// =============================================
// UTILITIES
// =============================================
const fmt = (n) => n.toLocaleString('vi-VN') + ' ₫';

function getCat(id) {
  return categories.find(c => c.id === id) || { name: 'Khác', emoji: '📦', color: '#64748b' };
}

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = (type === 'success' ? '✅ ' : '❌ ') + msg;
  t.className = `toast show ${type}`;
  setTimeout(() => { t.className = 'toast'; }, 2800);
}

// =============================================
// NAVIGATION
// =============================================
const pageTitles = {
  dashboard:    'Tổng quan',
  transactions: 'Giao dịch',
  categories:   'Danh mục',
  reports:      'Báo cáo',
  stack:        'Tech Stack',
};

function showPage(name, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  if (el) el.classList.add('active');

  // Refresh relevant content
  if (name === 'dashboard')    renderDashboard();
  if (name === 'transactions') renderTransactions();
  if (name === 'categories')   renderCategories();
  if (name === 'reports')      renderReports();

  // Close mobile menu after navigation
  document.getElementById('navbarNav').classList.remove('open');
  return false;
}

function toggleMobileMenu() {
  document.getElementById('navbarNav').classList.toggle('open');
}

// =============================================
// MONTH NAV
// =============================================
const MONTHS_VI = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
                   'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];

function updateMonthLabel() {
  document.getElementById('currentMonth').textContent =
    `${MONTHS_VI[viewDate.getMonth()]} / ${viewDate.getFullYear()}`;
}

function changeMonth(dir) {
  viewDate.setMonth(viewDate.getMonth() + dir);
  updateMonthLabel();
  renderDashboard();
  renderReports();
}

// =============================================
// FILTERED TRANSACTIONS
// =============================================
function getTxnsForMonth(date) {
  return transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
  });
}

function getTotals(txns) {
  const income  = txns.filter(t => t.type === 'income').reduce((s,t) => s+t.amount, 0);
  const expense = txns.filter(t => t.type === 'expense').reduce((s,t) => s+t.amount, 0);
  return { income, expense, balance: income - expense };
}

// =============================================
// DASHBOARD
// =============================================
function renderDashboard() {
  const txns = getTxnsForMonth(viewDate);
  const { income, expense, balance } = getTotals(txns);
  const savePct = income > 0 ? ((balance / income) * 100).toFixed(1) : 0;

  // Cards
  document.getElementById('totalIncome').textContent  = '+' + fmt(income);
  document.getElementById('totalExpense').textContent = '−' + fmt(expense);
  document.getElementById('totalBalance').textContent = fmt(balance);
  document.querySelector('#card-saving .card-amount').textContent = savePct + '%';

  renderBarChart();
  renderPieChart(txns);
  renderRecentTxns(txns);
}

// --- BAR CHART ---
function renderBarChart() {
  const container = document.getElementById('barChart');
  container.innerHTML = '';

  const maxH = 150;
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth() - i, 1);
    months.push(d);
  }

  // Seed some varied demo data for past months
  const seed = [
    [10500000, 7200000],
    [11200000, 8100000],
    [13000000, 9500000],
    [12500000, 8800000],
    [14200000, 9100000],
  ];

  const allTxns = getTxnsForMonth(viewDate);
  const curInc  = allTxns.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
  const curExp  = allTxns.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);

  const data = [...seed, [curInc || 15500000, curExp || 9320000]];
  const maxVal = Math.max(...data.flat());

  months.forEach((d, i) => {
    const [inc, exp] = data[i];
    const iH = Math.round((inc / maxVal) * maxH);
    const eH = Math.round((exp / maxVal) * maxH);
    const label = MONTHS_VI[d.getMonth()].replace('Tháng ', 'T');

    const group = document.createElement('div');
    group.className = 'bar-group';

    group.innerHTML = `
      <div class="bar-col">
        <div class="bar bar-income"  style="height:${iH}px" title="Thu nhập: ${fmt(inc)}"></div>
        <div class="bar bar-expense" style="height:${eH}px" title="Chi tiêu: ${fmt(exp)}"></div>
      </div>
      <div class="bar-label">${label}</div>
    `;
    container.appendChild(group);
  });
}

// --- PIE CHART ---
function renderPieChart(txns) {
  const expenses = txns.filter(t => t.type === 'expense');
  const bycat = {};
  expenses.forEach(t => {
    bycat[t.catId] = (bycat[t.catId] || 0) + t.amount;
  });

  const total = Object.values(bycat).reduce((s,v)=>s+v,0) || 1;
  const entries = Object.entries(bycat)
    .map(([id, amt]) => ({ cat: getCat(+id), amt, pct: amt/total }))
    .sort((a,b) => b.amt - a.amt)
    .slice(0, 5);

  const svg = document.getElementById('pieSvg');
  const legend = document.getElementById('pieLegend');
  svg.innerHTML = '';
  legend.innerHTML = '';

  if (entries.length === 0) {
    svg.innerHTML = `<text x="80" y="85" text-anchor="middle" fill="#6b7098" font-size="12" font-family="Inter,sans-serif">Không có dữ liệu</text>`;
    return;
  }

  const cx = 80, cy = 80, r = 64, ir = 36;
  let startAngle = -Math.PI / 2;

  entries.forEach(({ cat, amt, pct }) => {
    const angle = pct * 2 * Math.PI;
    const endAngle = startAngle + angle;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const xi1 = cx + ir * Math.cos(startAngle);
    const yi1 = cy + ir * Math.sin(startAngle);
    const xi2 = cx + ir * Math.cos(endAngle);
    const yi2 = cy + ir * Math.sin(endAngle);
    const large = angle > Math.PI ? 1 : 0;

    const path = document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d', `M ${xi1} ${yi1} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${ir} ${ir} 0 ${large} 0 ${xi1} ${yi1} Z`);
    path.setAttribute('fill', cat.color);
    path.setAttribute('opacity', '0.9');
    path.style.transition = 'opacity .2s';
    path.onmouseover = () => path.setAttribute('opacity','1');
    path.onmouseout  = () => path.setAttribute('opacity','0.9');
    path.innerHTML = `<title>${cat.emoji} ${cat.name}: ${fmt(amt)} (${(pct*100).toFixed(1)}%)</title>`;
    svg.appendChild(path);

    startAngle = endAngle;

    // Legend
    const item = document.createElement('div');
    item.className = 'pie-item';
    item.innerHTML = `
      <span class="pie-dot" style="background:${cat.color}"></span>
      <span class="pie-name">${cat.emoji} ${cat.name}</span>
      <span class="pie-pct">${(pct*100).toFixed(0)}%</span>
    `;
    legend.appendChild(item);
  });

  // Center label
  const text = document.createElementNS('http://www.w3.org/2000/svg','text');
  text.setAttribute('x','80'); text.setAttribute('y','76');
  text.setAttribute('text-anchor','middle');
  text.setAttribute('fill','#1a1d3a'); text.setAttribute('font-size','10');
  text.setAttribute('font-weight','700'); text.setAttribute('font-family','Inter,sans-serif');
  text.textContent = 'Chi tiêu';
  svg.appendChild(text);
}

// --- RECENT TRANSACTIONS ---
function renderRecentTxns(txns) {
  const container = document.getElementById('recentTxns');
  const recent = [...txns].sort((a,b) => new Date(b.date)-new Date(a.date)).slice(0,6);

  if (recent.length === 0) {
    container.innerHTML = `<div style="text-align:center;color:var(--text-dim);padding:20px">Không có giao dịch trong tháng này</div>`;
    return;
  }

  container.innerHTML = recent.map(t => {
    const cat = getCat(t.catId);
    const sign = t.type === 'income' ? '+' : '−';
    const cls  = t.type;
    const dateStr = new Date(t.date).toLocaleDateString('vi-VN');
    return `
      <div class="txn-row">
        <div class="txn-emoji">${cat.emoji}</div>
        <div>
          <div class="txn-info-main">${t.desc}</div>
          <div class="txn-info-sub">${cat.name} &middot; ${dateStr}</div>
        </div>
        <div class="txn-amount ${cls}">${sign}${fmt(t.amount)}</div>
      </div>
    `;
  }).join('');
}

// =============================================
// TRANSACTIONS PAGE
// =============================================
function renderTransactions() {
  populateCatFilter();
  filterTxns();
}

function populateCatFilter() {
  const sel = document.getElementById('filterCat');
  const cur = sel.value;
  sel.innerHTML = '<option value="">Tất cả danh mục</option>';
  categories.forEach(c => {
    const o = document.createElement('option');
    o.value = c.id;
    o.textContent = `${c.emoji} ${c.name}`;
    sel.appendChild(o);
  });
  sel.value = cur;
}

function filterTxns() {
  const search = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const type   = document.getElementById('filterType')?.value || '';
  const catId  = document.getElementById('filterCat')?.value || '';

  let filtered = [...transactions];
  if (search) filtered = filtered.filter(t => t.desc.toLowerCase().includes(search) || t.note.toLowerCase().includes(search));
  if (type)   filtered = filtered.filter(t => t.type === type);
  if (catId)  filtered = filtered.filter(t => t.catId === +catId);

  filtered.sort((a,b) => new Date(b.date)-new Date(a.date));

  const tbody = document.getElementById('txnTableBody');
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-dim)">Không tìm thấy giao dịch nào</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(t => {
    const cat = getCat(t.catId);
    const sign = t.type === 'income' ? '+' : '−';
    const cls  = t.type;
    const dateStr = new Date(t.date).toLocaleDateString('vi-VN');
    return `
      <tr>
        <td>${dateStr}</td>
        <td>
          <div style="font-weight:600">${t.desc}</div>
          ${t.note ? `<div style="font-size:12px;color:var(--text-dim);margin-top:2px">${t.note}</div>` : ''}
        </td>
        <td><span class="cat-chip" style="background:${cat.color}22;color:${cat.color}">${cat.emoji} ${cat.name}</span></td>
        <td><span class="type-badge ${cls}">${t.type === 'income' ? '💵 Thu nhập' : '🛒 Chi tiêu'}</span></td>
        <td class="txn-amount ${cls}">${sign}${fmt(t.amount)}</td>
        <td>
          <button class="action-btn del" onclick="deleteTxn(${t.id})" title="Xóa">🗑</button>
        </td>
      </tr>
    `;
  }).join('');
}

function deleteTxn(id) {
  if (!confirm('Bạn có chắc muốn xóa giao dịch này?')) return;
  transactions = transactions.filter(t => t.id !== id);
  renderTransactions();
  showToast('Đã xóa giao dịch');
}

// =============================================
// CATEGORIES PAGE
// =============================================
function renderCategories() {
  const grid = document.getElementById('catGrid');
  grid.innerHTML = categories.map(c => {
    const count = transactions.filter(t => t.catId === c.id).length;
    return `
      <div class="cat-card">
        <div class="cat-emoji-bg" style="background:${c.color}22">${c.emoji}</div>
        <div>
          <div class="cat-card-name">${c.name}</div>
          <div class="cat-card-count">${count} giao dịch</div>
        </div>
        <button class="cat-del" onclick="deleteCat(${c.id})" title="Xóa danh mục">🗑</button>
      </div>
    `;
  }).join('');
}

function deleteCat(id) {
  const used = transactions.some(t => t.catId === id);
  if (used) { showToast('Không thể xóa danh mục đang được sử dụng', 'error'); return; }
  if (!confirm('Xóa danh mục này?')) return;
  categories = categories.filter(c => c.id !== id);
  renderCategories();
  showToast('Đã xóa danh mục');
}

// =============================================
// REPORTS PAGE
// =============================================
function renderReports() {
  const txns = getTxnsForMonth(viewDate);
  const { income, expense, balance } = getTotals(txns);
  const savePct = income > 0 ? ((balance / income) * 100).toFixed(1) : 0;

  // Summary
  document.getElementById('reportSummary').innerHTML = `
    <div class="rep-item">
      <div class="rep-label">Thu nhập</div>
      <div class="rep-val" style="color:var(--income)">+${fmt(income)}</div>
    </div>
    <div class="rep-item">
      <div class="rep-label">Chi tiêu</div>
      <div class="rep-val" style="color:var(--expense)">−${fmt(expense)}</div>
    </div>
    <div class="rep-item">
      <div class="rep-label">Tỉ lệ tiết kiệm</div>
      <div class="rep-val" style="color:var(--accent2)">${savePct}%</div>
    </div>
  `;

  // Category bars
  const expenses = txns.filter(t => t.type === 'expense');
  const bycat = {};
  expenses.forEach(t => { bycat[t.catId] = (bycat[t.catId]||0)+t.amount; });
  const sorted = Object.entries(bycat).sort((a,b)=>b[1]-a[1]);
  const maxAmt = sorted[0]?.[1] || 1;

  document.getElementById('reportBars').innerHTML = sorted.map(([id, amt]) => {
    const cat = getCat(+id);
    const pct = ((amt/maxAmt)*100).toFixed(1);
    return `
      <div class="report-bar-row">
        <div class="report-bar-label">
          <span>${cat.emoji} ${cat.name}</span>
          <span style="color:var(--expense);font-weight:700">${fmt(amt)}</span>
        </div>
        <div class="report-bar-track">
          <div class="report-bar-fill" style="width:${pct}%;background:${cat.color}"></div>
        </div>
      </div>
    `;
  }).join('') || `<div style="color:var(--text-dim);text-align:center;padding:20px">Không có dữ liệu chi tiêu</div>`;

  // Line chart (6 months trend)
  renderLineChart();
}

function renderLineChart() {
  const container = document.getElementById('lineChart');
  const w = 300, h = 140, pad = 20;

  const seed = [
    [10500000,7200000],[11200000,8100000],[13000000,9500000],
    [12500000,8800000],[14200000,9100000],
  ];
  const txns = getTxnsForMonth(viewDate);
  const curInc = txns.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0)||15500000;
  const curExp = txns.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0)||9320000;
  const data = [...seed, [curInc, curExp]];

  const maxV = Math.max(...data.flat());
  const toY = v => pad + (h - 2*pad) * (1 - v/maxV);
  const toX = i => pad + i * ((w - 2*pad)/5);

  const incPts = data.map((d,i)=>`${toX(i)},${toY(d[0])}`).join(' ');
  const expPts = data.map((d,i)=>`${toX(i)},${toY(d[1])}`).join(' ');

  const months = [];
  for(let i=5;i>=0;i--){
    const d = new Date(viewDate.getFullYear(),viewDate.getMonth()-i,1);
    months.push(MONTHS_VI[d.getMonth()].replace('Tháng ','T'));
  }

  let dots = '';
  data.forEach((d,i) => {
    dots += `<circle cx="${toX(i)}" cy="${toY(d[0])}" r="4" fill="var(--income)"><title>Thu: ${fmt(d[0])}</title></circle>`;
    dots += `<circle cx="${toX(i)}" cy="${toY(d[1])}" r="4" fill="var(--expense)"><title>Chi: ${fmt(d[1])}</title></circle>`;
  });

  const labels = months.map((m,i)=>`<text x="${toX(i)}" y="${h-2}" text-anchor="middle" fill="#6b7098" font-size="9" font-family="Inter,sans-serif">${m}</text>`).join('');


  container.innerHTML = `
    <svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto">
      <polyline points="${incPts}" fill="none" stroke="var(--income)" stroke-width="2" stroke-linejoin="round"/>
      <polyline points="${expPts}" fill="none" stroke="var(--expense)" stroke-width="2" stroke-linejoin="round"/>
      ${dots}
      ${labels}
    </svg>
    <div class="legend" style="justify-content:center;margin-top:8px">
      <span class="dot income-dot"></span>Thu nhập
      <span class="dot expense-dot"></span>Chi tiêu
    </div>
  `;
}

// =============================================
// MODAL: ADD TRANSACTION
// =============================================
function openModal() {
  // Set default date to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('txnDate').value = today;

  // Populate category select
  const sel = document.getElementById('txnCat');
  sel.innerHTML = categories.map(c=>`<option value="${c.id}">${c.emoji} ${c.name}</option>`).join('');

  // Reset form
  document.getElementById('txnForm').reset();
  document.getElementById('txnDate').value = today;
  setType('income');

  document.getElementById('txnModal').classList.add('open');
}

function closeModal(e) {
  if (e && e.target !== document.getElementById('txnModal')) return;
  document.getElementById('txnModal').classList.remove('open');
}

function setType(type) {
  currentTxnType = type;
  document.getElementById('txnType').value = type;
  const btnI = document.getElementById('typeBtnIncome');
  const btnE = document.getElementById('typeBtnExpense');

  btnI.className = 'type-btn' + (type==='income'  ? ' active income-active' : '');
  btnE.className = 'type-btn' + (type==='expense' ? ' active expense-active' : '');

  // Filter relevant categories
  const sel = document.getElementById('txnCat');
  if (type === 'income') {
    sel.innerHTML = categories.map(c=>`<option value="${c.id}">${c.emoji} ${c.name}</option>`).join('');
  } else {
    const expCats = categories.filter(c => ![7,8].includes(c.id));
    sel.innerHTML = expCats.map(c=>`<option value="${c.id}">${c.emoji} ${c.name}</option>`).join('');
  }
}

function addTransaction(e) {
  e.preventDefault();
  const desc   = document.getElementById('txnDesc').value.trim();
  const amount = parseInt(document.getElementById('txnAmount').value);
  const date   = document.getElementById('txnDate').value;
  const catId  = parseInt(document.getElementById('txnCat').value);
  const note   = document.getElementById('txnNote').value.trim();
  const type   = currentTxnType;

  if (!desc || !amount || !date || !catId) { showToast('Vui lòng điền đầy đủ thông tin', 'error'); return; }

  transactions.push({ id: nextTxnId++, type, desc, catId, amount, date, note });
  document.getElementById('txnModal').classList.remove('open');
  renderDashboard();
  if (document.getElementById('page-transactions').classList.contains('active')) renderTransactions();
  showToast('Đã thêm giao dịch thành công');
}

// =============================================
// MODAL: ADD CATEGORY
// =============================================
function openCatModal() {
  document.getElementById('catForm').reset();
  document.getElementById('catColor').value = '#' + Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0');
  document.getElementById('catModal').classList.add('open');
}

function closeCatModal(e) {
  if (e && e.target !== document.getElementById('catModal')) return;
  document.getElementById('catModal').classList.remove('open');
}

function addCategory(e) {
  e.preventDefault();
  const name  = document.getElementById('catName').value.trim();
  const emoji = document.getElementById('catEmoji').value.trim() || '📦';
  const color = document.getElementById('catColor').value;

  if (!name) { showToast('Vui lòng nhập tên danh mục', 'error'); return; }
  if (categories.find(c=>c.name.toLowerCase()===name.toLowerCase())) {
    showToast('Danh mục đã tồn tại', 'error'); return;
  }

  categories.push({ id: nextCatId++, name, emoji, color });
  document.getElementById('catModal').classList.remove('open');
  renderCategories();
  showToast('Đã thêm danh mục: ' + emoji + ' ' + name);
}

// =============================================
// INIT
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  updateMonthLabel();
  renderDashboard();

  // Animate cards on load
  document.querySelectorAll('.card').forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(16px)';
    setTimeout(() => {
      card.style.transition = 'opacity .4s ease, transform .4s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 80 + i * 80);
  });

  // Close mobile nav when clicking outside
  document.addEventListener('click', (e) => {
    const nav = document.getElementById('navbarNav');
    const hamburger = document.getElementById('hamburger');
    if (nav && hamburger && !nav.contains(e.target) && !hamburger.contains(e.target)) {
      nav.classList.remove('open');
    }
  });

  // Close modals on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.getElementById('txnModal').classList.remove('open');
      document.getElementById('catModal').classList.remove('open');
    }
  });
});
