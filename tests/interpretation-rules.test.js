// tests/interpretation-rules.test.js — Rule Engine.
// Chạy: node tests/interpretation-rules.test.js
'use strict';
const iq = require('../index.js');
const { goldenChart } = require('./_helpers.js');

let passed = 0, failed = 0;
function check(name, cond, extra) {
    if (cond) { passed++; console.log('  PASS  ' + name); }
    else { failed++; console.log('  FAIL  ' + name + (extra !== undefined ? ' -> ' + JSON.stringify(extra).slice(0, 200) : '')); }
}

const chart = goldenChart();
const result = iq.interpretQimen(chart, { type: 'CAREER', text: '' }, {});
const { findings } = result;

// --- mọi rule đều trả mảng findings hợp lệ ---
const norm = iq.normalizeChart(chart);
const qtype = iq.knowledge.questionTypes.BY_ID.CAREER;
const ys = iq.resolveYongShen(norm, qtype, {});
const { runRuleEngine } = require('../lib/ruleEngine.js');
iq.RULES.forEach(rule => {
    let out;
    try { out = runRuleEngine(norm, qtype, ys, {}).filter(f => f.ruleId.indexOf(rule.id) === 0 || f.ruleId === rule.id); }
    catch (e) { out = null; }
    check('rule ' + rule.id + ' chạy không lỗi', Array.isArray(out));
});

// --- thứ bậc ưu tiên: L1 > L2 > L3 > L4 > L5 ---
const priorities = iq.RULES.map(r => r.priority);
check('priorities giảm dần theo thứ tự RULES', priorities.every((p, i) => i === 0 || priorities[i - 1] >= p));

// --- findings đủ schema ---
check('findings không rỗng', findings.length > 0);
const schemaOk = findings.every(f =>
    typeof f.ruleId === 'string' && f.ruleId.length &&
    typeof f.name === 'string' &&
    ['FAVORABLE', 'UNFAVORABLE', 'NEUTRAL', 'MIXED'].includes(f.polarity) &&
    ['STRONG', 'MODERATE', 'WEAK'].includes(f.strength) &&
    Array.isArray(f.evidence) && f.evidence.length > 0 &&
    typeof f.source === 'string' && f.source.length > 0 &&
    typeof f.sourceType === 'string' &&
    typeof f.explanation === 'string' &&
    typeof f.priority === 'number');
check('mọi finding đủ schema', schemaOk);

// --- không có undefined / NaN / null lạ ---
const dump = JSON.stringify(findings);
check('không có undefined', dump.indexOf('undefined') < 0);
check('không có NaN', dump.indexOf('NaN') < 0);

// --- dedup: cùng (ruleId, subject) không trùng ---
const seen = new Set();
let dup = false;
findings.forEach(f => {
    const key = f.ruleId + '|' + (f.subject || '');
    if (seen.has(key)) dup = true;
    seen.add(key);
});
check('không có finding trùng (ruleId+subject)', !dup);

// --- pattern rules kích hoạt trên golden chart ---
const patternIds = findings.filter(f => f.ruleId.indexOf('PATTERNS:') === 0).map(f => f.ruleId);
check('có findings từ PATTERNS', patternIds.length > 0, patternIds);

// --- heuristic L5 được gắn nhãn rõ ---
const heuristic = findings.find(f => f.ruleId === 'TOPIC_AFFINITY');
check('TOPIC_AFFINITY tồn tại cho CAREER', !!heuristic);
check('TOPIC_AFFINITY sourceType = HEURISTIC', heuristic && heuristic.sourceType === 'HEURISTIC', heuristic && heuristic.sourceType);

// --- TRUNG_CUNG_NO_SYMBOLS (L1 structural) ---
check('TRUNG_CUNG_NO_SYMBOLS tồn tại', findings.some(f => f.ruleId === 'TRUNG_CUNG_NO_SYMBOLS'));

// --- mọi finding có school/confidence ---
check('mọi finding có school', findings.every(f => typeof f.school === 'string' && f.school.length));
check('mọi finding có confidence', findings.every(f => typeof f.confidence === 'string' && f.confidence.length));

console.log('\nKết quả: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed > 0 ? 1 : 0);
