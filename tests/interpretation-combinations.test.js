// tests/interpretation-combinations.test.js — 4608 combinations.
//   8 palace directions × 8 doors × 9 stars × 8 deities = 4608
// Mỗi combination phải: PASS schema, PASS deterministic, PASS relation resolution,
// PASS provenance, PASS no silent fallback.
// Chạy: node tests/interpretation-combinations.test.js
'use strict';
const iq = require('../index.js');
const { syntheticChart, OUTER_PALACES, DOORS, STARS, DEITIES } = require('./_helpers.js');

const TOTAL = OUTER_PALACES.length * DOORS.length * STARS.length * DEITIES.length; // 8*8*9*8 = 4608

let pass = 0, fail = 0;
const failures = [];
let invalidByChartRule = 0;

const POLARITIES = ['FAVORABLE', 'UNFAVORABLE', 'NEUTRAL', 'MIXED'];
const STRENGTHS = ['STRONG', 'MODERATE', 'WEAK'];

function validFinding(f) {
    return f && typeof f.ruleId === 'string' && f.ruleId.length > 0
        && typeof f.name === 'string'
        && POLARITIES.indexOf(f.polarity) >= 0
        && STRENGTHS.indexOf(f.strength) >= 0
        && Array.isArray(f.evidence) && f.evidence.length > 0
        && typeof f.source === 'string' && f.source.length > 0
        && typeof f.sourceType === 'string'
        && typeof f.explanation === 'string'
        && typeof f.priority === 'number';
}

let idx = 0;
for (const p of OUTER_PALACES) {
    for (let d = 0; d < DOORS.length; d++) {
        for (let s = 0; s < STARS.length; s++) {
            for (let de = 0; de < DEITIES.length; de++) {
                idx++;
                const label = 'p' + p + '/door' + d + '/star' + s + '/deity' + de;
                const chart = syntheticChart(p, d, s, de);
                let r1, r2, err = null;
                try {
                    r1 = iq.interpretQimen(chart, { type: 'GENERAL', text: '' }, {});
                    r2 = iq.interpretQimen(chart, { type: 'GENERAL', text: '' }, {});
                } catch (e) {
                    err = e.message;
                }
                let ok = true;
                const problems = [];
                if (err) { ok = false; problems.push('throw: ' + err); }
                else {
                    // schema
                    if (!Array.isArray(r1.findings) || r1.findings.length === 0) { ok = false; problems.push('no findings'); }
                    else if (!r1.findings.every(validFinding)) { ok = false; problems.push('finding schema'); }
                    // determinism
                    if (JSON.stringify({ c: r1.conclusion, f: r1.findings, y: r1.yongShen }) !== JSON.stringify({ c: r2.conclusion, f: r2.findings, y: r2.yongShen })) {
                        ok = false; problems.push('non-deterministic');
                    }
                    // relation resolution
                    if (!r1.relations || !Array.isArray(r1.relations.chart)) { ok = false; problems.push('no relations'); }
                    // provenance
                    if (!Array.isArray(r1.provenance.rulesUsed) || r1.provenance.rulesUsed.length === 0) { ok = false; problems.push('no rulesUsed'); }
                    if (!Array.isArray(r1.provenance.sources) || r1.provenance.sources.length === 0) { ok = false; problems.push('no sources'); }
                    // no silent fallback: mọi finding có evidence + source thật
                    if (r1.findings.some(f => f.evidence.length === 0 || !f.source)) { ok = false; problems.push('silent fallback'); }
                    // kết luận hợp lệ
                    if (!r1.conclusion || !r1.conclusion.summary || !Array.isArray(r1.conclusion.dimensions)) { ok = false; problems.push('conclusion'); }
                    // INVALID_BY_CHART_RULE marker: Trung cung không có biểu tượng
                    if (r1.findings.some(f => f.ruleId === 'TRUNG_CUNG_NO_SYMBOLS')) invalidByChartRule++;
                    // no undefined / NaN
                    const dump = JSON.stringify(r1);
                    if (dump.indexOf('undefined') >= 0) { ok = false; problems.push('undefined in output'); }
                    if (dump.indexOf('NaN') >= 0) { ok = false; problems.push('NaN in output'); }
                }
                if (ok) pass++;
                else { fail++; if (failures.length < 20) failures.push(label + ': ' + problems.join('; ')); }
            }
        }
    }
    if (idx % 1024 === 0) console.log('  ... đã chạy ' + idx + '/' + TOTAL);
}

console.log('');
console.log('=== KẾT QUẢ 4608 COMBINATIONS ===');
console.log('PASS: ' + pass + '/' + TOTAL);
console.log('FAIL: ' + fail);
console.log('INVALID_BY_CHART_RULE markers (Trung cung): ' + invalidByChartRule);
if (failures.length) {
    console.log('--- các lỗi đầu tiên ---');
    failures.forEach(f => console.log('  ' + f));
    process.exit(1);
} else {
    console.log('Mọi combination: schema ✓ deterministic ✓ relations ✓ provenance ✓ no silent fallback ✓');
    process.exit(0);
}
