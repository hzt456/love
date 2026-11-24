// ---------- 密码门 ----------
const gate = document.getElementById('gate');
const app = document.getElementById('app');
function tryEnter() {
  const v = document.getElementById('gate-input').value;
  if (v === PASSWORD) {
    gate.classList.add('hidden');
    app.classList.remove('hidden');
    drawWheel();
  } else {
    document.getElementById('gate-err').textContent = '密码不对哦，再想想～';
  }
}
document.getElementById('gate-btn').onclick = tryEnter;
document.getElementById('gate-input').addEventListener('keydown', e => { if (e.key === 'Enter') tryEnter(); });

// ---------- 标签切换 ----------
document.querySelectorAll('.tab').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-wheel').classList.toggle('hidden', btn.dataset.tab !== 'wheel');
    document.getElementById('tab-gallery').classList.toggle('hidden', btn.dataset.tab !== 'gallery');
  };
});

// ---------- 轮盘 ----------
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const COLORS = ['#ffd3e0', '#ffe9b8', '#d3f0ff', '#e2d9ff', '#d6f5dd', '#ffd9c9'];
let rotation = 0;      // 当前角度（弧度）
let spinning = false;

function drawWheel() {
  const n = MENU_ITEMS.length;
  const R = canvas.width / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(R, R);
  ctx.rotate(rotation);
  const arc = 2 * Math.PI / n;
  for (let i = 0; i < n; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, R - 6, i * arc, (i + 1) * arc);
    ctx.fillStyle = COLORS[i % COLORS.length];
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();
    // 文字
    ctx.save();
    ctx.rotate((i + 0.5) * arc);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#6b3a4e';
    const fs = Math.max(13, Math.min(26, Math.floor(300 / n))); // 菜越多字越小，防止挤出去
    ctx.font = 'bold ' + fs + 'px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText(MENU_ITEMS[i], R - 30, 10);
    ctx.restore();
  }
  ctx.restore();
}

document.getElementById('spin-btn').onclick = () => {
  if (spinning) return;
  spinning = true;
  document.getElementById('spin-btn').disabled = true;
  document.getElementById('result').classList.add('hidden');

  const n = MENU_ITEMS.length;
  const arc = 2 * Math.PI / n;
  const target = Math.floor(Math.random() * n);
  // 指针在正上方(-90°)，让目标扇区中心停在那里
  const targetAngle = -Math.PI / 2 - (target + 0.5) * arc;
  const start = rotation;
  // 归一化后加 5~7 整圈
  const norm = ((targetAngle - start) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
  const total = norm + (5 + Math.floor(Math.random() * 3)) * 2 * Math.PI; // 必须是整数圈，否则停偏
  const dur = 4000;
  const t0 = performance.now();

  function frame(t) {
    const p = Math.min((t - t0) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);   // 先快后慢
    rotation = start + total * ease;
    drawWheel();
    if (p < 1) requestAnimationFrame(frame);
    else {
      spinning = false;
      document.getElementById('spin-btn').disabled = false;
      const r = document.getElementById('result');
      r.textContent = '今天就吃：' + MENU_ITEMS[target] + '！🎉';
      r.classList.remove('hidden');
    }
  }
  requestAnimationFrame(frame);
};

// ---------- 相册 ----------
const grid = document.getElementById('photo-grid');
if (PHOTOS.length === 0) {
  grid.innerHTML = '<div class="empty-tip">还没有照片哦～<br>把照片放进 photos/ 文件夹，<br>再在 data.js 里加一行就显示啦</div>';
} else {
  PHOTOS.forEach(p => {
    const card = document.createElement('div');
    card.className = 'photo-card';
    card.innerHTML = '<img src="' + p.src + '" loading="lazy"><div class="cap">' + (p.date || '') + '</div>';
    card.onclick = () => {
      document.getElementById('lightbox-img').src = p.src;
      document.getElementById('lightbox-caption').textContent = p.date || '';
      document.getElementById('lightbox').classList.remove('hidden');
    };
    grid.appendChild(card);
  });
}
document.getElementById('lightbox-close').onclick =
  document.getElementById('lightbox').onclick = () =>
    document.getElementById('lightbox').classList.add('hidden');


