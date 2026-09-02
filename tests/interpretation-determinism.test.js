// tests/interpretation-determinism.test.js — Determinism.
// Chạy: node tests/interpretation-determinism.test.js
'use strict';
const iq = require('../index.js');
const { goldenChart, syntheticChart, OUTER_PALACES, DOORS, STARS, DEITIES } = require('./_helpers.js');

let passed = 0, failed = 0;
function check(name, cond, extra) {
    if (cond) { passed++; console.log('  PASS  ' + name); }
    else { failed++; console.log('  FAIL  ' + name + (extra !== undefined ? ' -> ' + JSON.stringify(extra).slice(0, 200) : '')); }
}

// 200 mẫu ngẫu nhiên (seed cố định để tái lập)
let seed = 42;
function rnd(n) { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; }

const qtypes = iq.QUESTION_TYPES.map(q => q.id);
let allSame = true;
for (let i = 0; i < 200; i++) {
    const p = OUTER_PALACES[rnd(OUTER_PALACES.length)];
    const d = rnd(DOORS.length), s = rnd(STARS.length), de = rnd(DEITIES.length);
    const chart = syntheticChart(p, d, s, de);
    const qt = qtypes[rnd(qtypes.length)];
    const a = iq.interpretQimen(chart, { type: qt, text: '' }, {});
    const b = iq.interpretQimen(chart, { type: qt, text: '' }, {});
    const c = iq.interpretQimen(chart, { type: qt, text: '' }, {});
    const ja = JSON.stringify({ conclusion: a.conclusion, findings: a.findings, yongShen: a.yongShen, provenance: a.provenance });
    const jb = JSON.stringify({ conclusion: b.conclusion, findings: b.findings, yongShen: b.yongShen, provenance: b.provenance });
    const jc = JSON.stringify({ conclusion: c.conclusion, findings: c.findings, yongShen: c.yongShen, provenance: c.provenance });
    if (ja !== jb || jb !== jc) { allSame = false; console.log('  determinism fail at sample ' + i); break; }
}
check('200 mẫu × 3 lần chạy y hệt nhau', allSame);

// golden chart determinism
const gc = goldenChart();
const g1 = JSON.stringify(iq.interpretQimen(gc, { type: 'CAREER', text: '' }, {}));
const g2 = JSON.stringify(iq.interpretQimen(gc, { type: 'CAREER', text: '' }, {}));
check('golden chart deterministic', g1 === g2);

console.log('\nKết quả: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed > 0 ? 1 : 0);
