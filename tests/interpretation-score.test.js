// tests/interpretation-score.test.js — Điểm −9..+9 (hướng từ 9 chủ đề, giờ = tổng tốt − tổng xấu)
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const HTML = fs.readFileSync(path.join(__dirname, '..', 'kymon.html'), 'utf8');
const JS = HTML.match(/<script>([\s\S]*?)<\/script>/)[1];
const stub = { addEventListener(){}, removeEventListener(){}, value:'', innerHTML:'', style:{}, dataset:{}, id:'', checked:false, textContent:'', classList:{add(){},remove(){}}, querySelector(){return null;}, querySelectorAll(){return [];} };
const document = { getElementById(){ return stub; }, querySelectorAll(){ return []; } };
const window = { _cungData: null, onload: null, addEventListener(){}, removeEventListener(){} };
const sandbox = { console, document, window, Date, Math, JSON, Array, Object, String, Number, Boolean };
vm.createContext(sandbox);
vm.runInContext(JS + '\n;globalThis.__A = { anBan: anBan };', sandbox);

const iq = require('../index.js');
let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  PASS  ' + name); }
  catch (e) { failed++; console.log('  FAIL  ' + name + ' -> ' + e.message); }
}

const chart = sandbox.__A.anBan(new Date(2021, 2, 17, 3, 0, 0));
const chart2 = sandbox.__A.anBan(new Date(2021, 2, 17, 7, 0, 0));

test('điểm chủ đề nằm trong −2..+2 (9 chủ đề)', () => {
  const ts = iq.topicScores(chart, 1);
  if (ts.scores.length !== 9) throw new Error('phải 9 chủ đề, có ' + ts.scores.length);
  ts.scores.forEach(c => { if (c.score < -2 || c.score > 2) throw new Error('điểm chủ đề ngoài −2..+2: ' + c.score); });
});

test('topicScoreFromVerdict: Thuận rõ +2, Thuận vừa +1, Không thuận vừa −1, Không thuận rõ −2, khác 0', () => {
  const f = iq.topicScoreFromVerdict;
  if (f('FAVORABLE', 'STRONG') !== 2) throw new Error('Thuận rõ phải +2');
  if (f('FAVORABLE', 'MODERATE') !== 1) throw new Error('Thuận vừa phải +1');
  if (f('FAVORABLE', 'WEAK') !== 1) throw new Error('Thuận nhẹ phải +1');
  if (f('UNFAVORABLE', 'STRONG') !== -2) throw new Error('Không thuận rõ phải −2');
  if (f('UNFAVORABLE', 'MODERATE') !== -1) throw new Error('Không thuận vừa phải −1');
  if (f('NEUTRAL', 'WEAK') !== 0) throw new Error('Trung tính phải 0');
  if (f('MIXED', 'MODERATE') !== 0) throw new Error('Trái chiều phải 0');
});

test('điểm hướng = round(Σ điểm 9 chủ đề ÷ 2), trong −9..+9', () => {
  [1,2,3,4,6,7,8,9].forEach(p => {
    const d = iq.scoreDirection(chart, p);
    const ts = iq.topicScores(chart, p);
    const expect = Math.max(-9, Math.min(9, Math.round(ts.sum / 2)));
    if (d.score !== expect) throw new Error('cung ' + p + ': ' + d.score + ' != ' + expect);
    if (d.score < -9 || d.score > 9) throw new Error('ngoài −9..+9');
    if (d.sum !== ts.sum) throw new Error('sum lệch');
  });
});

test('điểm giờ = tổng điểm tốt − tổng điểm xấu của TẤT CẢ hướng (không phụ thuộc hướng)', () => {
  const hs = iq.scoreHour(chart);
  const expected = Object.values(hs.perDirection).reduce((s, v) => s + v, 0);
  if (Math.round(hs.goodSum - hs.badSum) !== Math.round(expected)) throw new Error('không khớp tổng');
  // perDirection là điểm hướng của từng cung
  [1,2,3,4,6,7,8,9].forEach(p => {
    const d = iq.scoreDirection(chart, p).score;
    if (hs.perDirection[p] !== d) throw new Error('perDirection ' + p + ' lệch với scoreDirection');
  });
  // độc lập hướng: cùng công thức với mọi focus → chỉ 1 kết quả
  if (hs.perDirection[1] === undefined) throw new Error('thiếu perDirection');
});

test('đổi giờ → điểm giờ đổi, deterministic', () => {
  const hs1 = iq.scoreHour(chart), hs2 = iq.scoreHour(chart2);
  const a = iq.scoreDirection(chart, 1), b = iq.scoreDirection(chart, 1);
  if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error('không deterministic');
  if (hs1.score === hs2.score && a.score === b.score && JSON.stringify(hs1.perDirection) === JSON.stringify(hs2.perDirection)) {
    throw new Error('2 giờ khác nhau nhưng điểm giống hệt — nghi ngờ sai');
  }
});

test('điểm 9 ô khớp CHÍNH XÁC với luận giải per-type từng ô', () => {
  const ts = iq.topicScores(chart, 1);
  ts.scores.forEach(cell => {
    const r = iq.interpretQimen(chart, { type: cell.type, text: '' }, { focusPalace: 1 });
    let d = null;
    r.conclusion.dimensions.forEach(dd => { if (dd.dimension === cell.dim) d = dd; });
    if (!d) d = r.conclusion.dimensions[0] || { direction: 'NEUTRAL', intensity: 'WEAK' };
    const expect = iq.topicScoreFromVerdict(d.direction, d.intensity);
    if (cell.score !== expect) throw new Error(cell.type + ': ' + cell.score + ' != ' + expect);
  });
});

console.log('\nKết quả: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed > 0 ? 1 : 0);
