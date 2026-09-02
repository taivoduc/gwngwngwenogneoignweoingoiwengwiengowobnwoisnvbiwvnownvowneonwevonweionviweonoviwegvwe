// UI integration test: điểm −9..+9, la bàn, giờ, lưới 9 ô
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'kymon.html'), 'utf8');
const bundleSrc = fs.readFileSync(path.join(ROOT, 'qimen-interpreter.bundle.js'), 'utf8');

const errors = [];
const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  url: 'file:///' + ROOT.replace(/\\/g, '/') + '/kymon.html',
  pretendToBeVisual: true,
  beforeParse(window) {
    window.Element.prototype.scrollIntoView = function () {};
    window.addEventListener('error', function (e) { errors.push(String(e.message || e.error)); });
    try { window.eval(bundleSrc); } catch (e) { errors.push('bundle eval: ' + e.message); }
  }
});

const { window } = dom;
const { document } = window;

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS', name); }
  else { failed++; console.log('FAIL', name, extra !== undefined ? JSON.stringify(extra).slice(0, 250) : ''); }
}

function setHeading(h) { window._compass.heading = h; window.updateCompass(); }
function gioTexts() {
  return Array.from(document.querySelectorAll('.gio-item-mini .line1')).map(e => e.textContent);
}

setTimeout(() => {
  check('bundle loaded', !!window.KYMON_IQ);
  check('board 9 ô', document.querySelectorAll('#board .grid .cell').length === 9);
  check('scoreDirection/scoreHour có trong API', typeof window.KYMON_IQ.scoreDirection === 'function' && typeof window.KYMON_IQ.scoreHour === 'function');

  // --- điểm nằm trong −9..+9 (engine) ---
  const chart = window._cungData;
  const hs = window.KYMON_IQ.scoreHour(chart);
  check('scoreHour trong −9..+9', hs.score >= -9 && hs.score <= 9, hs.score);
  let inRange = true;
  [1,2,3,4,6,7,8,9].forEach(p => { const s = window.KYMON_IQ.scoreDirection(chart, p, {hourScore: hs.score}).score; if (s < -9 || s > 9) inRange = false; });
  check('mọi hướng score trong −9..+9', inRange);

  // --- dòng 1 la bàn: <độ> <hướng> - <Giờ> <điểm giờ> - <Cung> <điểm cung>, <Môn – Tinh – Thần> ---
  setHeading(0);
  const line1 = document.getElementById('compassHeading').textContent;
  check('dòng 1 có độ', /\d+°/.test(line1), line1);
  check('dòng 1 có hướng (Bắc)', line1.indexOf('Bắc') >= 0, line1);
  check('dòng 1 có giờ + điểm giờ', /(Tý|Sửu|Dần|Mão|Thìn|Tỵ|Ngọ|Mùi|Thân|Dậu|Tuất|Hợi) [+-]?\d/.test(line1), line1);
  check('dòng 1 có cung + điểm cung', /(Khảm|Khôn|Chấn|Tốn|Càn|Đoài|Cấn|Ly) (N|TN|Đ|ĐN|TB|T|ĐB|B) [+-]?\d/.test(line1), line1);
  check('dòng 1 có Môn – Tinh – Thần', /(Hưu|Sinh|Thương|Đỗ|Cảnh|Tử|Kinh|Khai) Môn/.test(line1) && /Sao /.test(line1) && /Thần /.test(line1) && line1.indexOf('–') >= 0, line1);

  // --- tâm la bàn: điểm hướng (trên) + điểm giờ (dưới) ---
  const rc = document.getElementById('roseCenter');
  check('roseCenter có 2 dòng (điểm hướng + điểm giờ)', rc.innerHTML.indexOf('<br>') >= 0, rc.innerHTML);
  const rcLines = rc.innerHTML.split('<br>');
  check('2 dòng đều là số có dấu', rcLines.length === 2 && /^[+-]?\d+$/.test(rcLines[0].trim()) && /^[+-]?\d+$/.test(rcLines[1].trim()), rcLines);

  // --- 12 canh giờ: mỗi ô có tên + điểm, màu theo điểm ---
  const gio = gioTexts();
  check('đủ 12 canh giờ', gio.length === 12, gio.length);
  check('mỗi giờ có điểm [+-]số', gio.every(t => /[+-]\d/.test(t)), gio);
  check('giờ hiện tại đánh dấu now', !!document.querySelector('.gio-item-mini.now'));
  const sc0 = window.KYMON_IQ.scoreHour(chart).score;
  const expectedBg = window.scoreToColor(sc0);
  const currentCell = document.querySelector('.gio-item-mini.now');
  const currentChi = Math.floor(((parseInt(document.getElementById('duongHour').value)||0) + 1) / 2) % 12;
  const chiNames = ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];
  const idx = chiNames.indexOf(gioTexts()[currentChi].match(/[A-ZÀ-ỸĂÂĐÔƠƯ][a-zà-ỹăâđôơư]*/)[0]);
  check('ô giờ hiện tại có màu score (hsl/rgb)', !!currentCell && /hsl|rgb/.test(currentCell.style.background));

  // --- lưới 9 ô: nền trùng màu hướng đang chọn + không còn 用神 ---
  const cells = document.querySelectorAll('#compassLuanGiai .lg-cell');
  check('đúng 9 ô', cells.length === 9);
  const text = document.getElementById('compassLuanGiai').textContent;
  check('không còn chữ 用神 (đã dịch Dụng thần)', text.indexOf('用神') < 0, text.slice(0, 80));
  check('có Dụng thần', text.indexOf('Dụng thần') >= 0 || text.indexOf('Dụng') >= 0);
  // Mỗi ô tô màu theo ĐIỂM CHỦ ĐỀ RIÊNG (−2..+2): cùng điểm → cùng màu, khác điểm → khác màu
  const bgs = Array.from(cells).map(c => c.style.background);
  const scoresShown = Array.from(cells).map(c => {
    const w = c.querySelector('.lg-cell-word').textContent;
    const m = w.match(/([+-]\d)$/);
    return m ? parseInt(m[1], 10) : 0;
  });
  const distinctBg = new Set(bgs).size;
  const distinctScore = new Set(scoresShown).size;
  check('mỗi ô có điểm chủ đề [+-]số', scoresShown.every(s => s >= -2 && s <= 2), scoresShown);
  check('màu ô theo điểm riêng (số điểm khác nhau → màu khác nhau)', distinctBg === distinctScore, distinctBg + ' vs ' + distinctScore);
  check('9 ô có nền màu (hsl/rgb)', bgs.every(b => /hsl|rgb/.test(b)));
  check('có đủ 2+ màu khác nhau (không đồng màu)', distinctBg >= 2, distinctBg);
  check('mỗi ô có luận giải chi tiết', document.querySelectorAll('#compassLuanGiai .lg-reason').length >= 9);
  // Viết hoa chữ cái đầu mỗi câu lý do (sau dấu •)
  const firstLetters = Array.from(document.querySelectorAll('#compassLuanGiai .lg-reason')).map(r => (r.textContent.trim().replace(/^•\s*/, '') || ' ')[0]);
  const isUpper = ch => /^[A-ZÀ-Ỹ]/.test(ch) || !/[a-zà-ỹ]/.test(ch);
  check('lý do viết hoa chữ cái đầu', firstLetters.length > 0 && firstLetters.every(isUpper), firstLetters.slice(0, 12));

  // --- ràng buộc hướng + đổi giờ ---
  setHeading(0);
  const north = document.getElementById('compassLuanGiai').textContent;
  setHeading(180);
  const south = document.getElementById('compassLuanGiai').textContent;
  check('đổi hướng → luận giải đổi', north !== south);
  const hourInput = document.getElementById('duongHour');
  hourInput.value = '05'; // giờ Mão — khác chi với giờ hiện tại
  window.capNhatTuDuong();
  check('đổi giờ → luận giải đổi', document.getElementById('compassLuanGiai').textContent !== south);

  check('no errors', errors.length === 0, errors);
  console.log('\nRESULT: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed > 0 ? 1 : 0);
}, 500);
