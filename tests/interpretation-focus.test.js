// tests/interpretation-focus.test.js — Ràng buộc HƯỚNG (focusPalace).
// Chạy: node tests/interpretation-focus.test.js
'use strict';
const iq = require('../index.js');
const { goldenChart, OUTER_PALACES } = require('./_helpers.js');

let passed = 0, failed = 0;
function check(name, cond, extra) {
    if (cond) { passed++; console.log('  PASS  ' + name); }
    else { failed++; console.log('  FAIL  ' + name + (extra !== undefined ? ' -> ' + JSON.stringify(extra).slice(0, 200) : '')); }
}

const chart = goldenChart();

// --- mọi cung hướng đều chạy được + có hồ sơ cung ---
OUTER_PALACES.forEach(p => {
    let res = null, err = null;
    try { res = iq.interpretQimen(chart, { type: 'CAREER', text: '' }, { focusPalace: p }); } catch (e) { err = e.message; }
    check('focus cung ' + p + ' chạy không lỗi', !err && !!res, err);
    if (res) {
        check('focus cung ' + p + ' có FOCUS_PALACE_PROFILE', res.findings.some(f => f.ruleId === 'FOCUS_PALACE_PROFILE'));
        check('focus cung ' + p + ' có YONG_SHEN_FOCUS_RELATION', res.findings.some(f => f.ruleId === 'YONG_SHEN_FOCUS_RELATION'));
        check('focus cung ' + p + ' không còn quét toàn bàn (≤ 8 finding L3 DOOR)', res.findings.filter(f => f.ruleId === 'DOOR_PALACE_RELATION').length <= 1,
            res.findings.filter(f => f.ruleId === 'DOOR_PALACE_RELATION').length);
    }
});

// --- đổi hướng → kết quả KHÁC nhau (cốt lõi của ràng buộc hướng) ---
const verdicts = {};
OUTER_PALACES.forEach(p => {
    const res = iq.interpretQimen(chart, { type: 'CAREER', text: '' }, { focusPalace: p });
    const d = res.conclusion.dimensions.find(x => x.dimension === 'career');
    verdicts[p] = d.direction + '/' + d.intensity + '/' + d.score;
});
const unique = Object.keys(verdicts).filter(p => verdicts[p] !== verdicts[1]);
check('hướng khác nhau → verdict khác nhau (ít nhất 1 cung khác cung 1)', unique.length > 0, verdicts);
check('không phải mọi cung đều giống nhau', new Set(Object.values(verdicts)).size > 1, verdicts);

// --- không focus → vẫn chạy chart-level (backward compat) ---
const resNoFocus = iq.interpretQimen(chart, { type: 'CAREER', text: '' }, {});
check('không focus vẫn chạy', !!resNoFocus.conclusion);
check('không focus → không có FOCUS_PALACE_PROFILE', !resNoFocus.findings.some(f => f.ruleId === 'FOCUS_PALACE_PROFILE'));

// --- focus = 5 (Trung cung, hiếm) không crash ---
try {
    const r5 = iq.interpretQimen(chart, { type: 'CAREER', text: '' }, { focusPalace: 5 });
    check('focus Trung cung không crash', !!r5.conclusion);
} catch (e) {
    check('focus Trung cung không crash', false, e.message);
}

console.log('\nKết quả: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed > 0 ? 1 : 0);
